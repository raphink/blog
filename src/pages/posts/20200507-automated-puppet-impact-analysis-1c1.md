---
template: post
title: "Automated Puppet Impact Analysis"
date: "2020-05-07T20:49:52Z"
excerpt: "Using GitLab Pipelines and Catalog Diff to preview changes between two branches in a merge request"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://dev.to/camptocamp-ops/automated-puppet-impact-analysis-1c1"
devto_url: "https://dev.to/camptocamp-ops/automated-puppet-impact-analysis-1c1"
tags: ["puppet", "devops", "codequality", "showdev"]
series: "Puppet Code Quality"
---
In [last week's post](https://dev.to/camptocamp-ops/diffing-puppet-environments-1fno), I presented how to set up [Puppet Catalog Diff](https://github.com/camptocamp/puppet-catalog-diff) to diff between two Puppet environments.

Wouldn't it be great if this tool could be used to perform automatic impact analysis before merging a Git branch (aka Merge Request or Pull Request)? Well, it can.


# The Setup

Our current set up is based on [RedHat OpenShift](https://www.openshift.com/) and [GitLab](https://gitlab.com/).
This is however easily portable to other installation choices.


## Puppet Infrastructure

The Puppet infrastructure is currently running in OpenShift, using our series of [Puppet Helm Charts](https://github.com/camptocamp/charts) for Puppetserver, PuppetDB, Puppetboard and Puppet Catalog Diff Viewer.

![Puppet-related Pods](https://dev-to-uploads.s3.amazonaws.com/i/dn3718sndgu4zyrtgklv.png)

We are in the process of migrating from Puppet 5 to Puppet 6, so we currently have two Puppetserver charts deployed, one for each version. The `puppetserver` service points to two Puppet 5 pods, while the `puppetserver6` service points to two Puppet 6 pods.

We have passthrough OpenShift routes sitting in front of the services to expose them to the rest of the infra (on port 443 instead of 8140).


## Lint and Deployment

Puppet code deployment is done using a GitLab Runner chart whose deployment mounts the Puppetcode volume (PVC from the Puppetserver deployment). We then run r10k in a GitLab pipeline every time a branch is pushed.

We also lint the code before deploying it, using the [Onceover Code Quality plugin](https://github.com/declarativesystems/onceover-codequality).

![Deployment pipeline](https://dev-to-uploads.s3.amazonaws.com/i/t6o39hw6zpxdq27uhhmc.png)


Here's what it looks like in `.gitlab-ci.yml`:

```yaml
---
stages:
  - lint
  - deploy

.create_r10k_yaml: &create_r10k_yaml |
  cat << EOF > /tmp/r10k.yaml
  ---
  :cachedir: /etc/puppetlabs/code/cache

  :sources:
    :main:
      remote: $CI_PROJECT_DIR
      basedir: /etc/puppetlabs/code/environments
  EOF

linting-puppet-hiera:
  image: camptocamp/onceover-codequality:latest
  stage: lint
  script:
    - 'onceover run codequality  --no_docs'
  tags:
    - puppetmaster
  rules:
    # Skip linting if the commit message contains "[skip lint]"
    - if: '$CI_COMMIT_MESSAGE !~ /\[skip lint\]/'

r10k-deploy:
  image: puppet/r10k:3.1.0
  stage: deploy
  tags:
    # Select GitLab runner from the Puppet OpenShift env (which mounts Puppetcode)
    - puppetmaster
  before_script:
    - while [ -f /etc/puppetlabs/code/r10k.lock ]; do echo -n "Waiting for lock from "; cat /etc/puppetlabs/code/r10k.lock || echo; sleep 2; done
    - hostname -f > /etc/puppetlabs/code/r10k.lock
  script:
    - umask 0002
    # Git https secrets are mounted in the GitLab runner
    - ln -s /secrets/.netrc ~/
    - *create_r10k_yaml
    - git fetch --unshallow
    - 'git branch -r | grep -v "\->" | while read remote; do git branch --track "${remote#origin/}" "$remote"; done'
    - r10k deploy --color -c /tmp/r10k.yaml environment ${CI_COMMIT_REF_NAME} -p --verbose=debug
    - puppet generate types --environment ${CI_COMMIT_REF_NAME}
  after_script:
    - rm -f /etc/puppetlabs/code/r10k.lock
```


## Catalog Diff

When a Merge Request is open, we want to analyse the impact it will have before we can merge it. This is where Catalog Diff plays a big role.

Unless you have a huge Puppet infrastructure, Catalog Diff is quite heavy to launch, as it will request lots of catalogs in a small amount of time.

The new `--old_catalog_from_puppetdb` option introduced in version 1.7.0 reduces the load by half by getting the "from" catalogs from PuppetDB, but it's still kind of a large batch of requests to the Puppet servers.

For this reason, we run Catalog Diff only on demand, as a manual task. Lint and Deploy are run a second time, to make them mandatory passing steps before a merge can be validated.

![MR Pipeline](https://dev-to-uploads.s3.amazonaws.com/i/xlzb38uvg70hndubvrze.png)


Here's the setup:

```yaml
.create_puppetdb_conf: &create_puppetdb_conf |
  cat << EOF > /etc/puppetlabs/puppet/puppetdb.conf
  [main]
  server_urls = https://puppetdb:8081
  EOF

.create_csr_attributes_yaml: &create_csr_attributes_yaml |
  cat << EOF > /etc/puppetlabs/puppet/csr_attributes.yaml
  ---
  custom_attributes:
    # Our autosign script uses hashed secrets based on a psk,
    # the certname and the environment coded in the certificate
    1.2.840.113549.1.9.7: '$(echo -n "$psk/$(puppet config print certname)/production" | openssl dgst -binary -sha256 | openssl base64)'
  extension_requests:
    # We use the pp_authorization=catalog extension to set up auth.conf for v4/catalog
    1.3.6.1.4.1.34380.1.3.1: 'catalog'
    1.3.6.1.4.1.34380.1.1.12: 'production'
  EOF

.cleanup_cert: &cleanup_cert |
  curl -s -X  DELETE \
  "Accept:application/json" -H "Content-Type: text/pson" \
  --cacert "/etc/puppetlabs/puppet/ssl/certs/ca.pem" \
  --cert "/etc/puppetlabs/puppet/ssl/certs/$(puppet config print certname).pem" \
  --key "/etc/puppetlabs/puppet/ssl/private_keys/$(puppet config print certname).pem" \
  "https://puppetserver:8140/puppet-ca/v1/certificate_status/$(puppet config print certname)?environment=production"


catalog-diff:
  image: puppet/puppet-agent:6.15.0
  stage: diff
  tags:
    # Select GitLab runner in Puppet OpenShift env to get direct access to services
    - puppetmaster
  script:
    - apt update
    - apt install -y locales puppetdb-termini
    - locale-gen en_US.UTF-8
    - *create_puppetdb_conf
    - *create_csr_attributes_yaml
    # Generate a certificate and get it signed
    - puppet ssl submit_request --ca_server puppetserver --certificate_revocation=false
    # We currently diff with puppetserver6 for the migration
    - puppet catalog --environment ${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME} --certificate_revocation=false diff puppetserver:8140/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME} puppetserver6:8140/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME} --show_resource_diff --changed_depth 1000 --content_diff --old_catalog_from_puppetdb --certless --threads 4 --output_report /catalog-diff/mr_${CI_MERGE_REQUEST_IID}_${CI_JOB_ID}.json
  after_script:
    # We have configured our auth.conf to allow nodes to clean their own cert, see https://dev.to/camptocamp-ops/automatic-renewal-of-puppet-certificates-28pm
    - *cleanup_cert
    - echo "You can view the report details at https://puppetdiff.example.com/?report=mr_${CI_MERGE_REQUEST_IID}_${CI_JOB_ID}"
    # Post a comment on the Merge Request
    - 'curl -k -X POST -H "Private-Token: $CI_BOT_TOKEN" -d "body=You can view the Catalog Diff report details at https://puppetdiff.example.com/?report=mr_${CI_MERGE_REQUEST_IID}_${CI_JOB_ID}" $CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes'
  # Allow failure so the Merge Request can be validated even without catalog diff
  allow_failure: true
  rules:
    - if: '$CI_MERGE_REQUEST_ID'
      when: manual
  variables:
    LANG: en_US.UTF-8
    LC_ALL: en_US.UTF-8
```

A few notes on that setup:

1. PuppetDB is accessed via SSL. Since we have valid certificates to access the Puppet server, we might as well, but 8080 is ok as well if you have that possibility.

2. We use an [autosign script](https://puppet.com/docs/puppet/latest/ssl_autosign.html#enabling-policy-based-autosigning) to sign certificates using a PSK (which we hash). If it's easier for you, you could also inject a valid key and certificate into the build instead of a PSK.

3. If you don't generate a certificate, you don't need the cleanup step either.

4. The reports are saved to the `/catalog-diff` directory, which is mounted in the runner from the Puppet Catalog Diff Viewer PVC. This way, reports are accessible directly in the viewer by passing their name in the query string.

5. The Merge Request curl request requires passing a `CI_BOT_TOKEN` variable to the build. We currently set one in the build variables, using a robot GitLab account. If you have a GitLab Silver or greater plan, you can use the `CI_JOB_TOKEN` variable instead.


## What does it look like?

Here are some screenshots of a typical workflow.

![Validated Merge Request with comment](https://dev-to-uploads.s3.amazonaws.com/i/b7djk6oti87cf1iatsap.png)

*The Merge Request validated, with the comment left by the bot after the Catalog Diff build was run (see the 3 steps on line 3)*

![Puppet Catalog Diff Viewer](https://dev-to-uploads.s3.amazonaws.com/i/a87ep2w72mdbvkrdfsv8.png)

*Viewing the report generated by the Puppet Catalog Diff run*

## Demo

Here's a video demo of the setup described above:

<iframe width="560" height="315" src="https://www.youtube.com/embed/6LOaHsQDsiI" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## In summary

This set up allows us to:

* Validate code quality (lint) before deploying environments
* Check which changes will be brought to Puppet catalogs before accepting a Merge Request

As stated in the previous blog post, this doesn't account for every change, since changes in plugins (facts, types & providers, Augeas lenses, etc.) can also impact servers but won't be seen in catalog diffs.

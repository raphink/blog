---
template: post
title: "Diffing Puppet Environments"
date: "2020-05-01T14:49:22Z"
excerpt: "Puppet Catalog Diff helps to visualize the differences between two Puppet environments"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://dev.to/camptocamp-ops/diffing-puppet-environments-1fno"
devto_url: "https://dev.to/camptocamp-ops/diffing-puppet-environments-1fno"
---
[Puppet](https://puppet.com) is a great tool for configuration managements, allowing to automate hundreds to thousands of nodes at a time in an Infrastructure-as-Code approach.


# Usual Puppet Control Repository Workflow

Good practice usually encourages to use multiple environments in a Puppet setup. Usually, critical nodes are pinned to the `production` environment, while less critical nodes can be associated with staging environments.

Using Git along with a [Control Repository](https://github.com/puppetlabs/control-repo), code changes are typically produced in feature branches which get turned to Puppet environments. Once features have been tested on said environment, the feature branch can be merged into a staging branch, where the changes will start affecting nodes pinned to that Puppet environment.

Finally, once in a while, changes are merged from the staging branch into the production branch, thus affecting all nodes pinned to production.


# Code Validation

While the workflow described is helpful, validating a branch is often a lacking process. Pointing all staging nodes to a feature branch is missing the point entirely, so validation is often done manually, by identifying nodes that *may* be impacted by the change and running Puppet manually on these nodes, preferably in dry-run mode (`--noop`).

When deploying to hundreds of nodes, testing a few is hardly a guaranty that things will go well on all nodes once the branch is merged.

Fortunately for us, there are tools which can help!


# Puppet Catalog Diff

It might be hard to believe as this module is so poorly known, but the Puppet Catalog Diff project was started some 10 years ago by [R.I. Pienaar](https://www.devco.net)! [Adopted by Zack Smith](https://github.com/acidprime/puppet-catalog-diff), it was maintained for a few years, but left mainly unmaintained since 2016.

As we've used it for years (and GitHub's [octocatalog_diff](https://github.com/github/octocatalog-diff) never fit my need), we've adopted it and you will now find the latest version on our GitHub account:

{% github camptocamp/puppet-catalog-diff no-readme %}


# Installing

Puppet Catalog Diff is a standard Puppet module. You can thus install it using `puppet module install`, r10k, or even just git.

```shell
$ git clone https://github.com/camptocamp/puppet-catalog-diff.git /etc/puppetlabs/code/modules/catalog_diff
```


# What does it do?

As its name implies, Puppet Catalog Diff allows to perform diffs between Puppet catalogs.

The module provides three Puppet faces:

* `puppet catalog seed` generates catalogs from a Puppet Master (or PuppetDB)
* `puppet catalog pull` wraps around the `seed` face to retrieve catalogs from two environments for each node
* `puppet catalog diff` analyzes multiple catalogs and returns the differences per node


## Local Diff

To get started, you can diff local catalogs (in `.yaml`, `.pson`, or `.yaml` formats):

```shell
$ puppet catalog diff catalog1.pson catalog2.pson
```

will return the differences between the two catalogs.


## Diff with Catalog Retrieval

Most often, you will want to use Puppet Catalog Diff to retrieve catalogs from Puppet Masters.


### Set up


#### Generate a Certificate

Everything the Puppet world uses OpenSSL for authentication. Setting up Puppet Catalog Diff will thus require an OpenSSL certificate. This can be any certificate signed by the Puppet CA. For example, you can use the [`puppetserver ca` command](https://puppet.com/docs/puppet/latest/puppet_server_ca_cli.html) to generate a certificate:

```shell
$ puppetserver ca generate --certname catalog-diff
```

Retrieve the key and certificate.


#### Set up the Puppet Master

By default, Puppet Masters only deliver catalogs for the nodes requesting them. This is set up in the [`auth.conf`](https://puppet.com/docs/puppetserver/latest/config_file_auth.html) configuration file, with a rule like:

```ruby
{
    # Allow nodes to retrieve their own catalog
    match-request: {
        path: "^/puppet/v3/catalog/([^/]+)$"
        type: regex
        method: [get, post]
    }
    allow: "$1"
    sort-order: 500
    name: "puppetlabs catalog"
},
```

You can deploy this rule using the `puppet_authorization::rule` defined type from the [puppet_authorization](https://forge.puppet.com/puppetlabs/puppet_authorization) Puppet module.

To allow the `catalog-diff` certificate to access get any catalog from the Puppet Master, we can modify that rule:


```ruby
{
    # Allow nodes to retrieve their own catalog
    match-request: {
        path: "^/puppet/v3/catalog/([^/]+)$"
        type: regex
        method: [get, post]
    }
    allow: ["$1","catalog-diff"]
    sort-order: 500
    name: "puppetlabs catalog"
},

```

Even better yet, we can [add a certificate extension](https://puppet.com/docs/puppet/latest/ssl_attributes_extensions.html) to the catalog diff certificate, e.g. `pp_authorization: catalog` and allow this extension in `auth.conf`:

```ruby
{
    # Allow nodes to retrieve their own catalog
    match-request: {
        path: "^/puppet/v3/catalog/([^/]+)$"
        type: regex
        method: [get, post]
    }
    allow: [
        "$1",
        {
            extensions: {
                pp_authorization: "catalog"
            }
        }
    ]
    sort-order: 500
    name: "puppetlabs catalog"
},
```


### Comparing Environments

When comparing environments, Puppet Catalog Diff will connect to one or multiple Puppet Masters and get catalogs for each node.

As you may have many nodes to test, it is easier to get the list of nodes to analyze from the PuppetDB. This can be achieved with the `--use_puppetdb`, along with `--filter_old_env`. This will select all the active nodes in the Puppet associated with the first environment.

For example, if we run:

```shell
$ puppet catalog diff \
     puppet.example.com/production \
     puppet.example.com/staging \
     --use_puppetdb --filter_old_env
```

_Note (2020-05-07): Since the release of Puppet Catalog Diff 2.0.0, `--use_puppetdb` is now deprecated and `--filter_old_env` is the default._


Puppet Catalog Diff will connect to the PuppetDB, get all the active nodes from the `production` environment, and then for each of them, retrieve a catalog for the node from:

* the `production` environment on the `puppet.example.com` Puppet Master
* the `staging` environment on the `puppet.example.com` Puppet Master

It will then compute differences between each pair of catalogs and output them.




## Testing Version Upgrades

One type of check that is very necessary is testing changes between two versions of Puppet Master installations. Puppet Catalog Diff allows you to specify different masters for the two environments to compare, so you can use the following command to compare catalogs from two Puppet Masters on the same Puppet environment (provided the environment is deployed to both masters):

```shell
$ puppet catalog diff \
    puppet5.example.com/production \
    puppet6.example.com/production \
    --use_puppetdb --filter_old_env
```

# Improving Performance

Retrieving and comparing catalogs can be resource-consuming. Very often, you will want to diff a new environment (staging or feature) against a more stable one. Since we can get the nodes associated to the stable environment from PuppetDB, we might as well get the cached catalogs from PuppetDB for this branch, too. This is possible using the `--old_catalog_from_puppetdb` flag:

```shell
$ puppet catalog diff \
     puppet.example.com/production \
     puppet.example.com/staging \
     --use_puppetdb --filter_old_env --old_catalog_from_puppetdb
```

Catalogs from will retrieved from PuppetDB for the `production` environment, and from the Puppet Master for the `staging` environment.


## Tuning the diff

Several options are available to tune the diff output:

* `--show_resource_diff` will show the details of how each resource was modified
* `--content_diff` will generate a separate content diff for file contents, in addition to the parameters diff
* `--changed_depth 1000` sets the number of nodes to display at the end of the diff, sorted by amount of diffs


# Trusted Facts and Certless Requests

Puppet provides a special variable named `$trusted` and called [Trusted Facts](https://puppet.com/docs/puppet/latest/lang_facts_builtin_variables.html#trusted-facts). This variable contains information from the Puppet certificate. This allows the Puppet Master to get informations, such as the certname or the certificate extensions, and be sure that they could not be falsified.

However, using these trusted facts in your Puppet code (or Hiera hierarchy) breaks compilation with Puppet Catalog Diff, since the catalog diff's certificate does not contain these trusted variables.

If you are using Puppet 6.3 or up on your Puppet Master, you can make use of the new [certless catalog API](https://puppet.com/docs/puppetserver/latest/puppet-api/v4/catalog.html) to bypass this restriction.

## Setup

Since this uses a different API endpoint, we need to set up `auth.conf` for it, for example:

```ruby
{
    # Allow nodes to retrieve their own catalog
    match-request: {
        path: "^/puppet/v4/catalog"
        type: regex
        method: [post]
    }
    allow: [
        {
            extensions: {
                pp_authorization: "catalog"
            }
        }
    ]
    sort-order: 500
    name: "puppetlabs certless catalog"
},
```

## Usage

The `--certless` flag will tell Puppet Catalog Diff to use the new certless catalog API in place of the standard one.

For example, you can retrieve the old catalogs from PuppetDB and the new catalogs from the certless catalog API:


```shell
$ puppet catalog diff \
     puppet.example.com/production \
     puppet.example.com/staging \
     --use_puppetdb --filter_old_env \
     --old_catalog_from_puppetdb --certless
```


# CI Integration

If you are using a Continuous Integration platform, you can get advantage of it by integrating your Puppet control repository into it with Puppet Catalog Diff.

While general [Code Quality tasks](https://dev.to/camptocamp-ops/cleaning-up-puppet-code-4da2) can be launched in a pipeline before deploying the code, Puppet Catalog Diff is typically a task that can be lauched in a merge request.

For example, you can launch the following command in a GitLab CI job:

```shell
$ puppet catalog diff \
     puppet.example.com/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME} \
     puppet.example.com/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME} \
     --show_resource_diff --content_diff --changed_depth 1000 \
     --use_puppetdb --filter_old_env --old_catalog_from_puppetdb \
     --certless --threads 4 \
     --output_report /srv/catalog-diff/mr_${CI_MERGE_REQUEST_IID}_${CI_JOB_ID}.json
```

The `--output_report` option saves the output as a JSON document, which can be used later on.


# Limitations

Puppet Catalog Diff compares Puppet catalogs. However, catalog changes do not account for all changes in a Puppet agent run. Plugins can play a role, too.

If your change involves a change in agent-side plugins (facts, types & providers, augeas lenses), Puppet Catalog Diff won't allow you to predict the result of these changes.


# Visualizing changes

Changes in Puppet code sometimes generate a lot of diff, which can be hard to parse in text form.

The [Puppet Catalog Diff Viewer](https://github.com/camptocamp/puppet-catalog-diff-viewer) project allows to visualize Puppet Catalog Diff reports (as generated by `--output_report` option) in a Web UI.

{% github camptocamp/puppet-catalog-diff-viewer no-readme %}

This interface is currently read-only, with no persistence.

![Puppet Catalog Diff Viewer](https://dev-to-uploads.s3.amazonaws.com/i/b73sm2n5ie2yip4hh427.png)


Let me know how you use Puppet Catalog Diff, and, as usual, we welcome Pull Request!

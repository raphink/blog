---
template: post
title: "Templating Puppet Control Repositories"
date: "2020-07-21T08:45:28Z"
excerpt: "When managing multiple Puppet Control Repositories, modulesync is a very useful tool to keep files in sync."
thumb_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://dev.to/camptocamp-ops/templating-puppet-control-repositories-3pk7"
devto_url: "https://dev.to/camptocamp-ops/templating-puppet-control-repositories-3pk7"
tags: ["puppet", "devops", "cfgmgmt", "tutorial"]
---
Puppet code is usually deployed using a [Control Repository](https://github.com/puppetlabs/control-repo), a single Git repository used by R10k (or Code Manager on Puppet Enterprise) to manage Puppet environments on Puppet Masters.


# Why multiple Control Repositories?

On complex infrastructures with multiple independent Puppet Masters, you might have the need to use multiple control repositories. For example at Camptocamp, we have specific clients with enough nodes to have their own Puppet infrastructure each.

For these clients, we do not want to use a shared Puppet Control Repository. However, we do want to keep the code as similar as possible between the infrastructures, and make sure some parameters and settings (admin accounts, ssh keys, etc.) are synchronized.


# Modulesync to the rescue

Modulesync is a piece of software initially created by Puppet Inc. to synchronize files between Git repositories for Puppet modules. Nowadays, this feature is being served by PDK for Puppet modules, so modulesync is now [managed by the Vox Pupuli community](https://github.com/voxpupuli/modulesync/).

For years, we have been using it at Camptocamp to keep our Control Repositories synchronized.

In order to achieve this, we use a template repository, which we call `puppetmaster-common`. 

Each of our clients has their own GitLab instance with their Puppet Control Repository, and this template repository brings it all together. 

This repository is set as follows.

## modulesync.yml

This file contains the general settings for modulesync:

```yaml
---
# default namespace in GitLab instances
namespace: 'camptocamp'
# Branch to synchronize
branch: 'msync'
# Default Merge Request title
pr_title: 'Modulesync [autodiff]'
# Default Merge Request target branch
pr_target_branch: 'staging'
```

On all our Control Repositories, we have locked the `stable` and `staging` branches to prevent pushes to them. This forces us to create Merge Requests for new features, ensuring quality [through our CI pipeline](https://dev.to/camptocamp-ops/automated-puppet-impact-analysis-1c1).

For this reason, we use a separate branch, called `msync`, to perform the synchronizations.


## managed_modules.yml

Since we use several GitLab instances and we want to be able to automate Merge Request creation, this file contains GitLab API URLs and tokens per managed Control Repository. It looks similar to this:

```yaml
puppetmaster-c2c:
  :remote: 'ssh://git@gitlab1/camptocamp/is/puppet/puppetmaster-c2c.git'
  :namespace: 'camptocamp/is/puppet'
  :gitlab:
    :token: 'abc123def456'
    :base_url: 'https://gitlab1/api/v4'

puppetmaster-client1:
  :remote: 'ssh://git@gitlab-client1/puppet/puppetmaster-client1.git'
  :namespace: 'puppet'
  :gitlab:
    :token: 'someOtherToken'
    :base_url: 'https://gitlab-client1/api/v4'
```

## moduleroot

The `moduleroot` directory contains the files we want to synchronize, as ERB templates. In our case:

```
moduleroot/
├── doc
│   ├── architecture.md.erb
│   └── before_after.md.erb
├── environment.conf.erb
├── Gemfile.erb
├── .gitignore.erb
├── .gitlab-ci.yml.erb
├── hieradata
│   └── cross-site
│       ├── common-cross-site.yaml.erb
│       ├── README.md.erb
│       ├── .travis.yml.erb
│       └── verify-key-length.erb
├── hiera-eyaml-gpg.recipients.erb
├── Puppetfile.erb
├── .puppet-lint.rc.erb
├── Rakefile.erb
├── README.md.erb
└── scripts
    ├── bolt.erb
    ├── docker.erb
    ├── node_deactivate.erb
    ├── puppetca.erb
    └── puppet-query.erb
```

A few notes here on the files here.

### Static files

Most of these files (e.g. the scripts, `Gemfile`, or `environment.conf`) are actually static, but they need to be named `.erb` nonetheless, otherwise `modulesync` will ignore them.

### hiera-eyaml-gpg.recipients

`hiera-eyaml-gpg.recipients.erb` works essentially as a filter on the `hiera-eyaml-gpg.recipients` file at the top of the repository, taking every admin key, as well as one `puppet@` key specified in the `.sync.yml` of the control repository with the `master_gpg_key` setting:


```erb

<%=
basedir = File.expand_path('..', File.dirname(__FILE__))
recipients_file = File.expand_path(File.join(basedir, 'hiera-eyaml-gpg.recipients'))

File.readlines(recipients_file).map { |l|
  r = l.strip
  if r =~ /^puppet@/
    r if @configs['master_gpg_key'] == r
  else
    r
  end
}.compact.join("\n")
%>
```

### Puppetfile

Similar to `hiera-eyaml-gpg.recipients`, `Puppetfile` is managed as a filter. We keep a full `Puppetfile` at the top of the repository, with all the modules we use on all Puppet Infrastructures, and the default versions we want. Then each Control Repository can pick which module to include and optionally override versions.

The `Puppetfile.erb` template uses Augeas to cleanly filter and rewrite the target `Puppetfile`:

```erb
###############################################
# This file is managed in puppetmaster-common #
# Do not edit locally                         #
###############################################

<%= require 'augeas'
basedir = File.expand_path('..', File.dirname(__FILE__))
base_pf = File.expand_path(File.join(basedir, 'Puppetfile'))
base_pf_content = File.read(base_pf)
lens_dir = File.expand_path(File.join(basedir, 'lenses'))

def mod_regexp(name)
  "*[label()!='#comment' and .=~regexp('([^/-]+[/-])?#{name}')]"
end

Augeas.open(nil, lens_dir, Augeas::NO_MODL_AUTOLOAD) do |aug|
  aug.set('/input', base_pf_content)
  unless aug.text_store('Puppetfile.lns', '/input', '/parsed')
      msg = aug.get('/augeas//error')
      fail "Failed to parse common Puppetfile: #{msg}"
  end
  aug.set('/augeas/context', '/parsed')
  all_modules = aug.match('*[label()!="#comment"]').map { |m| aug.get(m).split(%r{[/-]}).last }

  whitelist = @configs['modules'].keys if @configs['modules']
  not_in_all = whitelist - all_modules if whitelist
  fail "Module(s) #{not_in_all.join(', ')} not found in common Puppetfile" if not_in_all and !not_in_all.empty?

  # Remove unnecessary modules
  (all_modules - whitelist).each do |m|
    aug.rm(mod_regexp(m))
  end if whitelist

  # Amend
  modified = @configs['modules'].reject { |m, v| v.nil? } if @configs['modules']
  modified.each do |m, c|
    aug.set(mod_regexp(m), "#{c['user']}/#{m}") if c['user']
    if c['version']
      aug.rm("#{mod_regexp(m)}/git")
      aug.rm("#{mod_regexp(m)}/ref")
      aug.set("#{mod_regexp(m)}/@version", c['version'])
    else
      aug.rm("#{mod_regexp(m)}/@version")
      aug.set("#{mod_regexp(m)}/git", c['git']) if c['git']
      aug.set("#{mod_regexp(m)}/ref", c['ref']) if c['ref']
    end
  end if modified

  aug.text_retrieve('Puppetfile.lns', '/input', '/parsed', '/output')
  unless aug.match('/augeas/text/parsed/error').empty?
    fail "Failed to generate Puppetfile: #{aug.get('/augeas/text/parsed/error')}
  #{aug.get('/augeas/text/parsed/error/message')}"
  end
  aug.get('/output')
end -%>
```

### .gitlab-ci.yml.erb

This file defines the CI/CD pipelines for our Control Repositories, extending our [generic Puppet pipelines rules](https://github.com/camptocamp/puppet-gitlabci-pipelines). It takes variables to control catalog-diff.

### cross-site hieradata

The cross-site hieradata level contains common system accounts with their UID, shell & SSH key. We then use [our accounts module](https://forge.puppet.com/camptocamp/accounts) to deploy these accounts. 


# Sample .sync.yml

Each Control Repository features a `.sync.yml` file to provide overrides for variables. Here's an example:

```yaml
---
Rakefile:
  master_gpg_key: 'puppet@client1'
.gitlab-ci.yml:
  puppetdb_urls: 'https://puppetdb.client1.ch'
  puppet_server: 'puppet.client1.ch'
  puppetdiff_url: 'https://puppetdiff.client1.ch'
Puppetfile:
  modules:
    # include accounts module, with default version
    accounts:
    # include letsencrypt module, override version
    letsencrypt:
      git: 'https://github.com/saimonn/puppet-letsencrypt'
      ref: 'default_cert_name'
```


# Usage

Since `managed_modules.yml` contains secret tokens for the various GitLabs, we don't want to commit it to the Git repository. Instead, the content of this file is stored in [`gopass`](https://github.com/gopasspw/gopass) and retrieved dynamically with [`summon`](https://github.com/cyberark/summon).

In order to use `summon`, we have a local `secrets.yml` pointing to the location of the `managed_modules.yml` file in `gopass`:

```yaml
---
MSYNC_MANAGED_MODULES: !var:file puppet/msync/managed_modules
```

and use a `msync_update` wrapper to launch `modulesync`:

```bash
#!/bin/bash

bundle exec msync update --managed_modules_conf=$MSYNC_MANAGED_MODULES "$@"
```

This then allows to test the changes with:

```shell
$ summon ./msync_update -m "Update module foo" --noop
```

and then deploy on a single site (or all without the filter):

```shell
$ summon ./msync_update -m "Update module foo" -f c2c --pr
```


*Do you have specific Puppet needs? [Contact us](https://www.camptocamp.com/contact), we can help you!*

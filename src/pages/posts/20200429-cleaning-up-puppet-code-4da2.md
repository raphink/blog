---
template: post
title: "Cleaning up Puppet Code"
date: "2020-04-29T10:54:01Z"
excerpt: "Code quality is important to ensure style consistency and easy maintenance. Puppet-lint, Onceover and puppet-ghostbuster help ensure Puppet code quality."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://www.camptocamp.com/actualite/cleaning-up-puppet-code/"
devto_url: "https://dev.to/camptocamp-ops/cleaning-up-puppet-code-4da2"
---
After months and years of using [Puppet](https://puppet.com/), the code base becomes increasingly complex and cluttered. How can you ensure its quality, as well as clean up unused code?

# puppet-lint

In the Puppet world, [puppet-lint](http://puppet-lint.com/) is the reference for code quality. It is used as a standard to check that modules follow the [style guide](https://puppet.com/docs/puppet/5.5/style_guide.html), ensuring consistency in coding style and practices. puppet-lint can also be used in your control repository, to check your private modules (such as [roles & profiles](https://puppet.com/docs/pe/latest/the_roles_and_profiles_method.html)).

There's at least three ways of achieving this: using [PDK](https://puppet.com/docs/pdk/1.x/pdk.html), a `Rakefile`, or [onceover](https://github.com/dylanratcliffe/onceover) along with its [code quality plugin](https://github.com/declarativesystems/onceover-codequality).

## PDK

[PDK](https://puppet.com/docs/pdk/1.x/pdk.html), the standard tool to manage Puppet modules in a standard way, also works with control repositories. Once [installed](https://puppet.com/docs/pdk/1.x/pdk_install.html), you can convert your control repository and run validation tests with:

```shell
$ pdk convert
$ pdk validate
```

## Rakefile method

The `Rakefile` method is [a easy way](https://github.com/rodjek/puppet-lint#testing-with-puppet-lint-as-a-rake-task) to automate `puppet-lint`:

```ruby
Rake::Task[:lint].clear
PuppetLint::RakeTask.new :lint do |config|
  config.ignore_paths = [
    'modules/**/*.pp',
    'vendor/**/*',
  ]
  config.disable_checks = [
    '80chars',
    'documentation',
  ]
  config.fail_on_warnings = true
  config.fix = true if ENV['PUPPETLINT_FIX'] == 'yes'
end
```

Add a `Gemfile` in your repository to install `puppet-lint`:

```ruby
source ENV['GEM_SOURCE'] || "https://rubygems.org"

group :development, :test do
  gem 'rake',                                             :require => false
  gem 'puppet-lint',                                      :require => false
  
  # Other lint plugins (optional)
  gem 'puppet-lint-spaceship_operator_without_tag-check', :require => false
  gem 'puppet-lint-unquoted_string-check',                :require => false
  gem 'puppet-lint-undef_in_function-check',              :require => false
  gem 'puppet-lint-leading_zero-check',                   :require => false
  gem 'puppet-lint-trailing_comma-check',                 :require => false
  gem 'puppet-lint-file_ensure-check',                    :require => false
  gem 'puppet-lint-version_comparison-check',             :require => false
  
  # You can also use the voxpupuli-test gem,
  # which pulls rake, puppet-lint & plugins as dependencies
  gem 'voxpupuli-test',                                   :require => false
end
```


You can then run the lint with:

```shell
$ bundle install --path vendor/bundle $ bundle exec rake lint
# And if you want to autofix the detected mistakes
$ PUPPETLINT_FIX=yes bundle exec rake lint
```

## Onceover Code Quality

[Onceover](https://github.com/dylanratcliffe/onceover) is a toolbox to automate tasks for Puppet control repositories. Among other things, its code quality plugin allows to run syntax checks and invoke `puppet-lint`.

In order to use it, update your `Gemfile`, e.g.:

```ruby
source ENV['GEM_SOURCE'] || "https://rubygems.org"

group :development, :test do
  gem 'voxpupuli-test',                                   :require => false
  
  gem 'onceover',                                         :require => false
  gem 'onceover-codequality',                             :require => false
end
```

Refresh your bundle and run onceover:

```shell
$ bundle update $ bundle exec onceover run codequality --no-docs
```

Ideally, run this on every commit in a Continuous Integration/Continuous Deployment setup. At Camptocamp, we use a [GitLab CI](https://docs.gitlab.com/ee/ci/) pipeline to check our control repo using Onceover before deploying it with [r10k](https://github.com/puppetlabs/r10k) (also running a GitLab CI runner).

![PuppetMaster Pipeline in GitLab CI](https://www.camptocamp.com/wp-content/uploads/puppetmaster_pipeline.png)

# Getting rid of dead code

You've checked the quality of your existing code. Good! But what if you're actually maintaining and cleaning code that you don't use anymore? This would be quite the waste of time... At Camptocamp, we've built on `puppet-lint` to provide a system to detect unused code and help us clean it up. 

This is what the [puppet-ghostbuster](https://github.com/camptocamp/puppet-ghostbuster) project is for. Under the hood, `puppet-ghostbuster` is a collection of `puppet-lint` plugins, distributed in a single `puppet-ghostbuster` gem.

These plugins analyze your Puppet code and then connect to your PuppetDB to check if that code is actually used for any known node. It can also check Hiera data for unused keys. Just as previously, you can set it up as a Rake task, but our current setup requires a [patch](https://github.com/rodjek/puppet-lint/pull/919) to `puppet-lint` in order to whitelist the `puppet-lint` checks activated (the current release of `puppet-lint` only supports blacklisting checks in Rake tasks).

```ruby
source ENV['GEM_SOURCE'] || "https://rubygems.org"

group :development, :test do
  gem 'rake',                                             :require => false
  gem 'puppet-lint',                                      :require => false,
    :git => 'https://github.com/raphink/puppet-lint',
    :ref => '2cac4fb'   # Includes patch for whitelisting checks
  gem 'puppet-ghostbuster',                               :require => false
end
```

You can then set up a Rake task such as this one:

```ruby
PuppetLint::RakeTask.new :ghostbuster do |config|
  config.pattern = ['./site/**/*']
  config.only_checks = [
    'ghostbuster_classes',
    'ghostbuster_defines',
    'ghostbuster_facts',
    'ghostbuster_files',
    'ghostbuster_functions',
    'ghostbuster_hiera_files',
    'ghostbuster_templates',
    'ghostbuster_types',
  ]
  config.fail_on_warnings = true
end
```

`puppet-ghostbuster` requires info to connect to your PuppetDB, so you need to provide the following environment variables:

-   `PUPPETDB_URL`: URLs to PuppetDB
-   `PUPPETDB_CERT_FILE`: path to the certificate to use to connect to
    PuppetDB
-   `PUPPETDB_KEY_FILE`: path to the key to use to connect to PuppetDB
-   `PUPPETDB_CACERT_FILE`: path to the Puppet CA certificate
-   `HIERA_YAML_PATH`: path to `hiera.yaml` to use

If you don't want to provide certificates and keys, you can connect to the PuppetDB through the unencrypted port 8080, for example by forwarding it through SSH. At Camptocamp, we're automating this setup by using [summon](https://github.com/cyberark/summon) as a wrapper to launch the command.

We store the certificates and keys to connect to PuppetDB in [gopass](https://github.com/gopasspw/gopass), then provide a `secrets.yml` file like so:

```yaml
PUPPETDB_URL: https://puppetdb.example.com:8081
PUPPETDB_CERT_FILE: !var:file path/to/secret:cert
PUPPETDB_KEY_FILE: !var:file path/to/secret:key
PUPPETDB_CACERT_FILE: !var:file path/to/secret:cacert
HIERA_YAML_PATH: ./hiera.yaml
```

Which allows to run:

```shell
$ summon bundle exec rake ghostbuster
```

This returns a list of classes, defines, files, templates, etc. that are unused in our code. We can then check these results and clean up our code! 

Do you have ideas to contribute to `puppet-ghostbuster`? [Pull requests are welcome](https://github.com/camptocamp/puppet-ghostbuster)! You can also [contact us](https://www.camptocamp.com/contact/) for quotes on Puppet consulting or [training](https://www.camptocamp.com/formations/)!

*This post was originally published on [https://www.camptocamp.com/actualite/cleaning-up-puppet-code/](https://www.camptocamp.com/actualite/cleaning-up-puppet-code/)*

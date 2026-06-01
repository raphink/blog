---
template: post
title: "All the ways to manage files with Puppet"
date: "2020-06-08T21:12:50Z"
excerpt: "Puppet has many tools to manage configuration files. Knowing them can help you choose the one that best fits your needs."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fllt1le7b54wy0459shs1.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fllt1le7b54wy0459shs1.png"
canonical_url: "https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4"
devto_url: "https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4"
---
"[Everything is a file](https://en.wikipedia.org/wiki/Everything_is_a_file)" is a very famous Unix principle. And because of this, most of configuration management on Unix/Linux revolves around managing files.

# Know your Tools <a name="tools"></a>

Puppet, as a configuration management tool, is no exception to this. As a consequence, there are many ways to manage configuration files with Puppet. They all have a reason to exist, and a purpose to fulfill.

![Know your tools](https://dev-to-uploads.s3.amazonaws.com/i/rd2gpnxaq87rvgl5vz0j.jpg)

Knowing your tools is the object of this blog post, with the following topics:


* [Know your Tools](#tools)
* [File Management Approaches](#approaches)
* [Managing Whole Configurations](#whole-cfg)
  - [Static Content](#whole-static)
    + [Deploying Scripts and Binary Data](#whole-static-scripts)
    + [Beware of Source](#whole-static-source)
  - [Dynamic Content](#whole-dynamic)
    + [Purgeable Types](#whole-dynamic-purge)
    + [Content from One Scope](#whole-dynamic-onescope)
    + [Content from Multiple Scopes](#whole-dynamic-multiscope)
      * [Includes](#whole-dynamic-multiscope-includes)
      * [Concat](#whole-dynamic-multiscope-concat)
    + [Content from an Example File](#whole-dynamic-example)
* [Managing Partial Configurations](#partial-cfg)
  - [Native Types](#partial-native)
  - [Includes](#partial-includes)
  - [The Augeas Type](#partial-augeas)
  - [File line](#partial-fileline)
* [Conclusion](#conclusion)


# File Management Approaches <a name="approaches"></a>

Let's start with a first choice when managing files:

* managing the whole configuration
* managing partial configurations

Many practitioners I've met consider that managing whole configurations is the only acceptable way of proceeding, since managing partial configuration does not lead to a predictable final state. 

However, managing whole configurations often leads to managing defaults which were carefully chosen for your GNU/Linux distribution and were perfectly fine to keep. It also leads to maintaining lots of different defaults in modules to try and stay as close as possible to the distribution standards when using default values.

So both approaches have pros and cons.


# Managing Whole Configurations <a name="whole-cfg"></a>

This is the approach you take when you want to control the full content of the software configuration. This does not mean however that everything has to fit into a single file; the configuration might be split, and splitting often makes configuration management more flexible.


## Static Content <a name="whole-static"></a>

The easiest case is without doubt managing static content, when your file is always the same.

However simple this might seem, there can still be tricks.


### Deploying Scripts and Binary Data <a name="whole-static-scripts"></a>

For example, scripts and binary blobs can easily be managed this way in Puppet, and we often see code such as:

```puppet
file { '/usr/local/bin/myscript.sh':
  ensure => file,
  source => "puppet:///modules/${module_name}/myscript.sh",
}
```

That works fine, but if you're trying to deploy a software (maybe even with a tarball, using the [`puppet-archive`](https://forge.puppet.com/puppet/archive) module), it's probably better to package it for your distribution and use your package manager (apt/yum/etc.) as the deployment layer. You'll get a much simpler Puppet code, usually better performance, and you'll rely on the package manager's metadata for idempotence:

```puppet
package { 'myscript':
  ensure => present,
}
```

Another possibility is using the [`puppetlabs-vcsrepo`](https://forge.puppet.com/puppetlabs/vcsrepo) resource type. The VCS (e.g. Git) will then provide the metadata to ensure idempotence, e.g.:

```puppet
vcsrepo {'/usr/src/ceph-rbd-backup':
  ensure   => latest,
  provider => 'git',
  source   => 'https://github.com/camptocamp/ceph-rbd-backup',
  revision => 'master',
}
```


### Beware of Source <a name="whole-static-source"></a>

When using the `file` type to deploy static content, it is quite common to use the `source` attribute to specify the file to copy:

```puppet
file { '/srv/foo':
  ensure => file,
  source => "puppet:///modules/${module_name}/foo",
}
```

This makes use of the Puppetserver's [fileserver feature](https://puppet.com/docs/puppet/latest/config_file_fileserver.html). When using this syntax, every Puppet run will result in a `file_metadata` HTTP request to the Puppetserver for each file managed, just to get the metadata necessary to decide whether the file needs to be replaced or not.

When many files are managed this way on many agents, this results in lots of HTTP requests being made during catalog application, which will saturate the Puppetserver's JRuby threads and prevent them from processing catalog compilations and reports instead.

Instead, when deploying non-binary content, you can use the `file()` function with a relative path:

```puppet
file { '/srv/foo':
  ensure  => file,
  content => file("${module_name}/foo"),
}
```

This is totally equivalent to the previous syntax, except the whole file will be included in the catalog, instead of just a pointer to the fileserver.


## Dynamic Content <a name="whole-dynamic"></a>

Very often, static content is not enough to configure your software. You need variables, and a more flexible approach.


### Purgeable Types <a name="whole-dynamic-purge"></a>

Native Puppet Ruby types are probably the most flexible way of managing a configuration, as they provide a very fine-grained interface to edit configuration files.

However, they do not manage the whole configuration by default. That is, unless you can use purging with them.

Purging resources in Puppet requires two conditions:

* a type which supports listing instances (at least one provider has a `self.instances` method defined)
* a parameter that can ensure the resource's absence

When both these conditions are met, Puppet can purge the resources it doesn't explicitly manage by:

* listing all known resources (using the `self.instances` method)
* setting all of them to be absent by default
* overriding the presence with the catalog's explicit resource parameters


There are two main ways of achieving this:

* using the standard `resources` type
* using the [`crayfishx-purge`](https://forge.puppet.com/crayfishx/purge) module


The `resources` type fits basic needs, by allowing to purge all resources not managed by Puppet. For example:

```puppet
host { 'localhost':
  ensure => present,
  ip     => '127.0.0.1',
}

resources { 'host':
  purge => true,
}
```

will purge all entries in `/etc/hosts` except for localhost.

The `resources` resource type also allows to set exceptions, though only for the `user` type:

```puppet
resources { 'user':
  purge              => true,
  unless_system_user => true,
}
```

This is a hard limitation, which the [`purge` type](https://forge.puppet.com/crayfishx/purge) fixes by providing a more flexible interface, allowing to set:

* fine conditions for purging resources
* which parameter and value to use for purging.

For example:

```puppet
purge { 'mount':
  state  => unmounted,
  unless => ['name', '==', ['/', '/var', '/home']],
}
```

will unmount all file systems that are not managed by Puppet, unless they are mounted on `/`, `/var` or `/home`.

In order to manage configurations in full, the `purge` type can be used with native types that manage configuration file stanzas and know how to list instances.

This is the case of:

* the [`host` type](https://puppet.com/docs/puppet/5.5/types/host.html)
* the [`mailalias` type](https://puppet.com/docs/puppet/5.5/types/mailalias.html)
* most [Augeasproviders types](http://augeasproviders.com/)


For example, you can manage `sshd_config` in full using the [`herculesteam-augeasproviders_ssh`](https://forge.puppet.com/herculesteam/augeasproviders_ssh) module with code such as:

```puppet
sshd_config {
  'X11Forwarding':
    value => 'yes',
    ;

  'UsePAM':
    value => 'no',
    ;
}

purge { 'sshd_config': }
```


### Content from One Scope <a name="whole-dynamic-onescope"></a>


When there are no purgeable types for your configuration file type, and you need to manage the content from a single scope (a single Puppet class), the most obvious option is to use a simple `file` resource with a template. Prefer [EPP templates](https://puppet.com/docs/puppet/5.5/lang_template_epp.html) these days, as they are easier and safer than ERB templates:

```puppet
file { '/path/to/foo':
  ensure  => file,
  content => epp(
    "${module_name}/foo.epp",
    {
      var1 => 'value1',
      var2 => 'value2',
    }
  ),
}
```

### Content from Multiple Scopes <a name="whole-dynamic-multiscope"></a>

When your content needs to come from multiple scopes, a single `file` resource won't suffice.

#### Includes <a name="whole-dynamic-multiscope-includes"></a>

If you're lucky and your configuration format supports include statements, this is the easiest way to go. For example:

```puppet
# Deploy a static file to perform the inclusion
file { '/etc/sudoers':
  ensure  => file,
  content => '#includedir /etc/sudoers.d',
}

# Deploy each rule as a separate file in the directory
file { '/etc/sudoers.d/defaults_env':
  ensure  => file,
  content => 'Defaults env_reset',
}

file { '/etc/sudoers.d/foo':
  ensure  => file,
  content => 'foo ALL=(ALL:ALL) ALL',
}

# Let Puppet purge the directory of all unknown files
file { '/etc/sudoers.d':
  ensure => directory,
  purge  => true,
}
```

#### Concat <a name="whole-dynamic-multiscope-concat"></a>

Many configuration formats don't support includes: everything has to be in a single file. Managing such a file from multiple scopes requires the use of a concat module.

The most used concat module is the official [`puppetlabs-concat`](https://forge.puppet.com/puppetlabs/concat). It lets you declare a target file where all fragments will be concatenated, and then deploy multiple fragments tagged for this target. For example, the sudoers example above is roughly equivalent to:

```puppet
concat { '/etc/sudoers':
  ensure => present,
}

concat::fragment { 'defaults_env':
  target  => '/etc/sudoers',
  content => 'Defaults env_reset',
  order   => '01',
}

concat::fragment { 'foo':
  target  => '/etc/sudoers',
  content => 'foo ALL=(ALL:ALL) ALL',
  order   => '10',
}
```

Each fragment is deployed separately to the agent, then concatenated to generate the final file.


### Content from an Example File <a name="whole-dynamic-example"></a>

A few years ago, I experimented with yet another option to manage full dynamic content, without losing the benefit of sane distribution defaults.

The [`camptocamp-augeas_file`](https://forge.puppet.com/camptocamp/augeas_file) resource type allows to use a local file on the Puppet agent as a template on which Augeas changes are applied to generate the final file:


```puppet
augeas_file { '/etc/apt/sources.list.d/jessie.list':
  lens    => 'Aptsources.lns',
  base    => '/usr/share/doc/apt/examples/sources.list',
  changes => ['setm ./*[distribution] distribution jessie'],
}
```

Every time the Puppet agent runs, it will use `/usr/share/doc/apt/examples/sources.list` as a template and apply the `changes` using Augeas to generate `/etc/apt/sources.list.d/jessie.list`. The target file is only written if any changes occur, making it idempotent. If the template changes (e.g. after a package upgrade), the target will be regenerated.


# Managing Partial Configurations <a name="partial-cfg"></a>

Partial configurations have less options to be managed. They're essentially light versions of the options cited above:

## Native types <a name="partial-native"></a>

Just as [for full configurations](#whole-dynamic-purge), you can use native puppet types (`host`, `mailalias`, Augeasproviders types, etc.), without purging them.

In addition, since you don't mind managing files partially, you can also use types which don't support purging, such as [`ini_setting`](https://forge.puppet.com/puppetlabs/inifile) for INI file types:

```puppet
ini_setting { "sample setting":
  ensure  => present,
  path    => '/tmp/foo.ini',
  section => 'bar',
  setting => 'baz',
  value   => 'quux',
}
```

or the [`shellvar` type](https://forge.puppet.com/herculesteam/augeasproviders_shellvar) for shell configuration files:

```puppet
shellvar { "ntpd options":
  ensure   => present,
  target   => "/etc/sysconfig/ntpd",
  variable => "OPTIONS",
  value    => "-g -x -c /etc/myntp.conf",
}
```


## Includes <a name="partial-includes"></a>


Includes work just as for [whole configurations](#whole-dynamic-multiscope-includes), but without purging the directory.


## The Augeas Type <a name="partial-augeas"></a>

If no Augeasproviders exists for your resource type, but Augeas has an [available lens](https://augeas.net/stock_lenses.html) for your configuration format, then you can most likely use the [`augeas` resource type](https://puppet.com/docs/puppet/5.5/types/augeas.html) to manipulate it.

This is often used to manipulate XML configurations for example:

```puppet
augeas {'foo.xml':
  incl    => '/tmp/foo.xml',
  context => '/files/tmp/foo.xml/foo',
  lens    => 'Xml.lns',
  changes => [
    'set bar/#text herp',
  ],
}
```

## File_line <a name="partial-fileline"></a>


I've kept `file_line` for the end of this list, because this is really the last option you might want to consider (just like `exec`) since has many downfalls.

However, if you got this far, you're probably either:

* trying to patch a packaged software, which is a very nasty thing to do; it's much better to repackage it properly (and send the patch to the maintainer 😁, that's how Open-Source works!)
* edit a weird configuration file such as `.bashrc` (which the `shellvar` type usually parses rather fine) or some kind of PHP or Perl configuration… I don't envy you if you have no option of using templates/concat for that!


# Conclusion <a name="conclusion"></a>

There are many tools to manage files in Puppet.

Do you have other modules/resource types you like to use for this? Let me know in the comments!

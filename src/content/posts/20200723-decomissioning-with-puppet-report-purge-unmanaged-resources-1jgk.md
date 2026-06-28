---
template: post
title: "Decomissioning with Puppet: report & purge unmanaged resources"
date: "2020-07-23T14:42:09Z"
excerpt: "Puppet can let you purge resources you do not manage explicitely"
thumb_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://dev.to/camptocamp-ops/decomissioning-with-puppet-report-purge-unmanaged-resources-1jgk"
devto_url: "https://dev.to/camptocamp-ops/decomissioning-with-puppet-report-purge-unmanaged-resources-1jgk"
tags: ["puppet", "devops", "cfgmgmt", "tutorial"]
---
Puppet lets you manage resources explicitely. But did you know you can also dynamically purge unmanaged resources using Puppet?


# Why?

A user in your organization just left, and you need to remove their account from all nodes. If you were managing their account with Puppet —whether with a `user` resource type or using an [accounts module](https://forge.puppet.com/modules?q=accounts)—, you need to make sure this user is absent:


```puppet
user { 'jdoe':
  ensure => absent,
}
```

Great. Job done. Now, how long should this resource be kept in your code? One hour? One week? One year? What if an old node that was turned off wakes up months from now with this account activated?

To be honest, if a node turned off for months suddenly wakes up, you'll probably have more issues than just old users if your Puppet code base is quite active…
However, purging all unknown users would be a much easier approach than managing them explicitely!


# How?

As explained [in a previous post about managing files in Puppet](https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4#whole-dynamic-purge), Puppet has the ability of purging unmanaged resources. I'll let you see the post for more explanations on how this works:

[https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4#whole-dynamic-purge](https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4#whole-dynamic-purge)


# What if I don't want to purge?

What if instead of purging, I'd just like Puppet to report the unmanaged resources but not do anything about them?

Luckily for us, `noop` works fine with the `purge` type, so you can use something like:

```puppet
purge { 'user':
  noop   => true,
  unless => [
    ['uid', '<', '1000'],
    ['name', '==', 'nobody'],
  ],
}
```

This code will mark all users with a UID above 999 (except the `nobody` user) to be purged, but it won't do it. As a result, you'll get `noop` resources in your reports, for example in Puppetboard:

![Noop resources](https://dev-to-uploads.s3.amazonaws.com/i/3xu0q5i3e98bv27ih117.png)

And then in the report, you'll see the unmanaged users:

![Report view](https://dev-to-uploads.s3.amazonaws.com/i/ckpsim9bx6igwp09it4l.png)


# Forcing purge

If you see users that should be purged, you can add again a `user` resource in your Puppet code to ensure their absence:

```puppet
user { 'iperf':
  ensure => absent,
}
```

Another option is to make it a bit more dynamic. I've added an option in my `accounts` base class to use a dynamic fact to purge users on demand:

```puppet
class osbase::accounts (
  Boolean $purge_users = str2bool($facts['purge_users']),
) {
  purge { 'user':
    noop   => !$purge_users,
    unless => [
      ['uid', '<', '1000'],
      ['name', '==', 'nobody'],
    ],
  }
}
```

The `purge_users` fact doesn't exist by default, so I can define it on the go when I need to purge users.
Now I can run `puppet apply` on a node and force purging the users with:

```
$ FACTER_purge_users=y puppet agent -t
```

And all unmanaged users will be removed from the node!


*Do you have specific Puppet needs? [Contact us](https://www.camptocamp.com/contact), we can help you!*

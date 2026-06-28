---
template: post
title: "Automatic Renewal of Puppet Certificates"
date: "2020-05-04T06:36:04Z"
excerpt: "Everyone who has been using Puppet with a self-signed CA for more than 5 years knows that dreaded time: the time when the CA must be renewed."
thumb_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
content_img_path: "https://web.archive.org/web/20190203072122if_/https://www.camptocamp.com/wp-content/uploads/xformations_puppet1-720x400.png.pagespeed.ic.UU2oY1Zlj8.webp"
canonical_url: "https://www.camptocamp.com/actualite/automatic-renewal-of-puppet-certificates/"
devto_url: "https://dev.to/camptocamp-ops/automatic-renewal-of-puppet-certificates-28pm"
tags: ["puppet", "devops", "opensource", "security"]
---
Everyone who has been using [Puppet](https://puppet.com/) with a self-signed CA for over 5 years knows the dreaded time: the time when the CA must be renewed.

# Renewing the CA

The traditional approach is to create a new CA, and then use another mean to renew the certificates for all the nodes (SSH, MCollective, Ansible, etc.).

Another possibility is to keep the same CA keys and generate a new CA certificate. There is actually [an official module to do that](https://github.com/puppetlabs/puppetlabs-certregen). This module allows you to easily revive a CA that is about to expire in such a way that the new CA certificate is valid for current node certificates. As a result, you don't need to renew the node certificates right away; you only need to distribute the new CA certificate to ensure the cached version does not expire!

There is however a consequence: node certificates will start to expire. Nodes over 5 years old will expire as soon as the CA expires. And so they need to be renewed, too.


# Renewing the node certificates

What if the Puppet agent itself could ensure its certificate is always
valid? This can be achieved using two things:

- an autosign policy;
- the `puppet_certificate` resource type.

## Autosign

The former is a [standard Puppet feature](https://puppet.com/docs/puppet/5.3/ssl_autosign.html#policy-based-autosigning), with a simple principle: embark a secret in the Puppet CSR, which will be checked by a script on the CA.

This approach allows to easily automate node provisioning by making nodes automatically register into Puppet.

The simplest form uses a shared password in the `csr_attributes.yaml` file on the Puppet node.


## Managing certificates

Once you have put together a way to autosign certificates, let's see how to automatically renew these certificates. We'll use the [puppet_certificate Puppet module](https://github.com/reidmv/puppet-module-puppet_certificate) for that. Here is the kind of code you could use:

```puppet
class profile::puppet::certificate (
  String $psk,
) {
  file { '/etc/puppetlabs/puppet/csr_attributes.yaml':
    ensure  => file,
    owner   => 'root',
    group   => 'root',
    mode    => '0440',
    content => "---\ncustom_attributes:\n  1.2.840.113549.1.9.7: '${psk}'\n",
  }
  ~> puppet_certificate { $::trusted['certname']:
    ensure               => valid,
    onrefresh            => 'regenerate',
    waitforcert          => 60,
    renewal_grace_period => 20,
    clean                => true,
  }
}
```

This code will:

- manage the `csr_attributes.yaml` file to inject the psk into it;
- manage the Puppet certificate of the node.

In addition:

- If the psk is modified, the certificate will be recreated;
- The certificate will automatically be renewed 20 days before it expires (using `ensure => valid`);

Note that this only works if the certificate is cleaned from the Puppet CA before it gets regenerated. This is the point of the `clean => true` attribute. By default, however, the Puppet CA does not accept remote cleaning of certificates. You can allow nodes to clean their own certificates (and no other) by adding this to your Puppetserver's `auth.conf` file:


```ruby
{
    name: "Allow nodes to delete their own certificates",
    match-request: {
        path: "^/puppet-ca/v1/certificate(_status|_request)?/([^/]+)$",
        type: regex,
        method: [delete]
    },
    allow: "$2",
    sort-order: 500
}
```



## Better security

While it is possible to use a simple shared password in the `csr_attributes.yaml` for autosigning, it means all your nodes will contain that psk, which is valid to create new certificates on the Puppet CA. This is not very secure, and this can be improved by using unique tokens for each node, so that a token can only be used to generate a certificate for a specific node.

You could achieve this with tools such as Vault. Another idea is to generate a composite secret on the Puppet master by mixing the psk with the certname and possibly any certificate extension you want to enforce. You then need to adapt your autosign policy script to generate the same composite secret, which ensures that each node can only generate its own certificate, without changing its extensions.

*This post was originally published on [camptocamp.com](https://www.camptocamp.com/actualite/automatic-renewal-of-puppet-certificates/)*

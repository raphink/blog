---
template: post
title: "Automating FreeIPA with Terraform"
date: "2020-04-30T10:48:36Z"
excerpt: "The FreeIPA Terraform provider allows to automate creation and management of FreeIPA resources."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxterraform_bandeau.png.pagespeed.ic.neAGqH-_lX.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxterraform_bandeau.png.pagespeed.ic.neAGqH-_lX.webp"
canonical_url: "https://www.camptocamp.com/actualite/automating-freeipa-with-terraform/"
devto_url: "https://dev.to/camptocamp-ops/automating-freeipa-with-terraform-43b7"
---
[Terraform](https://www.terraform.io/) is great for cloud provisioning and has now become a standard tool to deploy infrastructures as code, in a DevOps fashion.

[Many plugins](https://www.terraform.io/docs/providers/index.html) exist to cover specific needs, from major cloud providers (AWS, GCP, Azure, etc.) to specific app APIs (Grafana, GitHub, or even PostgreSQL). The community provides and maintains [additional providers](https://www.terraform.io/docs/providers/type/community-index.html) which can be installed and used in any Terraform project as plugins.
 
Camptocamp developed several providers over the last few years. Besides
the [official Rancher provider] (https://www.terraform.io/docs/providers/rancher/index.html) which was co-developed by our team and contributed to the community, we maintain providers to integrate Terraform with the [PuppetCA](https://github.com/camptocamp/terraform-provider-puppetca), the [PuppetDB](https://github.com/camptocamp/terraform-provider-puppetdb), as well as the [gopass password vault](https://github.com/camptocamp/terraform-provider-pass).

More recently, we started having a need to automate FreeIPA resources using Terraform, so we started [a new provider](https://github.com/camptocamp/terraform-provider-freeipa).


# Installing

Installing additional Terraform providers is [rather straightforward](https://www.terraform.io/docs/configuration/providers.html#third-party-plugins).
You can simply download the binary from the [releases page](https://github.com/camptocamp/terraform-provider-freeipa/releases) and
drop it in your `~/.terraform.d/plugins` directory.

# Usage

Like all other Terraform providers, you first need to configure the provider. You can do that using either hardcoded parameters or environment variables. In this second case, we strongly encourage you to make use of [summon](https://github.com/cyberark/summon) as a wrapper to dynamically expose the environment variables at call time.

```hcl
provider freeipa {
  host = "ipa.example.test" # or set $FREEIPA_HOST
  username = "admin" # or set $FREEIPA_USERNAME
  password = "P@S5sw0rd" # or set $FREEIPA_PASSWORD
  insecure = true
}
```


Next, you can start writing resources to manage FreeIPA hosts and DNS  records:

```hcl
resource freeipa_host "foo" {
  fqdn = "foo.example.test"
  description = "This is my foo host"
  force = true
  random = true
  userpassword = "abcde"
}

resource freeipa_dns_record "bar" {
  idnsname = "bar"
  dnszoneidnsname = "myzone"
  dnsttl = 20
  records = ["1.2.3.4"]
}
```

At the moment, this FreeIPA provider only features 2 resource types, to manage FreeIPA hosts and DNS records. Don't hesitate to [contribute to it](https://github.com/camptocamp/terraform-provider-freeipa) by providing more resource types!


*This post was originally published on [https://www.camptocamp.com/actualite/automating-freeipa-with-terraform/](https://www.camptocamp.com/actualite/automating-freeipa-with-terraform/)*

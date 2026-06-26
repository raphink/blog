---
template: post
title: "A 15-year Puppet Journey"
date: "2022-02-06T22:59:02Z"
excerpt: "Note: this is a personal blog post. It does not concern Camptocamp's partnership with Puppet Inc.,..."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F2ufldxkli3cw6efd7np6.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F2ufldxkli3cw6efd7np6.png"
canonical_url: "https://dev.to/raphink/a-15-year-puppet-journey-4o39"
devto_url: "https://dev.to/raphink/a-15-year-puppet-journey-4o39"
tags: ["puppet", "cfgmgmt", "devops", "community"]
---
*Note: this is a personal blog post. It does not concern Camptocamp's partnership with Puppet Inc., which remains unchanged.*


In 2006, I landed my first gig as a Systems Administrator. One of my main roles was taking care of a Cfengine server and repository for about 4000 machines, and finishing its migration from Cfengine 1 to Cfengine 2.

Like many people in this position at that time, discovering Puppet was akin to a revelation. Leaving aside its slowness (in comparison to Cfengine), its DSL, file templates, and the extensibility of the Resource Abstraction Layer were nothing short of a little revolution.

Then Augeas was presented to me, and I enjoyed the concept so much I got involved in the project and started writing many lenses.

I joined Camptocamp in 2012 in large part because of the role the company played in the Puppet community. Together with my colleague [Mickaël](https://github.com/mcanevet), we took to standardising and modernising our Puppet stack and modules, and got deeply involved in the community, writing plugins (puppet-lint plugins, [facterdb](https://github.com/voxpupuli/facterdb)/rspec-puppet-facter) and tools ([prometheus-puppetdb-sd](https://www.camptocamp.com/fr/actualites-evenements/news_integrating_prometheus), [puppetfile-updater](https://github.com/camptocamp/puppetfile-updater), [puppet-ghostbuster](https://www.camptocamp.com/fr/actualites-evenements/news_cleaning_up_puppet_code), etc.).

![Puppet Community](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3bgtu2pv4ftg5suj31rv.jpg)

Over the years, I've had the pleasure of teaching Puppet training courses at all levels and consulting on all sorts of layers (modules, Ruby plugins, TDD, etc.) and stacks (Puppet Enterprise, Foreman, Docker-based, and more…).

In the last couple of years though, my work has mostly revolved around containers and Kubernetes. I have kept maintaining Puppet- and Augeas-related code, but often without using these projects myself for production needs.

For that reason, I started donating such projects to [Voxpupuli](https://voxpupuli.org), as I believe they will receive better care than I can currently give them.

Truth be told, I've delayed all this for months —maybe years— because the Puppet community is awesome and it's always been a pleasure to contribute to it. I've even gotten back quite a bit last year, reviving [puppet-catalog-diff](https://forge.puppet.com/modules/camptocamp/catalog_diff) and participating in various Puppet Camps.

It's been fun, but I need to focus on other projects now, and it's probably better if things are set in a clear manner.

So farewell Puppet community, keep being an awesome and welcoming place, & thanks for all the 🐟!

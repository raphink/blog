---
template: post
title: "Integrating Prometheus with PuppetDB"
date: "2020-04-30T10:48:51Z"
excerpt: "Many applications are not containerized, and we still need to monitor their nodes. Prometheus PuppetDB SD allows to discover nodes in the PuppetDB and generate Prometheus configurations automatically."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxbanner-1.png.pagespeed.ic.-LxmyH1pjm.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxbanner-1.png.pagespeed.ic.-LxmyH1pjm.webp"
canonical_url: "https://www.camptocamp.com/actualite/integrating-prometheus-with-puppetdb/"
devto_url: "https://dev.to/camptocamp-ops/integrating-prometheus-with-puppetdb-aom"
tags: ["devops", "showdev", "puppet", "opensource"]
---
Most companies that have switched their deployments to containers have faced this issue: traditional monitoring systems just don't cut it when it comes to observability of containerized applications. Instead of focusing on nodes and applications running on them, the cluster approach to container orchestration systems requires to target application instances, which can run on multiple nodes —even several times on a single node— and typically have short life spans.

# A new monitoring paradigm

Fortunately for us, Prometheus came early on in the ecosystem, providing an elegant solution to gather metrics from microservices and derive all sort of observability tools from them, including monitoring. Prometheus also allows to monitor the cluster nodes, by returning their metrics and aggregating them into views of their own. Problem solved, we can now get rid of our historical monitoring infrastructure. Or can we?

![](https://www.camptocamp.com/wp-content/uploads/prometheus-550x120.png)

As much as we'd like to think all our applications are now containerized and all our machines are neutral cluster nodes in a large cattle, the reality is often very different. Most companies still have a large quantity of specialized machines---even snowflakes at times--- that are not taken into account by your latest Kubernetes cluster. Should we keep Nagios running for those, or is it possible to make them fit into the new paradigm?

# Using PuppetDB

For those of us running Puppet, the PuppetDB has for years been a great source of information on nodes managed by Puppet. It contains facts, catalogs, reports and more for all the nodes in the fleet. Let's use this information to monitor the nodes and their services dynamically, using Prometheus!

![](https://www.camptocamp.com/wp-content/uploads/puppet-2-400x400.png)


[Prometheus PuppetDB SD](https://github.com/camptocamp/prometheus-puppetdb-sd) allows to link PuppetDB with your Prometheus infrastructure. At a regular interval, it queries the PuppetDB and retrieves a list of targets. It then outputs a scrape configuration which Prometheus can use. Sounds simple? It really is!

# Puppet and Prometheus

The Vox Pupuli Puppet community has a great module to manage Prometheus. The [puppet-prometheus](https://forge.puppet.com/puppet/prometheus) module works out of the box and allows to install and configure a Prometheus server. It also provides the `prometheus::scrape_job` defined type to declare scrape jobs to be added to the server.

Declaring these scrape jobs as exported resources tags them as such in the PuppetDB, and they can then be realized on the Prometheus server. This is extremely useful, but only works when the Prometheus server is managed by Puppet, not when it is containerized! Prometheus PuppetDB SD fills this gap by scraping the exported resources from the PuppetDB and generating the Prometheus configurations, so you can get the best of both worlds: scrape jobs declared in Puppet alongside your applications, and a containerized Prometheus server!

# Installation and Configuration

There's several ways to install Prometheus PuppetDB SD, but let's face it: if you're using Prometheus, you probably have a Kubernetes cluster already, so let's install it using Helm:

```shell
$ helm repo add camptocamp http://charts.camptocamp.com
$ helm install camptocamp/prometheus-puppetdb-sd --version 2.0.3
```

The following values should be provided:

-   `prometheusPuppetdbSd.args.puppetdb.url`: the PuppetDB URI
-   `prometheusPuppetdbSd.args.prometheus.proxy-url`: the Prometheus
    Push-proxy URL
-   `prometheusPuppetdbSd.args.output.k8s-secret.secret-name`: the name
    of the k8s secret used to output the Prometheus configuration
-   `prometheusPuppetdbSd.args.output.k8s-secret.secret-key`: the key in
    the k8s secret used for the output file name
-   `CACert`: the CA certificate used to authenticate the PuppetDB
-   `Cert`: the certificate used to connect to the PuppetDB
-   `Key`: the private key used to connect to the PuppetDB

With the [official Prometheus Operator](https://github.com/helm/charts/tree/master/stable/prometheus-operator), setting `prometheusSpec.additionalScrapeConfigsExternal` to `true` will automatically configure Prometheus to mount the secret called `{{ template "prometheus-operator.fullname" . }}-prometheus-scrape-confg` and use the `additional-scrape-configs.yaml` key in it as additional configuration. This is thus the easiest way to configure Prometheus PuppetDB SD.

That's it, you're set!

Don't hesitate to provide feedback and pull requests on the [GitHub repository](https://github.com/camptocamp/prometheus-puppetdb-sd)!

[GitHub — camptocamp/prometheus-puppetdb-sd](https://github.com/camptocamp/prometheus-puppetdb-sd)


*This post was originally published on [https://www.camptocamp.com/actualite/integrating-prometheus-with-puppetdb/](https://www.camptocamp.com/actualite/integrating-prometheus-with-puppetdb/)*

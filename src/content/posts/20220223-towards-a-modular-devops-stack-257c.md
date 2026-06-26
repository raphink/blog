---
template: post
title: "Towards a Modular DevOps Stack"
date: "2022-02-23T17:37:45Z"
excerpt: "DevOps Stack v1 will be modular"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Facg62zfhbt0aqt7g2dk4.jpg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Facg62zfhbt0aqt7g2dk4.jpg"
canonical_url: "https://dev.to/camptocamp-ops/towards-a-modular-devops-stack-257c"
devto_url: "https://dev.to/camptocamp-ops/towards-a-modular-devops-stack-257c"
tags: ["devops", "kubernetes", "argocd", "infrastructure"]
---
A year and a half ago, our infrastructure team at Camptocamp was faced with an increasingly problematic situation. We were provisioning more and more Kubernetes clusters, on different cloud providers. We used Terraform to deploy the infrastructure itself, and we had started to adopt [Argo CD](https://argoproj.github.io/cd/) to deploy applications on top of the cluster.

We quickly ended up with many projects using similar logic, often borrowed from older projects, and most of these cluster were starting to use divergent code.

![Diverging projects](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vl7hboahfscgsbvfyit4.png)
 

We thought it was time to put together a standard core in order to:

- provision Kubernetes clusters;
- deploy standard applications sets (monitoring, ingress controller, certificate management, etc.) on them;
- provide an interface for developers to deploy their applications in a GitOps manner;
- ensure all teams used similar approaches.

![DevOps Stack](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hl1ncdyg1o7bolr9vy5z.png)
 
The [DevOps Stack](https://devops-stack.io/) was born!


# 🌟 The Original Design

The original DevOps Stack design was monolithic, both for practical and technical reasons.

After all, we were trying to centralize best practices from many projects into a common core, so it made sense to put everything together behind a unified interface!

In addition to that, all the Kubernetes applications were created using an [App of Apps pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern), because we had no ApplicationSets and no way to control Argo CD directly from Terraform.

As a result, the basic interface was very simple, for example:

```hcl
module "cluster" {
  source = "git::https://github.com/camptocamp/devops-stack.git//modules/eks/aws?ref=v0.54.0"

  cluster_name = local.cluster_name
  vpc_id       = module.vpc.vpc_id

  worker_groups = [
    {
      instance_type        = "m5a.large"
      asg_desired_capacity = 2
      asg_max_size         = 3
    }
  ]

  base_domain     = "example.com"

  cognito_user_pool_id     = aws_cognito_user_pool.pool.id
  cognito_user_pool_domain = aws_cognito_user_pool_domain.pool_domain.domain
}
```

However, it could get very complex when application settings needed to be tuned!

![DevOps Stack v0 Architecture](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/12b9atbhi9iwf0fgoslm.png)
 
With time, this architecture started being problematic for various reasons:

- it was hard to deactivate or replace components (monitoring, ingress controller, etc.), making it hard to extend the core features;
- default YAML values got quite mixed up and hard to understand;
- as a result, overriding default values was unnecessarily complex;
- adding new applications was done using `extra_apps` and `extra_applicationsets` parameters, which were monolithic and complex.

It was time to rethink the design.


# 🐙 Argo CD Provider

In order to escape the App of Apps pattern, we started looking into using a [Terraform provider to control Argo CD resources](https://registry.terraform.io/providers/oboukili/argocd/). After various contributions, the provider was ready for us to start using in the DevOps Stack.


# 🗺 The Plan for Modularization


Using the Argo CD provider allowed us to split each component into a separate module. In a similar way to DevOps Stack v0, each of these modules would provide Terraform code to set up the component, optionally with:

- cloud resources required to set up the component;
- Helm charts to deploy the application using Argo CD.


## 💡 A Full Example

As a result, the user interface is much more verbose. The previous example would thus become:

```hcl
module "cluster" {
  source = "git::https://github.com/camptocamp/devops-stack.git//modules/eks/aws?ref=v1.0.0"

  cluster_name = var.cluster_name
  base_domain = "demo.camptocamp.com"
  vpc_id       = module.vpc.vpc_id

  cluster_endpoint_public_access_cidrs = flatten([
    formatlist("%s/32", module.vpc.nat_public_ips),
    "0.0.0.0/0",
  ])

  worker_groups = [
    {
      instance_type        = "m5a.large"
      asg_desired_capacity = 2
      asg_max_size         = 3
      root_volume_type     = "gp2"
    },
  ]
}

provider "argocd" {
  server_addr = "127.0.0.1:8080"
  auth_token  = module.cluster.argocd_auth_token
  insecure = true
  plain_text = true
  port_forward = true
  port_forward_with_namespace = module.cluster.argocd_namespace

  kubernetes {
    host                   = module.cluster.kubernetes_host
    cluster_ca_certificate = module.cluster.kubernetes_cluster_ca_certificate
    token = module.cluster.kubernetes_token
  }
}

module "ingress" {
  source = "git::https://github.com/camptocamp/devops-stack-module-traefik.git//modules/eks"

  cluster_name     = var.cluster_name
  argocd_namespace = module.cluster.argocd_namespace
  base_domain      = module.cluster.base_domain
}

module "oidc" {
  source = "git::https://github.com/camptocamp/devops-stack-module-oidc-aws-cognito.git//modules"

  cluster_name     = var.cluster_name
  argocd_namespace = module.cluster.argocd_namespace
  base_domain    = module.cluster.base_domain

  cognito_user_pool_id     = aws_cognito_user_pool.pool.id
  cognito_user_pool_domain = aws_cognito_user_pool_domain.pool_domain.domain
}

module "monitoring" {
  source = "git::https://github.com/camptocamp/devops-stack-module-kube-prometheus-stack.git//modules"

  cluster_name     = var.cluster_name
  oidc             = module.oidc.oidc
  argocd_namespace = module.cluster.argocd_namespace
  base_domain    = module.cluster.base_domain
  cluster_issuer = "letsencrypt-prod"
  metrics_archives = {}

  depends_on = [ module.oidc ]
}

module "loki-stack" {
  source = "git::https://github.com/camptocamp/devops-stack-module-loki-stack.git//modules/eks"

  cluster_name     = var.cluster_name
  argocd_namespace = module.cluster.argocd_namespace
  base_domain      = module.cluster.base_domain

  cluster_oidc_issuer_url = module.cluster.cluster_oidc_issuer_url

  depends_on = [ module.monitoring ]
}

module "cert-manager" {
  source = "git::https://github.com/camptocamp/devops-stack-module-cert-manager.git//modules/eks"

  cluster_name     = var.cluster_name
  argocd_namespace = module.cluster.argocd_namespace
  base_domain      = module.cluster.base_domain

  cluster_oidc_issuer_url = module.cluster.cluster_oidc_issuer_url

  depends_on = [ module.monitoring ]
}

module "argocd" {
  source = "git::https://github.com/camptocamp/devops-stack-module-argocd.git//modules"

  cluster_name   = var.cluster_name
  oidc           = module.oidc.oidc
  argocd         = {
    namespace = module.cluster.argocd_namespace
    server_secrhttps://kubernetes.slack.com/archives/C01SQ1TMBSTetkey = module.cluster.argocd_server_secretkey
    accounts_pipeline_tokens = module.cluster.argocd_accounts_pipeline_tokens
    server_admin_password = module.cluster.argocd_server_admin_password
    domain = module.cluster.argocd_domain
  }
  base_domain    = module.cluster.base_domain
  cluster_issuer = "letsencrypt-prod"

  depends_on = [ module.cert-manager, module.monitoring ]
}
```


### ☸ The Cluster Module

As you can see, the main `cluster` module —which used to do all the work— is now only responsible for deploying the Kubernetes cluster and a basic Argo CD set up (in bootstrap mode).


### 🐙 The Argo CD Provider

We then set up the Argo CD provider using outputs from the `cluster` module:

```hcl
provider "argocd" {
  server_addr = "127.0.0.1:8080"
  auth_token  = module.cluster.argocd_auth_token
  insecure = true
  plain_text = true
  port_forward = true
  port_forward_with_namespace = module.cluster.argocd_namespace

  kubernetes {
    host                   = module.cluster.kubernetes_host
    cluster_ca_certificate = module.cluster.kubernetes_cluster_ca_certificate
    token = module.cluster.kubernetes_token
  }
}
```

This provider is used in all (or most at least) other modules in order to deploy Argo CD applications, without going through a monolithic/centralized App of Apps.


### 🧩 Component Modules

Each module provides a single component, using Terraform and the Argo CD provider (optionally).

There are common interfaces passed as variables between modules. For example, the `oidc` variable can be provided as an output from various modules: [Keycloak](https://github.com/camptocamp/devops-stack-module-keycloak), [AWS Cognito](https://github.com/camptocamp/devops-stack-module-oidc-aws-cognito), etc. This `oidc` variable can then be passed to other component modules to configure the component's authentication layer.

In a similar fashion, the `ingress` module, which was so far only using Traefik, can now be replaced by another Ingress Controller implementation.

### 🐙 The Argo CD Module

The [Argo CD module](https://github.com/camptocamp/devops-stack-module-argocd) is a special one. A special entrypoint (called `boostrap`) is used in the `cluster` module to set up a basic Argo CD using Helm.

The user is then responsible for instantiating the Argo CD module a second time at the end of the stack, in order for Argo CD to manage itself and configure itself properly —including monitoring and authentication, which cannot be configured before the corresponding components are deployed.


## 🥾 The Bootstrap Pattern

Eventually, other modules might adopt the bootstrap pattern in order to solve chicken-and-egg dependencies.

For example, [cert-manager](https://github.com/camptocamp/devops-stack-module-cert-manager) requires Prometheus Operator CRDs in order to be monitored. However, the [Kube Prometheus Stack](https://github.com/camptocamp/devops-stack-module-kube-prometheus-stack) might require valid certificates, thus depending on cert-manager being deployed. This could be solved by deploying a basic cert-manager instance (in a `bootstrap` endpoint), and finalizing the deploying at the end of the stack.


# 🚀 To Infinity

The modular DevOps Stack design is the current target for release 1.0.0.

While this refactoring is still in beta state, it can be tested by using the [`v1` branch](https://github.com/camptocamp/devops-stack/tree/v1) of the project. You can also find examples in the [`tests` directory](https://github.com/camptocamp/devops-stack/tree/v1/tests) (though not all distributions are ported yet).

Feedback is welcome, and you can contact us on the [`#camptocamp-devops-stack` channel](https://kubernetes.slack.com/archives/C01SQ1TMBST) of the Kubernetes Slack.

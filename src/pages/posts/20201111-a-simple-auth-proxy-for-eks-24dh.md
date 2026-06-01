---
template: post
title: "A Simple Auth Proxy for EKS"
date: "2020-11-11T16:10:48Z"
excerpt: "How to easily give access to an EKS cluster using an authentication proxy with a PSK"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F49dhgxfjbeqgo2kxo5sr.jpeg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F49dhgxfjbeqgo2kxo5sr.jpeg"
canonical_url: "https://dev.to/camptocamp-ops/a-simple-auth-proxy-for-eks-24dh"
devto_url: "https://dev.to/camptocamp-ops/a-simple-auth-proxy-for-eks-24dh"
---
[AWS EKS](https://aws.amazon.com/eks/) is a great option for a hosted Kubernetes cluster.

It is in particular easy to use for demos and training sessions.

However, EKS authentication is based off AWS IAM, which means users need an AWS account. Authenticating to EKS typically involves calling the `aws eks get-token` command in your `.kube/config` so as to retrieve an authentication token.


As we were setting up EKS for Kubernetes training, we needed a simple way for users without an AWS account to access the cluster, so we created a basic proxy service for the EKS `get-token` action.

{% github camptocamp/aws-iam-authenticator-proxy %}


## Deploying with Docker

The proxy can be deployed using Docker, with AWS credentials, e.g.:

```shell
docker run --rm -p 8080:8080 \
             -e AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
             -e AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
             -e EKS_CLUSTER_ID=<EKS_CLUSTER_ID> \
             -e PSK="mysecretstring" \
    camptocamp/aws-iam-authenticator-proxy:latest
```

The rights on the cluster will depend on the user you chose to create the access key.

The PSK is optional, and allows to secure the proxy a little bit.

Once the proxy is started, you can access it at http://localhost:8080?psk=mysecretstring, so you can simply set your `~/.kube/config` to use `curl` instead of `aws`:

```yaml
users:
- name: <cluster_name>
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1alpha1
      command: curl
      args:
        - -s
        - "http://<your_ip>:8080/?psk=mysecretstring"
```

## Deploying in EKS

Since you've got an EKS cluster in the first place, you might as well deploy the proxy in it.

The repository provides a Helm chart for that, in the `k8s` directory of the GitHub project.

You can simply instantiate the chart with the following values:

```yaml
eks_cluster_id: "<EKS_CLUSTER_ID>"
psk: "mysecretstring"
aws:
  access_key_id: "<AWS_ACCESS_KEY_ID>"
  secret_access_key: "<AWS_SECRET_ACCESS_KEY>"
```

The AWS credentials will be stored in a Kubernetes secret and passed to the container.


### Using 

However, since we're in AWS, we can also use [IAM roles for service accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) and bypass the access keys altogether. This is a much cleaner approach.

Here's how to do it, using Terraform to create the role and deploy the proxy.

First, create a role linked to OIDC:

```hcl
module "iam_assumable_role_aws_iam_authenticator_proxy" {
  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version                       = "3.3.0"
  create_role                   = true
  number_of_role_policy_arns    = 0
  role_name                     = "aws-iam-authenticator-proxy"
  provider_url                  = replace(module.cluster.cluster_oidc_issuer_url, "https://", "")
  oidc_fully_qualified_subjects = ["system:serviceaccount:yournamespace:aws-iam-authenticator-proxy"]
}
```

replacing `yournamespace` with the Kubernetes namespace where you will be deploying the proxy.

Now we can configure the cluster to use map that role to the Kubernetes role we want (e.g. `system::masters` to make it cluster admin).

We'll create a random PSK and generate the Kubeconfig file to use `curl` with the proxy:

```hcl
data "aws_vpc" "this" {
  id = var.vpc_id
}

data "aws_subnet_ids" "private" {
  vpc_id = data.aws_vpc.this.id

  tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

module "cluster" {
  source  = "terraform-aws-modules/eks/aws"
  version = "13.1.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.18"

  subnets          = data.aws_subnet_ids.private.ids
  vpc_id           = var.vpc_id
  enable_irsa      = true
  map_roles        = [
    {
      rolearn  = module.iam_assumable_role_aws_iam_authenticator_proxy.this_iam_role_arn,
      username = module.iam_assumable_role_aws_iam_authenticator_proxy.this_iam_role_name,
      groups   = ["system:masters"]
    },
  ]

  worker_groups = [
    {
      instance_type        = "m5a.large"
      asg_desired_capacity = 2
      asg_max_size         = 3
    }
  ]

  kubeconfig_aws_authenticator_command = "curl"
  kubeconfig_aws_authenticator_command_args	= [
    "-s",
    "https://${var.auth_url}/?psk=${random_password.auth_proxy_psk.result}",
  ]
}

resource "random_password" "auth_proxy_psk" {
  length  = 16
  special = false
}
```

Finally, we can deploy the proxy in Kubernetes using Helm:

```hcl


resource "helm_release" "aws-iam-authenticator-proxy" {
  name              = "aws-iam-authenticator-proxy"
  chart             = "https://github.com/camptocamp/aws-iam-authenticator-proxy/tree/master/k8s"
  namespace         = "aws-iam-authenticator-proxy"
  dependency_update = true
  create_namespace  = tr

  values = [
    << EOT
eks_cluster_id: "${var.cluster_name}"
psk: "${random_password.auth_proxy_psk.result}"
serviceAccount:
  name: "aws-iam-authenticator-proxy"
  annotations:
    eks.amazonaws.com/role-arn: ${module.iam_assumable_role_aws_iam_authenticator_proxy.this_iam_role_arn}
EOT
  ]

  depends_on = [
    module.cluster,
  ]
}
```

You can add an `Ingress` or configure the `Service` to use an L4 `LoadBalancer` by tuning the Helm values.

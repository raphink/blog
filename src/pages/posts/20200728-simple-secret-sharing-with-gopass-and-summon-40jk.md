---
template: post
title: "Simple secret sharing with gopass and summon"
date: "2020-07-28T16:34:57Z"
excerpt: "Storing and sharing secrets doesn't have to be complex"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fgl8147l5s2ky6po9tdfi.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fgl8147l5s2ky6po9tdfi.png"
canonical_url: "https://dev.to/camptocamp-ops/simple-secret-sharing-with-gopass-and-summon-40jk"
devto_url: "https://dev.to/camptocamp-ops/simple-secret-sharing-with-gopass-and-summon-40jk"
---
Secrets are a fundamental, yet complex issue in software deployment.

Solutions such as [KeepassX](https://www.keepassx.org/) are simple to use, but quite impractical when it comes to automation.

More complex options like [Hashicorp Vault](https://www.vaultproject.io/) are extremely powerful, but harder to set up and maintain.


# Pass: a simple solution

When it comes to storing securely and sharing passwords in a team, it is hard to come up with a more simple and efficient solution than Git and GnuPG combined.

[Pass](https://www.passwordstore.org/) is a shell script that does just that. Inside a Git repository, Pass stores passwords in individual files encrypted for all private GnuPG keys in the team. It features a CLI to manipulate passwords, add new entries, or search through existing passwords.



# More features

However, Pass is quite limited in its features, so another project was born a few years later, to provide a new Go implementation of the Pass standard. Its name: simply [Gopass](https://github.com/gopasspw/gopass).

![Gopass Logo](https://dev-to-uploads.s3.amazonaws.com/i/1cs4zelpc542tzc2ligm.png)


## Installing

Gopass is provided as binaries you can download from the releases page [on GitHub](https://github.com/gopasspw/gopass/releases).

## Features

Here are some of the features that make Gopass a great tool.

### Multiple mounts

While `pass` allows you to have a single Git repository with your passwords, Gopass lets you create multiple repositories called "mounts", which is very useful when you want to share different secrets with different people:

```shell
$ gopass mounts
gopass (/home/raphink/.password-store)
├── c2c (/home/raphink/.password-store-c2c)
├── perso (/home/raphink/.password-store-perso)
└── terraform (/home/raphink/.password-store-terraform)
```

Gopass uses a prefix to access secrets in mounts, so `terraform/puppet/c2c` actually refers to the secret stored in `/home/raphink/.password-store-terraform/puppet/c2c.gpg`.


### Multiple users

Each Git repository can be set to encrypt passwords for multiple GnuPG keys.

The `.gpg-id` file at the root of each repository contains the list of public keys to use for encryption, and the `.public-keys/` directory keeps a copy of each key, making it easy for collaborators to import them into their keyring before they can start encrypting passwords for the team.

### Fuzzy search

Gopass helps you find entries when the key you gave it doesn't match an exact known path:

```shell
$ gopass jenkins
[ 0] c2c/c2c_aws/jenkins-c2c
[ 1] c2c/c2c_mgmtsrv/freeipa/c2c-jenkins-swarm
[ 2] c2c/c2c_mgmtsrv/freeipa/jenkins-test-users
[ 3] perso/Devel/jenkins-ci.org
[ 4] terraform/aws/jenkins-c2c

Found secrets - Please select an entry [0]: 
```

### Structured secrets

When decrypting a password, Gopass parses the content into two different parts: a password and a YAML document. For example, the content of a secret could look like this:

```yaml
foo
---
key1: value1
another_key:
  bar: baz
```


#### Password

The first line of the content is the `password`. If this is all you're interested in, you can use `gopass show --password` to retrieve it:

```shell
$ gopass show --password perso/test
foo
```

#### Querying keys

When the second part of the content (lines 2 and following) is a valid YAML document, you can query these values by providing a key, for example:

```shell
$ gopass show perso/test key1
value1
```

Starting with Gopass 1.9.3, you can also query subkeys using either a dot or slash notation:

```shell
$ gopass show perso/test another_key.bar
baz
$ gopass show perso/test /another_key/bar
baz
```

This makes it extremely powerful to store several fields in the same secret.


### TOTP

Gopass allows to store TOTP keys alongside passwords. For example, you can have the following secret, stored at `terraform/service.io/api`:

```yaml
WPTmU`>b<Y31
---
password: 'WPTmU`>b<Y31'
totp: 'PIJ6AIHETAHSHOO7SHEI1AEK6IH1SOOCHATUOSH8XUAN0OOTH9XAHRUXO4AHJAEVI'
url: https://myservice.io
username: jdoe
```

In addition to retrieving each field with the corresponding key, you can also generate TOTP tokens with `gopass totp`:

```shell
$ gopass totp terraform/service.io/api
568000 lasts 18s 	|------------==================|
```


## Integrations

Gopass can be easily integrated into projects for deployments or CI/CD tasks.


### Summon

The easiest way to integrate Gopass is probably to use [Summon](https://github.com/cyberark/summon).

![Summon logo](https://dev-to-uploads.s3.amazonaws.com/i/gy0cw2iqwdb85lobl5jl.png)

Summon is a tool which dynamically exposes environment variables with values retrieved from various secret stores. `gopass` is one of its possible providers.

#### Setup

Setting it up to use `gopass` is rather straightforward. We use a simple wrapper called `summon-gopass`, which needs to be in your PATH:

```bash
#!/bin/sh
gopass show $(echo "${@}"|tr : \ )
```

You can also simply make `summon-gopass` a symbolic link to your `gopass` binary, but subkeys won't work in this case.

#### Usage

Summon lets you provide a local `secrets.yml` file which defines which environment variables you wish to define, and how to find the values.

Here's a simple example of a `secrets.yml` file using the secret we defined earlier:

```yaml
SERVICE_URL: !var terraform/service.io/api url
USER: !var terraform/service.io/api username
SERVICE_PASSWORD: !var terraform/service.io/api password
```

You can test this setup by running the following command in the directory containing `secrets.yml`:

```shell
$ summon env
```

The output should contain the 3 variables with the values stored in Gopass.


#### Exposing files

While the format above allows you to expose simple secrets as variables, it is not very practical when you need secrets exposed as files.

Summon covers this need however, using the `file` flag. For example:

```yaml
SSH_KEY: !var:file terraform/service.io/ssh private_key
```

If `terraform/service.io/ssh` is a secret in Gopass whose `private_key` YAML field contains an SSH private key, then Summon will extract this secret, place it into a temporary file (in `/dev/shm` by default) and set the `SSH_KEY` variable with the path to the file. After the command returns, the temporary file will be delete.

You could then use such a `secrets.yml` file with:

```shell
summon sh -c 'ssh -i $SSH_KEY user@service'
```

Another useful example is to store a Kubernetes cluster configuration in Gopass, e.g.:

```yaml
---
apiVersion: v1
clusters:
    - cluster:
        server: https://k8s.example.com
      name: k8s
contexts:
    - context:
        cluster: k8s
        namespace: default
        user: default-cluster-admin
      name: default-admin
current-context: default-admin
kind: Config
preferences: {}
users:
    - name: default-cluster-admin
      user:
        token: averylongtoken
```

With the following `secrets.yml` file:

```yaml
KUBECONFIG: !var:file path/to/secret
```

You can then work on the Kubernetes cluster with `kubectl` using:

```shell
$ summon kubectl <some command>
```



### Terraform integration

A simple way to pass variables to Terraform is to declare them and use `summon` to pass the values:

```yaml
TF_VAR_var1: !var terraform/project1/secret1 field1
```

You can then run `summon terraform` to dynamically pass these secrets to Terraform.


Another possibility is to use [Camptocamp's Terraform Pass Provider](https://github.com/camptocamp/terraform-provider-pass) which lets you retrieve and set passwords in Gopass natively in Terraform:

```hcl
provider "pass" {
  store_dir = "/srv/password-store"    # defaults to $PASSWORD_STORE_DIR
  refresh_store = false                # do not call `git pull`
}

# Store a value into the Gopass store
resource "pass_password" "test" {
  path = "secret/foo"
  password = "0123456789"
  data = {
    zip = "zap"
  }
}

# Retrieve password at another_secret/bar to be used in Terraform code
data "pass_password" "test" {
  path = "another_secret/bar"
}
```

The provider exposes the secret with the following properties:

* `path`: path to the secret
* `password`: secret password (first line of the content)
* `data`: a structure (map) of the YAML data in the content
* `body`: the content found on lines 2 and following, if it could not be parsed as YAML 
* `full`: the full content (all lines) of the secret


### Hiera Integration

The most standard way to store secrets in Hiera is to use [`hiera-eyaml`](https://github.com/voxpupuli/hiera-eyaml), which stores secret values encrypted inside YAML files, using either a PKCS7 key (default) or multiple GnuPG keys (when using [`hiera-eyaml-gpg`](https://github.com/voxpupuli/hiera-eyaml-gpg)).

If your passwords are already stored in Gopass, you might want to integrate that into Hiera instead.

The [`camptocamp/hiera-pass` module](https://github.com/camptocamp/hiera-pass) provides two Hiera backends to retrieve keys either as full Gopass secrets, or as keys inside the secrets.

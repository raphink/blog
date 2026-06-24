---
template: post
title: "Backup your Container Data"
date: "2020-04-30T10:48:01Z"
excerpt: "Containers have become a great facility to easily deploy applications, whether locally or on orchestrated clusters. However, containers are ephemeral, meaning their data should be stored externally and should be backed up."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fbanner.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fbanner.png"
canonical_url: "https://www.camptocamp.com/actualite/backup-your-container-data/"
devto_url: "https://dev.to/camptocamp-ops/backup-your-container-data-2f3f"
tags: ["opensource", "backup", "showdev", "kubernetes"]
---
Containers have become a great facility to easily deploy applications, whether locally or on orchestrated clusters.

However, containers are ephemeral, meaning their data should be stored externally. When possible, they can be stored using databases or object storage. Most often though, you will need to resort to using data volumes, mounted inside your containers. How then can be perform a backup of this data?

# Data location is known

Contrarily to the traditional situation in application deployment, the location of critical data in containers is known, since it uses named volumes. We can thus connect to the Docker socket or the API managing the volumes to list them and perform the backups.

# Introducing Bivac

[Bivac](https://camptocamp.github.io/bivac/) is a tool created to do just that. It can be plugged to either a Docker socket, a Rancher API, or a Kubernetes server. It will then list the volumes on the platform and automatically back them up on a regular basis, using [Restic](https://restic.net/) to transfer the data to an object storage provider (e.g. AWS S3).

![Bivac Logo](https://www.camptocamp.com/wp-content/uploads/bivac-435x400.png)

In addition, Bivac can provide metrics on the backup statuses as it exposes a [Prometheus](https://prometheus.io/) endpoint.

Using the REST client, backups can be listed, executed on demand, and it is also possible to restore volumes.

# Installation

Bivac can easily be installed a binary or a container. Here are some examples, deploying it locally on Docker, or using Kubernetes.

## Using Docker

The following `docker-compose.yml` file can be used to deploy the Bivac manager:


```yaml
---
version: '3'
services:
  bivac:
    image: camptocamp/bivac:2.2
    command: "manager -v"
    ports:
      - "8182:8182"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    environment:
      BIVAC_AGENT_IMAGE: camptocamp/bivac:2.1
      BIVAC_SERVER_PSK: super-secret-psk
      RESTIC_PASSWORD: not-so-good-password
      BIVAC_TARGET_URL: s3:my-bucket
      AWS_ACCESS_KEY_ID: XXXXX
      AWS_SECRET_ACCESS_KEY: XXXXX
```

Additionally, you can also deploy a local Prometheus server to retrieve the metrics. See [the full example](https://github.com/camptocamp/bivac/blob/master/contrib/examples/docker-compose/docker-compose.yml).


## Using Kubernetes

The easiest way to deploy a Bivac manager on Kubernetes is to use Camptocamp's Helm chart:


```shell
$ helm repo add camptocamp http://charts.camptocamp.com
$ helm install camptocamp/bivac --version 1.0.0
```


# Using the CLI

The CLI can be downloaded from [the releases page](https://github.com/camptocamp/bivac/releases/tag/2.2.0). Once the binary is installed, you can use it to list backups, perform backups, or restore data.

## Connecting to the manager

The CLI needs to be connected to the Bivac manager, using its HTTP URL and PSK (defined in the deployment). This can be performed using either the `--remote.address` and `--server.psk` options, or by setting the `BIVAC_REMOTE_ADDRESS` and `BIVAC_SERVER_PSK`.


## Listing backups

The `bivac volumes` command lets you list the volumes managed by Bivac:

[Gist — bivac-volumes.sh](https://gist.github.com/raphink/fe24bf6bc1205633471432f02ec13c15)



## Perform backups

While Bivac automatically performs backups at a regular interval, the CLI can also be used to trigger backups manually:


[Gist — bivac-backup.sh](https://gist.github.com/raphink/fe24bf6bc1205633471432f02ec13c15)



## Restore data

Bivac stores restic backups on object storage and lets you restore them using the `backup restore` command:

[Gist — bivac-restore.sh](https://gist.github.com/raphink/fe24bf6bc1205633471432f02ec13c15)



# Going further

More features are available, such as the ability to [manage a remote Restic repository](https://github.com/camptocamp/bivac/wiki/Usage#manage-a-remote-restic-repository).  See the documentation for more information.


# Conclusion

Bivac allows to easily backup data, monitor their status and restore them, whether you are using raw Docker, Rancher volumes or Kubernetes.


*This post was originally published on [https://www.camptocamp.com/actualite/backup-your-container-data/](https://www.camptocamp.com/actualite/backup-your-container-data/)*

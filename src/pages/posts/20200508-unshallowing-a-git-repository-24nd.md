---
template: post
title: "Unshallowing a Git repository"
date: "2020-05-08T07:36:38Z"
excerpt: "GitLab allows to perform shallow repository clones (and it seems to be the default in recent versions..."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fnsbbm80zgqqypxyqtx1d.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fnsbbm80zgqqypxyqtx1d.png"
canonical_url: "https://dev.to/camptocamp-ops/unshallowing-a-git-repository-24nd"
devto_url: "https://dev.to/camptocamp-ops/unshallowing-a-git-repository-24nd"
tags: ["devops", "git", "cicd", "todayilearned"]
---
GitLab allows to [perform shallow repository clones](https://docs.gitlab.com/ee/ci/yaml/#shallow-cloning) (and it seems to be the default in recent versions from what I can tell).

In order to run r10k, I need a full repository though, because r10k will copy it to cache and use this copy as a reference. This is what happens when you use a shallow repository:

```shell
 [2020-05-08 06:53:15 - DEBUG] Replacing /etc/puppetlabs/code/environments/modulesync_update and checking out modulesync_update
 [2020-05-08 06:53:56 - ERROR] Command exited with non-zero exit code:
 Command: git clone /builds/camptocamp/is/puppet/puppetmaster-c2c /etc/puppetlabs/code/environments/modulesync_update --reference /etc/puppetlabs/code/cache/-builds-camptocamp-is-puppet-puppetmaster-c2c
 Stderr:
 Cloning into '/etc/puppetlabs/code/environments/modulesync_update'...
 fatal: reference repository '/etc/puppetlabs/code/cache/-builds-camptocamp-is-puppet-puppetmaster-c2c' is shallow
 Exit code: 128
 [2020-05-08 06:53:56 - DEBUG] Purging unmanaged environments for deployment...
```

Git provides a `fetch --unshallow` command which solves the problem, so we just need to run `git fetch --unshallow` in the repository before running r10k.

However, some of our (older) GitLab installs don't make shallow clones. Instead, they make full clones with a single detached branch, so we need `fetch --all` instead.

In order to have it work in all configurations, I'm ending up running:

```shell
git fetch --unshallow || git fetch --all
```

And then run r10k on the repository.

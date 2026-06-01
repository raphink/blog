---
template: post
title: "Deploying public keys in Docker containers"
date: "2020-05-08T07:57:33Z"
excerpt: "One of the hard problems to solve when using Docker in production is deploying secrets. githut_pki makes SSH key deployment easy."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F1doni1qp0l9lqk240myf.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F1doni1qp0l9lqk240myf.png"
canonical_url: "https://www.camptocamp.com/en/actualite/deploying-public-keys-in-docker-containers/"
devto_url: "https://dev.to/camptocamp-ops/deploying-public-keys-in-docker-containers-41cd"
---
One of the hard problems to solve when using Docker in production is deploying secrets. In particular, public keys are hard to deploy because they are multiline and there is usually one key per authorized user.

Since all our users have accounts on GitHub with their SSH key, it made sense to us to use GitHub as a centralized PKI for SSH keys. Starting with a simple Ruby script connecting to the GitHub API, we soon realized we would need a generic way of deploying public keys from GitHub if we persisted in this approach.

This gave birth to the <a href="https://github.com/camptocamp/github_pki" target="_blank">github_pki</a>, a generic command line tool using the GitHub API to deploy SSH and X509 keys from GitHub organizations, teams, and individual users.

Installing can be done from source:

```dockerfile
FROM debian:jessie

ENV GOPATH=/go
RUN apt-get update && apt-get install -y golang-go git \
  && go get github.com/camptocamp/github_pki \
  && apt-get autoremove -y golang-go git \
  && rm -rf /var/lib/apt/lists/*
```

Or by inheriting one of the <a href="https://hub.docker.com/r/camptocamp/github_pki/tags/" target="_blank">official Docker images</a>.

The <tt>github_pki</tt> command can then simply be called from within an entrypoint script to deploy keys:

```bash
#!/bin/sh

# Deploy users keys as X509 public keys to SSL_DIR
SSL_DIR=/etc/puppetlabs/mcollective/clients /go/bin/github_pki

# Deploy user keys as an authorized_keys file
AUTHORIZED_KEYS=/root/.ssh/authorized_keys /go/bin/github_pki
```

Various <a href="https://github.com/camptocamp/github_pki#environment-variables" target="_blank">environment variables</a> can be used to tune which keys should be deployed:


```console
$ docker run -e AUTHORIZED_KEYS=/root/.ssh/authorized_keys \
             -e SSL_DIR=/etc/test/ssl \
             -e GITHUB_ORG="myorg" \
             -e GITHUB_TEAM="mypals" \
             -e GITHUB_USERS="otheruser" \
             -e GITHUB_TOKEN=398d6d326a546d40f3f1ef93345d1fc5ee0f0j38 \
             mydockerimage
run-parts: executing /docker-entrypoint.d/25-populate-ssl-clients.sh
time="2016-03-22T09:45:52Z" level=info msg="Adding users for team mypals" 
time="2016-03-22T09:45:52Z" level=info msg="Adding user bob" 
time="2016-03-22T09:45:52Z" level=info msg="Adding user alice" 
time="2016-03-22T09:45:52Z" level=info msg="Adding individual user otheruser" 
time="2016-03-22T09:45:53Z" level=info msg="Getting keys for user bob" 
time="2016-03-22T09:45:53Z" level=info msg="Getting keys for user alice" 
time="2016-03-22T09:45:53Z" level=info msg="Getting keys for user otheruser"
time="2016-03-22T09:45:59Z" level=info msg="Generating /root/.ssh/authorized_keys" 
time="2016-03-22T09:45:59Z" level=info msg="Dumping X509 keys to /etc/puppetlabs/mcollective/clients" 
time="2016-03-22T09:45:59Z" level=info msg="Converting key bob/1325852 to X509" 
time="2016-03-22T09:45:59Z" level=info msg="Converting key alice/123756 to X509" 
time="2016-03-22T09:45:59Z" level=info msg="Converting key alice/7845928 to X509" 
time="2016-03-22T09:45:59Z" level=info msg="Converting key otheruser/8540586 to X509"
```

*This blog post was originally published on [camptocamp.com](https://www.camptocamp.com/en/actualite/deploying-public-keys-in-docker-containers/)*

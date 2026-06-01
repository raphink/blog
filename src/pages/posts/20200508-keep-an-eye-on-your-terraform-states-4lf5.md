---
template: post
title: "Keep an eye on your Terraform states"
date: "2020-05-08T08:11:27Z"
excerpt: "About 4 years ago, we started using Terraform. Many things we were doing manually in the cloud at the time are now coded."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxterraform_bandeau.png.pagespeed.ic.neAGqH-_lX.webp"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fwww.camptocamp.com%2Fwp-content%2Fuploads%2Fxterraform_bandeau.png.pagespeed.ic.neAGqH-_lX.webp"
canonical_url: "https://www.camptocamp.com/actualite/keep-an-eye-on-your-terraform-states/"
devto_url: "https://dev.to/camptocamp-ops/keep-an-eye-on-your-terraform-states-4lf5"
---
*This blog post was originally published on [camptocamp.com](https://www.camptocamp.com/actualite/keep-an-eye-on-your-terraform-states/)*

About 4 years ago, we started using Terraform. Many things we were doing manually in the cloud at the time are now coded. As a result, our [Terraform](http://www.terraform.io) base code now contains over a hundred states.


# Terraform everything!

A lot of those resources already existed before, some managed by [CloudFormation](https://aws.amazon.com/cloudformation/), others manually. Being able to import resources has helped a lot to integrate new Terraform code with existing infrastructure. We now have a unified system to control them, and most importantly to know who created them, how and why. Collaboration was made easier by using profiles instead of hardcoded credentials, the introduction of remote states stored on AWS S3, as well as state locks on DynamoDB.

With all this, one thing remained: how do we keep an eye on all these states, resources and locks that are stored on AWS? Could there be a way to visualize and query them?


# Introducing Terraboard

![Terraboard](https://raw.githubusercontent.com/camptocamp/terraboard/master/logo/terraboard_logo.png)

[Terraboard](https://github.com/camptocamp/terraboard) was born in an attempt to bring an easy-to-use Web Interface for Terraform states.

It currently supports states stored in AWS S3, as well as locks on DynamoDB. It features 4 views: overview, state view, compare view and search.

Terraboard requires an S3 bucket with versioning activated (for history and comparison between versions), as well as a PostgreSQL database, where all S3 states will be stored as a data cache.

Terraboard is comprised of two compontents:

-   a server written in Go, which synchronizes the state files from the S3 bucket into the PostgreSQL database, and provides an API for the UI;
-   a Web UI written in AngularJS which consumes the API data and serves the Web pages.

## Overview

The overview is the landing page in Terraboard. It provides information about the most recent version of each state, along with the Terraform version used to apply it, its serial, the number of resources it features, and an activity sparkline. Clicking the sparkline lets you easily access any version of a state.

Graphs present statistics on the main resource types and Terraform versions used, as well as the number of number of states locked (if DynamoDB is configured).

![Main View](https://www.camptocamp.com/wp-content/uploads/main-550x326.png)


## State view

The State view presents details about a state file's resources.  Resources are listed by module and can be filtered. A version selector lets you view historical data for the state.

![State View](https://www.camptocamp.com/wp-content/uploads/state-550x328.png)


## Compare view

While on the State view, you can pick a second version to compare with the current one. This computes differences between the two versions, which displays:

-   A list of differences, displayed as a unified diff;
-   A list of resources only in the first version;
-   A list of resources only in the new version.

![Compare View](https://www.camptocamp.com/wp-content/uploads/compare-550x330.png)


## Search view

If you've ever wondered in which Terraform state a node was managed, you can easily find this out in the Search view. The Search view lets you filter resources and their attributes by type, name, key or value, as well as Terraform version used.

![Search View](https://www.camptocamp.com/wp-content/uploads/search-1-550x330.png)


# I want to try it!

Are you ready to try Terraboard? If you're using Docker, this is very easy. All you need is a PostgreSQL database and your AWS credentials:

```console
docker run -d -p 8080:8080 \
   -e AWS_REGION=<AWS_DEFAULT_REGION> \
   -e AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
   -e AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
   -e AWS_BUCKET=<terraform-bucket> \
   -e AWS_DYNAMODB_TABLE=<terraform-locks-table> \
   -e DB_PASSWORD="mygreatpasswd" \
   --link postgres:db \
   camptocamp/terraboard:latest
```

A Rancher template is also available in [Camptocamp's Rancher Catalog](https://github.com/camptocamp/camptocamp-rancher-catalog), as well as a [Helm Chart](https://github.com/camptocamp/charts/tree/master/terraboard).


### I want to help!

Terraboard is an open-source project and we heartily welcome all contributions to it. Don't hesitate to submit [Pull Requests on GitHub](https://github.com/camptocamp/terraboard).

You are also welcome to [join us on Gitter](https://gitter.im/camptocamp/terraboard) to discuss new ideas.


Happy Terraforming!

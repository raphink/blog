---
template: post
title: "💡 GitHub Sponsors and dev.to posts"
date: "2020-07-02T05:52:51Z"
excerpt: "GitHub Sponsors could be leveraged on dev.to to generate revenue"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fqdp4swhb2kngx4cmsowd.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fqdp4swhb2kngx4cmsowd.png"
canonical_url: "https://dev.to/raphink/github-sponsors-and-dev-to-posts-51b1"
devto_url: "https://dev.to/raphink/github-sponsors-and-dev-to-posts-51b1"
tags: ["discuss", "github", "sponsors", "meta"]
---
Yesterday, I read [a blog post by Caleb Porzio](https://calebporzio.com/i-just-hit-dollar-100000yr-on-github-sponsors-heres-how-i-did-it) about making money from Open Source projects, in particular by leveraging the GitHub sponsors program.

His conclusion is that the best way to use GitHub Sponsors is to make both free and paid educational content, such that free content attracts an audience, and then they want to support you to access the advanced, paid, content.

It seems to me that the DEV community, being already connected to GitHub, would be a perfect place to implement this idea.

There could be a tag in the meta parameters of a post, which would restrict its access (fully or partly, e.g. by hiding the end of the article like lots of newspapers do) to the author's GitHub sponsors:

```
# Restrict to sponsors of the raphink GitHub account
restrict_sponsors: raphink
# Restrict to sponsors of tier $10 or above
restrict_sponsors: raphink/10
```


What do you think? Is that a feature that would be interesting for the DEV community?

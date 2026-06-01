---
template: post
title: "Version number suggests Ubuntu changes"
date: "2011-02-24T09:45:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/02/version-number-suggests-ubuntu-changes.html"
blogspot_url: "https://raphink.blogspot.com/2011/02/version-number-suggests-ubuntu-changes.html"
tags: ["packaging", "ubuntu"]
---
Today, I was updating an Ubuntu package whose maintainer in Debian has a @canonical.com address.  
  
When I was building the source package, I kept getting an error:  
  

Version number suggests Ubuntu changes, but Maintainer: does not have Ubuntu address

  
This error crashed dpkg-source and prevented me from building the source package.  
  
Upon looking into the code (/usr/share/perl5/Dpkg/Vendor/Ubuntu.pm), I found that this errors only when DEBEMAIL is defined in the environment with a @ubuntu.com address ; a warning is issued otherwise.  
  
So if you ever have this problem, it's easily fixed by unsetting DEBEMAIL:  
  

$ unset DEBEMAIL

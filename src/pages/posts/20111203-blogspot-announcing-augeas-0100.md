---
template: post
title: "Announcing Augeas 0.10.0"
date: "2011-12-03T21:46:00.001+01:00"
canonical_url: "https://raphink.blogspot.com/2011/12/announcing-augeas-0100.html"
blogspot_url: "https://raphink.blogspot.com/2011/12/announcing-augeas-0100.html"
tags: ["augeas", "config-augeas-exporter", "ubuntu"]
---
[Augeas](http://augeas.net/) 0.10.0 has [just been released](https://www.redhat.com/archives/augeas-devel/2011-December/msg00004.html), and it brings a good lot of changes with it.  

  

Among them, the aug\_to\_xml method has been added. This is essentially an integration of the XML export function initially introduced in the [Config::Augeas::Exporter](http://www.raphink.info/2011/02/introducing-configaugeasexporter.html) Perl module. The port in C has seen some improvements in the XML schema, as well as in speed. There is not yet an aug\_from\_xml method, and it might take some time to come, as it brings up a lot of merging issues. This change introduces a dependency on libxml2.  
  
Dominic Cleal has been working on the new aug\_srun method, which he wishes for his  [Augeas module for Puppet](http://projects.puppetlabs.com/projects/1/wiki/Puppet_Augeas). In order to achieve this, he introduced a way to set the context of XPath expressions in /augeas/context in order to use relative paths. This is a well-known feature for the users of the Augeas module for Puppet, and it is now available for all Augeas users.  
  
A lot of lenses have been fixed and improved. As a matter of fact, when I wrote the [Config::Augeas::Validator](http://www.raphink.info/2011/12/unit-testing-your-configuration-files.html) Perl module, the goal was initially to test our configuration files against the Augeas lenses. But after testing some 120.000 files, I've obviously found a few flaws in the lenses and had to fix them.  
  
The package for Augeas 0.10.0 has entered Ubuntu Precise [this afternoon](https://lists.ubuntu.com/archives/precise-changes/2011-December/004129.html). Versions for older releases are available [on my Augeas PPA](https://launchpad.net/~raphink/+archive/augeas/+packages). Feedback is most welcome!

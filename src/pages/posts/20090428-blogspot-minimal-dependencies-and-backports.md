---
template: post
title: "Minimal dependencies and backports"
date: "2009-04-28T09:55:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2009/04/minimal-dependencies-and-backports.html"
blogspot_url: "https://raphink.blogspot.com/2009/04/minimal-dependencies-and-backports.html"
tags: ["backports", "debian", "linux", "package", "packaging", "sysadmin", "ubuntu"]
---
I've been packaging for a production environment for nearly three years now. We have a lot of machines using old systems, such as sarge and etch, and my work is often to backport new software to these OSes. While the work is fun, I often find myself fighting with dependencies, and especially with debhelper build dependencies.  
  
For example, I find more and more Perl packages in Debian that depend on debhelper 7. I tried to backport debhelper 7 for etch, but it pulled all sorts of things with it, all the way to dpkg-dev, which messed up the whole system, so I gave up. In this case, I have to end up upgrading debhelper 5 packages to newer upstream versions when I need, since using debhelper 7 is virtually impossible in sarge and etch.  
  
In other cases, I find packages that build depend on debhelper 6 and have "6" in debian/compat. Changing the values to "5" doesn't prevent the build, so all that is to do is change the value back to "5".  
  
Maybe it's me not understanding the concept of minimal dependency and compatibility, but I really don't get why it is a rule to keep bumping debhelper compability (and often, other libs too) when there is absolutely no need for it. If a program works with Perl 5.4, why make people believe it requires Perl 5.8 to run? There are still people running Perl 5.4 on old machines somewhere, who would be happy to not have to change the minimal dependencies to use a program that would run fine on their machines.  
  
I understand very well that package development in the community is centered on new versions and that it's just easier to "force" people to upgrade their systems altogether (remember the "mysql-server" meta-packages magically upgrading from MySQL 4.1 to MySQL 5.0 in etch ?), but if Debian and Ubuntu want to be enterprise-class OSes, I think we ought to adapt better to the reality of production environments, and that includes making it easier for sysadmins to manage old systems without depending on new tools.  
  
I'd be very happy to hear from the experience of other sysadmins in production environments regarding this issue.

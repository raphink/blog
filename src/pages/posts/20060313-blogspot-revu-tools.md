---
template: post
title: "REVU-Tools"
date: "2006-03-13T15:18:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2006/03/revu-tools.html"
blogspot_url: "https://raphink.blogspot.com/2006/03/revu-tools.html"
tags: ["linux", "pbuilder", "restored"]
---
I’ve just uploaded a version 0.6 of REVU-Tools to Dapper.

Thanks to Fathi Boudra, it now supports cascading settings in /etc/revu-tools.conf, /usr/share/revu-tools/revu-tools.conf and ~/.revu-tools.conf. Note that the package only creates /etc/revu-tools.conf so far.

Note that it is usually a good idea to set at least PBUILDERNAME (most users want it set to “sudo pbuilder”) before running the tools, and REVUDIR if you plan on using revu-review.

For more infos on REVU-Tools, you can check [the wiki page](http://web.archive.org/web/20060806182544/https://wiki.ubuntu.com/MOTU/Packages/REVU/REVU-Tools).

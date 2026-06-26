---
template: post
title: "Sharing partition with MacOS"
date: "2006-03-11T15:19:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2006/03/sharing-partition-with-macos.html"
blogspot_url: "https://raphink.blogspot.com/2006/03/sharing-partition-with-macos.html"
tags: ["english", "linux", "mac", "restored"]
---
Since I’ve just installed a double boot with MacOS X Panther and Kubuntu Dapper, I’ve been wondering how to share datas between both OSes.

I found answers on various forums. I tried a few things, and these are my conclusions (summing up forums on some points):

-   Although MacOS claims to support Unix FS, it is a bad idea to use it, cause it doesn’t use the standard (FreeBSD) implementation of it, so Linux won’t recognize it.
-   Using FAT would do, but would be weird to share between two Unix systems…
-   MacOS doesn’t support ext2 natively. That is very bad for a Unix system, but that’s how it is. There is an [ext2 for MacOS project on sourceforge](http://web.archive.org/web/20060806182544/http://sourceforge.net/projects/ext2fsx/) but it doesn’t seem to me like the best option…
-   Linux has been supporting hfs+ since quite a lot of time, and Ubuntu’s kernel uses it without a slight problem, so that seems like the best idea. However, recently, the support for writing on hfs+ **journalised** FS has been disabled by the maintainer because it caused too many bugs. Therefore the best option seems to use **not journalised hfs+** for a common partition.

This is what I have in my /etc/fstab to set this partition :

/dev/hda4       /home/medias    hfsplus user,rw,umask=022       0       0

Enjoy!

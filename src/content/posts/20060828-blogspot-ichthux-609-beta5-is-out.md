---
template: post
title: "Ichthux 6.09 beta5 is out"
date: "2006-08-28T15:31:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2006/08/ichthux-609-beta5-is-out.html"
blogspot_url: "https://raphink.blogspot.com/2006/08/ichthux-609-beta5-is-out.html"
tags: ["christian", "english", "ichthux", "kubuntu", "linux", "release", "restored"]
---
[![Ichthux\_BubbleFish\_Mod\_small\_transparent.png](http://web.archive.org/web/20061230082703/http://raphink.info/blog/wp-content/uploads/2006/08/Ichthux_BubbleFish_Mod_small_transparent.png)](http://web.archive.org/web/20061230082703/http://www.ichthux.com/ "Ichthux_BubbleFish_Mod_small_transparent.png")

The Ichthux team is proud to announce the release of **[Ichthux 6.09 beta5](http://web.archive.org/web/20061230082703/http://www.ichthux.com/)**.

### Release Notes

**Remember:**  
This is beta software and even though it should be pretty stable (we are building from [Kubuntu’s](http://web.archive.org/web/20061230082703/http://www.kubuntu.org/) 6.06 release) be aware that it could have problems. What we would like, at this point, is to have as many people try Beta5 out so that we can fix any remaining bugs before we realease Ichthux 6.09 some time in September.

### Ichthux 6.09 beta5 features include

-   all Kubuntu 6.06.1 “Dapper Drake” features and applications plus,
-   BibleTime Bible reader
-   kio-sword for Bible reader integration in Konqueror
-   several Bibles installed by default for English (KJV), Spanish (SPARV), French (LSG), Hebrew (WLC), Greek (TR), Korean (Korean), Italian (Itadio) , Arabic (Arasvd), Russian (RST), and German (Gerlut1545)
-   Christian console tools: verse, bible-kjv
-   Christian emoticons theme for instant messaging in Kopete
-   kdict (KDE Dictionary) with the Easton and Hitchcock Bible dictionaries
-   content filter (willowng) for blocking undesired websites
-   default artwork and settings designed with Christians in mind

### Downloading

You can get Ichthux 6.09 beta5 from various servers:

-   [Denmark (http://ichthux.pj2.org)](http://web.archive.org/web/20061230082703/http://ichthux.pj2.org/6.09-beta5/)
-   [USA (http://matheteuo.org/)](http://web.archive.org/web/20061230082703/http://matheteuo.org/ichthux/6.09-beta5/)
-   [USA (http://www.misterben.org.uk)](http://web.archive.org/web/20061230082703/http://www.misterben.org.uk/ichthux/)
-   [France (http://ichthux.free.fr)](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/iso/6.09-beta5/)
-   [France (http://fr.mirror.ichthux.com)](http://web.archive.org/web/20061230082703/http://fr.mirror.ichthux.com/6.09-beta5)

### Installing from Ubuntu

Whether you have Ubuntu or one of its derivatives on your computer, you can easily install Ichthux on your computer, by doing the following:

Add the Ichthux repository to your sources.list:

`    deb http://archive.ichthux.com/ichthux grace main   deb-src http://archive.ichthux.com/ichthux grace main    `

Type the following commands in a console to install Ichthux:

`    wget http://archive.ichthux.com/ichthux.asc # This downloads the key to identify the Ichthux repository   sudo apt-key add ichthux.asc   sudo apt-get update   sudo apt-get install ichthux-desktop    `

The Ichthux CD also installs sword modules for your language when they are available. If you wish to have them, you can perform this installation by installing the sword-language-pack-\* module corresponding to your language. For example, for French support:

`    sudo apt-get install sword-language-pack-fr    `

### General Usage Notes:

Beta5 is a LiveCD, which means it can be run from the CD without installing anything to your computer’s hard drive. When you boot up the CD it will take you to a “Kubuntu” boot screen, don’t worry, we are working on changing that to an Ichthux one. If you want to install Beta5 just click on the “Install” icon on the desktop when it is fully loaded.

The willowng content filter needs to be turned on before it can be used. To do this go to the Kmenu and go to Settings -> Content Filter. You will need to add “bad” addresses which are the ones you want to block in the “Domain Filtering” tab. Then set up your browser to use URL “localhost” and port “8563″.

### Bug Reporting:

Please use our Launchpad [Bug tracker](http://web.archive.org/web/20061230082703/https://launchpad.net/products/ichthux/+bugs) to file bugs on problems that are specific to Ichthux. If the problem seems to be with non-Ichthux specific programs like the kernel or Xorg please use the Kubuntu Launchpad [Bug tracker](http://web.archive.org/web/20061230082703/https://launchpad.net/distros/ubuntu/+bugs).

You can also contact us by the methods on the [Contact](http://web.archive.org/web/20061230082703/http://www.ichthux.com/?q=node/2) page.

---
template: post
title: "Dynamic presentations with Jessyink"
date: "2009-10-12T21:38:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2009/10/dynamic-presentations-with-jessyink.html"
blogspot_url: "https://raphink.blogspot.com/2009/10/dynamic-presentations-with-jessyink.html"
tags: ["inkscape", "presentation", "ubuntu"]
---
Some time ago, I attended a presentation made with [Prezi](http://prezi.com/) and I was pretty impressed. As I looked into it, a few things bugged me though:  

  
-   it's in flash
  
-   I can't really share my presentations with anyone
  
-   I have to design my slides online, or use an offline app (paid) which will connect online
  
-   There is no good support for full screen presentations in Linux
  
-   It doesn't use a portable format
  

  
  
  
From looking at the features, I really couldn't see why it couldn't be implemented using SVG (except for the flash movies embedded in the presentation maybe...), so I began to search for a project that would do the same, using SVG, and I found Jessyink.  
  
[Jessyink](https://launchpad.net/jessyink) is exactly what I was searching for. It's a plugin for Inkscape which adds the possibility to design slides from an SVG, and ships a javascript library inside the resulting SVG for execution. The result is that:  

  
-   It's portable: apps that understands SVG and javascript can play it (e.g. Firefox, on any platform. Arora did fine too, but Konqueror wouldn't work)
  
-   It's an open format, with open standards: I can send the svg to someone, and they can edit it with inkscape using the Jessyink plugin
  
-   The possibilities are endless: I'm not limited to styles and fonts found on prezi.com, I can choose whatever font I want, whatever style I want
  
-   It's open-source!
  
-   It not only supports prezi-like effects inside slides, but also traditional slides, that can each behave like prezi-like presentations
  

  
  
Jessyink is harder to use than prezi.com though, but if you know how to use Inkscape, you will soon be able to do what you want with it.  
  
  
Here is a [quick & dirty example](http://r.pinson.free.fr/jessyink/mapnice.svg) I made with Jessyink. Some tips:  

  
-   Use the arrows to navigate through the presentation
  
-   Use the 'i' key to get an index of the slides (two slides in that case)
  
-   Use the 'd' key to draw on the presentation as you go through it!
  
-   See [this page](http://code.google.com/p/jessyink/wiki/keyBindings) for more tips!

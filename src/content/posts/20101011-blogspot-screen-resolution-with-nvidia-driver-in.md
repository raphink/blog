---
template: post
title: "Screen resolution with nVidia driver in Lucid"
date: "2010-10-11T10:21:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2010/10/screen-resolution-with-nvidia-driver-in.html"
blogspot_url: "https://raphink.blogspot.com/2010/10/screen-resolution-with-nvidia-driver-in.html"
tags: ["nvidia", "ubuntu", "xorg"]
---
I struggled recently with a bug on a desktop running Lucid. Whenever I would log in, I got a session set to 1024x768. I would go to the nvidia-settings, reset it to 1280x1024 and it would be fine. As I didn't have much time for it and logged in only once a week or so, I kept doing this for some time, but it ended up bugging me quite a bit. Then this morning, I found [this bug report](https://bugs.launchpad.net/ubuntu/+source/nvidia-settings/+bug/362704).  
  
So if you're experiencing this bug, it's very easy to fix:  
  

-   Edit your ~/.config/monitors.xml
-   Adapt it to your configuration (in my case, that's 1280x1024 and a rate of 60Hz).
-   Log out and back in.

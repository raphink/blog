---
template: post
title: "Look Ma, no mouse!"
date: "2008-09-06T19:31:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/look-ma-no-mouse.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/look-ma-no-mouse.html"
tags: ["edubuntu", "english", "ltsp", "ubuntu"]
---
I have recently set up a small [LTSP](http://www.ltsp.org/) network for an association in my street. Some days ago, I was asked if it was possible to display photos on all of the LTSP machines at the same time to show the activities of the association. This is of course very easy to set up, but I didn't want to leave keyboards or mice on the computers, to make sure nobody would exit the photo program or try to reboot the machine.  
  
The quickest solution I found to do that easily was to use [synergy](http://synergy2.sourceforge.net/) and wireless keyboard and mouse. Synergy allows to share keyboards and mice between several computers, running Windows, MacOS or Linux. It actually goes further than this, since you can also copy and paste contents (text, images, etc) from one computer to another. The down side of it is that it's not secure, but that was not a problem in my case at all.  
  
So in my case, I just started synergys on the main machine (the LTSP server) having set virtual screens in synergy.conf for all the ltsp thin clients. Then I started synergyc on each client with `synergyc --name ltsp1 localhost`, adapting the name for each machine. Finally, I removed all keyboards and mice from the computers and only left the wireless keyboard and mouse on the LTSP server. This left me with a group of computers without any keyboards or mice plugged to them, which could each be controlled by a wireless devide, by simply dragging the wireless mouse from a screen to another. All that was left to do was to launch the slideshows on each machine and hide the keyboard and mouse in a corner, to be used only when necessary.

---
template: post
title: "HP Deskjet 3520 e-All-in-One and Ubuntu Quantal"
date: "2012-10-30T21:23:00.001+01:00"
canonical_url: "https://raphink.blogspot.com/2012/10/hp-deskjet-3520-e-all-in-one-and-ubuntu.html"
blogspot_url: "https://raphink.blogspot.com/2012/10/hp-deskjet-3520-e-all-in-one-and-ubuntu.html"
tags: ["ubuntu"]
---
I just got an [HP Deskjet 3520 e-All-in-One](http://h10010.www1.hp.com/wwpc/us/en/sm/WF05a/18972-18972-238444-1142650-410635-5162504.html?dnr=1) multifunction printer today, which works very well with Ubuntu Quantal.  
  
Here are the steps to print on it through Wifi. I used WPS to associate it to my network:  
  

1.  Plug printer and turn it on. Follow the instructions on screen until it tells you to set up your computer;
2.  Turn on WPS on your wireless router. If it's available, it should be in the wireless security settings. You can choose either the “Push button” or the “Pin” option.
3.  Go to the “Wifi-Protected Setup” menu on the printer and choose the option you wish to use (according to what you chose on your wifi router);
4.  Associate the printer with your network;
5.  On your Ubuntu Quantal machine, go to the Printer Settings (in System Settings), add a printer, choose the “Network Printer” menu and the printer should appear. Just choose the HPLIP driver and you're done. Note that it also installs the scanner, so you can remotely scan using Simple Scan.

I also had to setup another machine on Ubuntu Precise. Unfortunately, the driver for the 3520 printer was added in HPLIP  3.12.6. However, downloading the hplip packages for Quantal and installing them worked fine on Precise. The packages you need are:  
  

-   hplip;
-   hplip-data;
-   libhpmud0;
-   libsane-hpaio.

 Once the printer's network is setup, you can access it via an HTTP interface at its IP address.

---
template: post
title: "Follow-up on screen profiles"
date: "2008-12-18T10:38:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2008/12/follow-up-on-screen-profiles.html"
blogspot_url: "https://raphink.blogspot.com/2008/12/follow-up-on-screen-profiles.html"
tags: ["debian", "linux", "screen", "sysadmin", "ubuntu"]
---
After reading [Justin's proposal](http://blog.dustinkirkland.com/2008/12/ubuntu-server-includes-window-manager.html) on screen profiles and [Nicolas' answer](http://nicolas.barcet.com/drupal/screen-by-default) on automatic screen launch, I've worked a bit on a profile for my company. I added a few things to it:  

-   "hostname -f" after the release. %H provides "hostname -s" but I preferred a fqdn since we have many machines named the same.  
    
-   load average (%l) after updates-available  
    
-   number of users (taken from \`uptime\`)  
    
-   uptime (taken from \`uptime\`)

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixVK_h6q1cbauRMpNmFHadFhfHlqRwKuTY4QeDTF83zkUnXRg7_KyFOuWLkbjiEbpETyT_ChE85H48JSl5arX7LcpELNdNo3on9Cc06RmHWhmw8poS8l33Jnl8opGnUSYhYZLfAyeTywiQ/s320/hebex-screen.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixVK_h6q1cbauRMpNmFHadFhfHlqRwKuTY4QeDTF83zkUnXRg7_KyFOuWLkbjiEbpETyT_ChE85H48JSl5arX7LcpELNdNo3on9Cc06RmHWhmw8poS8l33Jnl8opGnUSYhYZLfAyeTywiQ/s1600-h/hebex-screen.png)  
  
with some nice colors. For thoses interested, here are the scripts :  
  
  
```bash
$ cat load-average
#!/bin/sh
uptime | sed -e "s/.*load average: //" | tr -d " " | tr "," " "

$ cat nb-users
#!/bin/sh
uptime | sed -e "s/.*, *\(.* users\), .*/\1/"

$ cat release-short
#!/bin/sh
lsb_release -i -c -s | tr "\n" " "

$ cat uptime
#!/bin/sh
uptime | sed -e "s/.* up *\(.*\), *.* users, .*/\1/"
```  
  
  
I added the following lines to the "common" profile :  
```text
backtick 105 5 5 /usr/share/screen-profiles/bin/load-average
backtick 106 10 10 /usr/share/screen-profiles/bin/nb-users
backtick 107 10 10 /usr/share/screen-profiles/bin/uptime
backtick 108 10 10 /bin/hostname -f
backtick 109 3600 3600 /usr/share/screen-profiles/bin/release-short
```  
  
  
and this is my hardstatus line :  
```text
hardstatus string '%{+b Wr} (*) Hebex %{+b wk} %100`%{= Wk}|%{+b Gk}%108`%{= Wk}|%= |%{+b rW}%101`%{= Wk}|%{+b Ck}%l%{= Wk}|%{+b Mk}%106`%{= Wk}|%{+b bW}%107`%{= Wk}|%{+b gW}%103`%{= Wk}|%{= wk}%Y-%m-%d %c:%s'
```  
  
  
  
Then I tried to connect from my Acer Aspire One and I realized that the line didn't fit on my screen (the 9" screen that is...). So I made a short profile for this purpose, by using %H instead of "hostname -f" and making a release-short function that only displays \`lsb\_release -i -c -s | tr "\\n" " "\`. I made this a new profile. Here is the hardstatus line :  
  
  
```text
hardstatus string '%{+b Wr} (*) Hebex %{+b wk}%109`%{= Wk}|%{+b Gk}%H%{= Wk} %=|%{+b rW}%101`%{= Wk}|%{+b Ck}%l%{= Wk}|%{+b Mk}%106`%{= Wk}|%{+b bW}%107`%{= Wk}|%{+b gW}%103`%{= Wk}|%{= wk}%Y-%m-%d %c:%s'
```  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZuS07DN1XlUr_0tkGfc3X1ITbtxOym3XkxQf76VdRpEY1fM7NwpQeuKAPSq-O9Q9aEuHGVwXJObSWDZS5xaSS4gj7Qjjueonrui2osX-WAfjUniJrQkH0ZqdFW_k0Yfuhk54MM-r72Goi/s320/hebex-screen-short.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZuS07DN1XlUr_0tkGfc3X1ITbtxOym3XkxQf76VdRpEY1fM7NwpQeuKAPSq-O9Q9aEuHGVwXJObSWDZS5xaSS4gj7Qjjueonrui2osX-WAfjUniJrQkH0ZqdFW_k0Yfuhk54MM-r72Goi/s1600-h/hebex-screen-short.png)  
Then I wondered how I could load it automatically when I connect from my notebook. So I tweaked a bit Nicolas' lines and made a .screen\_bashrc which I source in my .bashrc :  
  
  
```bash
if [ "$PS1" ]; then
	# Set screen-profile to short if we're on a notebook
	# to normal otherwise
	if [ "x${LC_NOTEBOOK}" = "xyes" ]; then
		ln -sf /usr/share/screen-profiles/profiles/hebex-short.screenrc $HOME/.screenrc-profile
	else
		ln -sf /usr/share/screen-profiles/profiles/hebex.screenrc $HOME/.screenrc-profile
	fi

	if [ "$TERM" != "screen" ]; then
		#screen -D -R
		#Update 2008 Dec 16: -xRR is way better
		screen -xRR
	fi
fi
```  
  
  
On my notebook, I added a "export LC\_NOTEBOOK=yes" to my .bashrc, so whenever I connect to a machine using the notebook, the short screen profile is automatically selected instead of the normal one, and I can see all infos on my small screen :)  
  
Note: I chose LC\_NOTEBOOK because LC\_\* variables are usually listed in AcceptEnv in /etc/ssh/sshd\_config to export language settings, so I was pretty sure that the variable would be exported fine.

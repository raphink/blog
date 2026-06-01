---
template: post
title: "Thou shalt not loop"
date: "2008-09-17T14:11:00.001+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/thou-shalt-not-loop.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/thou-shalt-not-loop.html"
tags: ["english", "sysadmin", "ubuntu"]
---
I've been using [incron](http://inotify.aiken.cz/?section=incron&page=about&lang=en) extensively to write a CVS synchronizer for my company lately (the last post about Perl modules was part of that). This synchronizer uses incron to monitor all CVSROOT/history files. When history files are modified, the script is launched, analyzes the changed files and synchronizes them (using the tar|tar method described in my last post) to the fallback machine. This allows to have a pretty much synchrone fallback... but that's without counting on the developers using the machine... Some of them commit as much as 300 files a minute, which triggers the script just as many times!  
  
Of course, one of the first things I wrote in the script is a lock. In that case, it uses Proc::Processtable to make the script exit if it is already running on the same history file. But that was not enough.  
  
Then I discovered IN\_NO\_LOOP. This optional parameter in incrontab is described this way:  
  
  
Additionaly, there is a symbol which doesn't appear in the inotify symbol set. It is IN\_NO\_LOOP. This symbol disables monitoring events until the current one is completely handled (until its child process exits).  
  
  
  
This solved my problem. When an history file is changed, incron fires the command and disables the monitoring on this history file until the command returns.

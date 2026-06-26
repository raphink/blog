---
template: post
title: "SSH + pam_chroot"
date: "2008-09-23T16:09:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/ssh-pamchroot.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/ssh-pamchroot.html"
tags: ["english", "linux", "notes", "sysadmin", "ubuntu"]
---
I've been trying to get pam\_chroot to work with ssh. There's a few little things to do to get it to work.  

  
-   Install pam\_chroot and set your chroot. See [http://singe.za.net/blog/archives/378-Linux-SSH-Jail\-with-pam\_chroot.html](http://singe.za.net/blog/archives/378-Linux-SSH-Jail-with-pam_chroot.html)  
    
-   Set UsePrivilegeSeparation to "no" in sshd\_config and restart sshd  
    
-   Add the pam\_chroot line to /etc/pam.d/ssh aswell as /etc/pam.d/login.  
    
-   Make sure there's a /tmp dir in your chroot. If not, create it : mkdir -m 1777 $CHROOTDIR/tmp  
    
-   Make sure you have the libs to execute your shell inside the chroot. A bit of a barbarian way to do that (adapt to your shell) is :  
    cp $(ldd /bin/bash | sed -e "s/.\* => \\(\[^\\)\]\*\\) .\*/\\1/") $CHROOTDIR/lib/  
      
      
    If you need to debug:  
    
-   Turn on debug in the pam\_chroot line of /etc/pam.d/ssh. This will display the debug messages in /var/log/auth.log on Debian.  
    
-   Turn on debug in sshd ('SSHD\_OPTS="-d"' in /etc/default/ssh) and restart sshd.  
    
-   Use verbose on your ssh client.  
    
-   Check the logs inside the chroot too, if you have syslogging on.

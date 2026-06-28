---
template: post
title: "Forcing environment in SSH"
date: "2008-09-23T16:10:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/forcing-environment-in-ssh.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/forcing-environment-in-ssh.html"
tags: ["english", "linux", "notes", "sysadmin", "ubuntu"]
---
It's quite easy to force environments variables in an SSH session, since /etc/profile, /etc/bash.bashrc etc. are read. But when you launch commands with SSH without opening a session, these files are not parsed, so it gets harder to set the environment.  
  
So it can be useful to know that /etc/environment is read by SSH aswell as login. The format is "VARIABLE=VALUE" for each line. In my case, I needed to force TMPDIR to "/var/lib/gforge-dop/chroot/tmp" so I just put "TMPDIR=/var/lib/gforge-dop/chroot/tmp" in /etc/environment and it worked :)  
  
You can test if your variable is added by doing :  
```bash
ssh user@host env
```  
  
and see if your variable is listed properly by env.  
  
  
If you need to set environment variables per user, you can use ~/.ssh/environment. In order to do that, you need to set PermitUserEnvironment to "yes" in sshd\_config and restart sshd.

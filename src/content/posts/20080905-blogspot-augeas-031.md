---
template: post
title: "Augeas 0.3.1"
date: "2008-09-05T17:53:00.001+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/augeas-031.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/augeas-031.html"
tags: ["augeas", "conference", "debian", "english", "open-source", "release", "ubuntu"]
---
[Augeas](http://augeas.net/) 0.3.1 is out! This is the announcement from the augeas-devel mailing-list:  
  
  

>   
> I am pleased to announce the release of Augeas 0.3.1; it has been much  
> longer than I'd like since the last release, and this release contains  
> many more changes than is betrayed by the small change in version  
> numbers.  
>   
> There has been a tremendous amount of activity both in enhancing  
> existing lenses and in writing new ones. I have tried to keep track of  
> all the contributors in the NEWS - if you sent a patch and didn't get  
> credit for it, please remind me (gently ;) With that much activity in  
> lens-writing, I feel that we need to figure out a way to indicate which  
> lenses we consider 'finished' and which ones we consider 'experimental',  
> so that users know where changes in the tree are likely.  
>   
> The release can be downloaded from:  
>   
> Tarball: [http://augeas.net/download/augeas\-0.3.1.tar.gz](http://augeas.net/download/augeas-0.3.1.tar.gz)  
> Fedora RPM's are making their way through the build system  
>   
> Detailed NEWS:  
>   
> \- Major performance improvement when processing huge files, reducing  
> some O(n^2) behavior to O(n) behavior. It's now entirely feasible  
> to manipulate for example /etc/hosts files with 65k lines  
> \- Handle character escapes '\\x' in regular expressions in compliance  
> with Posix ERE  
> \- aug\_mv: fix bug when moving at the root level  
> \- Fix endless loop when using a mixed-case module name like  
> MyMod.lns  
> \- Typecheck del lens: for 'del RE STR', STR must match RE  
> \- Properly typecheck the '?' operator, especially the atype; also  
> allow '?' to be applied to lenses that contain only 'store', and  
> do not produce tree nodes.  
> \- Many new/improved lenses  
> \* many lenses now map comments as '#comment' nodes instead of just  
> deleting them  
> \* Sudoers: added (Raphael Pinson)  
> \* Hosts: map comments into tree, handle whitespace and comments  
> at the end of a line (Kjetil Homme)  
> \* Xinetd: allow indented comments and spaces around "}" (Raphael Pinson)  
> \* Pam: allow comments at the end of lines and leading spaces  
> (Raphael Pinson)  
> \* Fstab: map comments and support empty lines (Raphael Pinson)  
> \* Inifile: major revamp (Raphael Pinson)  
> \* Puppet: new lens for /etc/puppet.conf (Raphael Pinson)  
> \* Shellvars: handle quoted strings and arrays (Nahum Shalman)  
> \* Php: map entries outside of sections to a '.anon' section  
> (Raphael Pinson)  
> \* Ldap: new lens for /etc/ldap.conf (Free Ekanayaka)  
> \* Dput: add allowed\_distributions entry (Free Ekanayaka)  
> \* OpenVPN: new lens for /etc/openvpn/{client,server}.
> 
> conf (Raphael Pinson)  
> \* Dhclient: new lens for /etc/dhcp3/dhclient.conf (Free Ekanayaka)  
> \* Samba: new lens for /etc/samba/smb.conf (Free Ekanayaka)  
> \* Dnsmasq: new lens for /etc/dnsmasq.conf (Free Ekanayaka)  
> \* Slapd: new lens for /etc/ldap/slapd.conf (Free Ekanayaka)  
> \* Sysctl: new lens for /etc/sysctl.conf (Sean Millichamp)  
>   
> David  
>   
>   

  
  
An updated package is already in Debian, thanks to Free, and Nicolas (aka nxvl) will try to get an exception to include it in Intrepid before it's too late.  
  
In other news, I'm likely to give a talk on Augeas at the [JM2l](http://jm2l.linux-azur.org/) in Sophia Antipolis.

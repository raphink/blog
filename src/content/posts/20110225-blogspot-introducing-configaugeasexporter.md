---
template: post
title: "Introducing Config::Augeas::Exporter"
date: "2011-02-25T23:13:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/02/introducing-configaugeasexporter.html"
blogspot_url: "https://raphink.blogspot.com/2011/02/introducing-configaugeasexporter.html"
tags: ["augeas", "config-augeas-exporter", "perl", "ubuntu"]
---
Following my little experiments [from two days ago](http://www.raphink.info/2011/02/exporting-augeas-tree-to-xml.html), I decided to turn my prototype into a Perl module so others could benefit from it.  
  
I am therefore happy to introduce [Config::Augeas::Exporter](http://search.cpan.org/~raphink/Config-Augeas-Exporter-0.1/lib/Config/Augeas/Exporter.pm), uploaded today to the CPAN. Packages are also available for Ubuntu Lucid and Natty in [the Augeas PPA](https://launchpad.net/~raphink/+archive/augeas/+packages).  
  
This module wraps up around [Config::Augeas](http://search.cpan.org/~ddumont/Config-Augeas-0.701/lib/Config/Augeas.pm) and currently provides 4 public export methods:  

-   to\_xml(): export the Augeas tree to an XML::LibXML::Document object ;
-   to\_hash(): export the Augeas tree to a hash ;
-   to\_json(): export the Augeas tree to a JSON document ;
-   to\_yaml(): export the Augeas tree to a YAML document ;

  
In addition to this, it also provides a from\_xml() method to import back an XML exported tree.  
  
The module is shipped with two scripts, aug2xml and xml2aug, which are essentially the scripts presented in [my previous blog entry](http://www.raphink.info/2011/02/exporting-augeas-tree-to-xml.html), rewritten to use the module.  
  
Thanks to the great advice of [David Lutterkort](http://watzmann.net/lutter/), Augeas' main developer, the XML layout has been improved, which makes it much nicer, smaller, easier to parse, and much easier to import back.  
  
As a result of this, xml2aug is now able to replace only the files listed in the XML document, instead of replacing the whole tree.  
  
Here are some examples of what can be done with aug2xml and xml2aug:  
  

\# Let's export the pam.d files only, excluding the comment nodes
$ aug2xml -p '/files/etc/pam.d' -e "#comment"  > export.xml
# How many files where exported?
$ grep -o "<file" export.xml | wc -l
34
$ ls -lh export.xml 
-rw-r--r-- 1 raphink raphink 20K 2011-02-25 23:06 export.xml
# We can try some XPath requests on the file
# For example finding the control condition
# for the pam\_env.so module in the cron rule
$ xpath -e '//file\[@path="/etc/pam.d/cron"\]/node\[node\[@label="module"\]="pam\_env.so"\]/node\[@label="control"\]' export.xml 
Found 2 nodes in export.xml:
-- NODE --
required
-- NODE --
required
# Now let's import it back to a clean fakeroot
$ mkdir -p fakeroot/etc/pam.d
$ xml2aug -r fakeroot/ -f export.xml
$ tree fakeroot/
fakeroot/
└── etc
    └── pam.d
        ├── atd
        ├── chfn
        ├── chpasswd
        ├── chsh
        ├── common-account
        ├── common-auth
        ├── common-password
        ├── common-session
        ├── common-session-noninteractive
        ├── cron
        ├── cups
        ├── cvs
        ├── gdm
        ├── gdm-autologin
        ├── gnome-screensaver
        ├── kcheckpass
        ├── kdm
        ├── kdm-kde4
        ├── kdm-kde4-np
        ├── kdm-np
        ├── kscreensaver
        ├── login
        ├── newusers
        ├── other
        ├── passwd
        ├── polkit
        ├── polkit-1
        ├── ppp
        ├── samba
        ├── sshd
        ├── su
        ├── sudo
        └── xscreensaver

2 directories, 33 files

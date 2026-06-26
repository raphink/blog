---
template: post
title: "Manually associating lenses with files in Augeas"
date: "2011-02-18T22:59:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/02/manually-associating-lenses-with-files.html"
blogspot_url: "https://raphink.blogspot.com/2011/02/manually-associating-lenses-with-files.html"
tags: ["augeas", "ubuntu"]
---
#### Autoload statements and known files

  
[Augeas](http://www.augeas.net/) comes with a good collection of lenses that allow to parse the most common configuration files. Lenses are bidirectional pieces of code which allow Augeas to parse a configuration file and turn its content into a tree. Most lenses have an autoload statement which associates them with a specific set of files. For example, mysql.aug is associated with /etc/my.cnf and fstab.aug is associated with /etc/fstab. When Augeas is loaded, it searches the system for files that it knows about and tries to parse them with the associated lenses.  
  
  

#### Lenses without autoload statements

  
In some cases though, lenses are not associated with specific files through an autoload statement. This is the case for generic modules, such as util.aug, sep.aug, rx.aug, build.aug or inifile.aug, but also for lenses for which we do not know specific configuration files in a standard system. Such is the case of json.aug, since JSON is used a lot to serialize data between two programs, but hardly as static configuration files. Augeas has a JSON lens, but it is not associated with any known file.  
  
  

#### How to use lenses without autoload statements

  
How then, would you go about using the JSON lens on a file of your choice? There are several possibilities. Let's say you have a JSON file called foo.json located at /home/bar/foo.json and you want to parse it using augtool.  
  
  

##### Manipulating Augeas metadata on-the-fly

  
Augeas provides two root nodes in its tree: "/files" and "/augeas". The former lists the files Augeas was able to parse with its set of lenses, while the latter provides access to Augeas' metadata. In this last part of the tree, lenses can be manipulated on-the-fly.  
  
Let's launch augtool and add /home/bar/foo.json to the JSON lens:  
  

\# --noload deactivates all known lenses to make augtool faster
$ augtool --noload
> # json.aug is not loaded by default, set it up
> set /augeas/load/Json/lens Json.lns
> # Add to /home/bar/foo.json to the known files
> set /augeas/load/Json/incl /home/bar/foo.json
> # Load known files
> load
> print /files/home/bar/foo.json

  
From the (soon to be released) 8.0.0 version of Augeas, a -i flag will be available in augtool allowing to interpret a file before launching an interactive augtool shell. With this option, it will be possible to set a file with the previous contents and use it as an argument to augtool:  
  

$ cat json\_foo.augtool
# json.aug is not loaded by default, set it up
set /augeas/load/Json/lens Json.lns
# Add to /home/bar/foo.json to the known files
set /augeas/load/Json/incl /home/bar/foo.json
# Load known files
load
$ augtool --noload -if json\_foo.augtool
> print /files/home/bar/foo.json

  
  

##### Creating a derived lens for the file

  
Augeas allows lenses to use definitions declared in other lenses. This is how generic modules are made to make lens development easier. It also allows you to make your own lenses, derived from existing lenses.  
  
In our case, we could write a lens and use it:  
  

$ cat jsonfoo.aug
module JsonFoo =
   autoload xfm
   let filter = incl "/home/bar/foo.json"
   let xfm = transform Json.lns filter
$ augtool -I . 
> print /files/home/bar/foo.json

  
In Debian and Ubuntu systems, lenses provided with Augeas are placed in /usr/share/augeas/lenses/dist, so you can place your own lenses in /usr/share/augeas/lenses without a risk of overriding them.  
  
  

#### Other lenses

  
These techniques apply to all lenses provided by Augeas. If you have a PHP configuration that is not in a standard path, you can use them to manipulate this file.

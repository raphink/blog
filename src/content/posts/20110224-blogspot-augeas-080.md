---
template: post
title: "Augeas 0.8.0"
date: "2011-02-24T11:21:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/02/augeas-080.html"
blogspot_url: "https://raphink.blogspot.com/2011/02/augeas-080.html"
tags: ["augeas", "ubuntu"]
---
Right on time for Natty feature freeze, [Augeas](http://www.augeas.net) 0.8.0 [has been released](https://www.redhat.com/archives/augeas-devel/2011-February/msg00068.html) and is uploaded to Natty!  
  
Packages are also available for Lucid and Maverick in the [Augeas PPA](https://launchpad.net/~raphink/+archive/augeas/+packages).  
  
  

#### What's new in Augeas?

  
Well, quite a bit. To begin with, thanks to the great work of [Francis Giraldeau](http://multivax.blogspot.com/), the main change is the addition of a new "square" lens combinator, which makes it possible to write such lenses as XML or Apache. Francis has committed both xml.aug and httpd.aug.  
  
Antoher improvement which I am sure will bear fruits in the future is the addition of the aug\_span API call. This will allow developments such as [augedit](http://multivax.blogspot.com/2010/10/augedit-regedit-for-linux.html), which could greatly improve configuration management GUIs.  
  
Augtool has also benefitted quite a bit from this release, gaining a few options:  

-   \--autosave makes sure to call "save" after all commands are issued ;
-   \--interactive lets you run an interactive shell after intepreting the commands passed in a file or via STDIN (see [this post](http://www.raphink.info/2011/02/manually-associating-lenses-with-files.html) for an example) ;
-   \--nostdinc, --noload and --noautoload have gained short options, so they can be used with augtool as an interpreter (in a shebang).

  
  
With these improvements in augtool, you can now write a script like the following:  
  

#!/usr/bin/augtool -Asif

set /augeas/load/Json/lens Json.lns
set /augeas/load/Json/incl /home/raphink/myjson.json
load

  
  
Make this script executable and run it, and you will get an interactive shell with only /home/raphink/myjson.json parsed (hence a very low loading payload due to the -A flag). The -s flag will ensure that "save" is called when you quit the shell.  
  
  

#### What's new in the Ubuntu package?

  
Improvements have also been made in the last versions of the augeas package in Ubuntu. In 0.7.4, an augeas-doc package has been added. This package has been complemented in 0.8.0, so now it includes:  

-   Generated API docs (with NaturalDocs) for the C API and lenses ;
-   Generated PDF docs about [bx](http://en.wikipedia.org/wiki/Bidirectional_Transformation) theory on lenses and ambiguity ;
-   Text docs about XPath expressions (see also [the Augeas wiki](http://augeas.net/page/Path_expressions)).

  
  

#### Feedback

  
We love to know what you do with Augeas, and the ideas that you have to improve it. We also like to know when things don't work so we can fix them.  
  
There are many ways to [contribute to Augeas](http://augeas.net/developers.html), so don't hesitate to join us!

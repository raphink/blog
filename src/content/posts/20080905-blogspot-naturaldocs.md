---
template: post
title: "NaturalDocs"
date: "2008-09-05T17:52:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/naturaldocs.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/naturaldocs.html"
tags: ["augeas", "css", "debian", "documentation", "english", "perl", "sysadmin", "ubuntu", "website"]
---
While the collection of available Augeas modules is increasing dramatically, there is more and more of a need for a good documentation. Some time ago, R. I. Pienaar (aka Volcane) made a proposition to write standard inline documentation in [Puppet modules,](http://reductivelabs.com/trac/puppet/wiki/ModuleDocumentationStandards) using the [NaturalDocs](http://www.naturaldocs.org/) tool. I thought I would just try to see if it could easily be used to document Augeas modules.  
  
After a few attempts, I found that I was rewriting all my code in the comments, and that was not very optimized, so I wrote to the NaturalDocs's developer, Greg Valure, to ask him about how hard it would be to support the Augeas language in ND. Not only did he answer quickly, but he provided [better configuration files for ND](http://r.pinson.free.fr/augeas/doc/conf/), aswell as a [Perl Module](http://r.pinson.free.fr/augeas/doc/modules/Augeas.pm) to enhance Augeas's support in ND! Thank you very much Greg, you are a great help!  
  
So I spent some more time trying to enhance the comments in the [example modules I chose](http://r.pinson.free.fr/augeas/doc/augfiles/). After talking with David about it, we still feel like it would be better if we didn't have to prefix every declaration with a comment to get it included in the documentation, and if parameters and parameter types could be detected automatically by parsing the code. From what I understand, all this should be possible with ND by improving the Augeas.pm and ideally turning it into a full language support Perl Module. One down side of this is that ND is currently being rewritten in .Net/Mono, so the current work on Perl modules will not work with ND 2.0 anymore.  
  
I also spent quite a few hours yesterday modifying the CSS stylesheet to match the Augeas website.  
  
Now for the demo: you can see it [here](http://r.pinson.free.fr/augeas/doc)!

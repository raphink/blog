---
template: post
title: "Testing KDE 3.5.2 in Dapper"
date: "2006-03-27T16:09:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2006/03/testing-kde-352-in-dapper.html"
blogspot_url: "https://raphink.blogspot.com/2006/03/testing-kde-352-in-dapper.html"
tags: ["beta", "english", "kde", "kubuntu", "restored", "test"]
---
![KDE Logo](http://web.archive.org/web/20060806044342/http://raphink.info/blog/wp-content/uploads/2006/03/49100_436138_big.gif)KDE 3.5.2 is (almost) out ![:)](http://web.archive.org/web/20060806044342/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif) But Dapper is in UVF… so getting it in is not so easy, although it’s mostly a bugfix.

Therefore, Jonathan Riddell has packaged it and put on kubuntu.org for both Breezy and Dapper. In order to install it for Dapper, add :

deb http://kubuntu.org/packages/kde352 dapper main  
deb-src http://kubuntu.org/packages/kde352 dapper main  

to your sources.list, run \`sudo apt-get update && sudo apt-get dist-upgrade\` and restart KDE.

I strongly encourage Kubuntu Dapper users to test it and report bugs. If it really fixes lots of bugs and is stable enough, we might get it in Dapper and finish polishing Dapper with KDE 3.5.2, the 6 weeks delay given us enough time to include it properly.

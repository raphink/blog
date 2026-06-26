---
template: post
title: "Christian projects on Sourceforge #1"
date: "2006-07-19T14:22:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2006/07/christian-projects-on-sourceforge-1.html"
blogspot_url: "https://raphink.blogspot.com/2006/07/christian-projects-on-sourceforge-1.html"
tags: ["christian", "linux", "open-source", "restored", "sourceforge"]
---
Today I am having a look at the Christian open-source projects listed on [Sourceforge](http://web.archive.org/web/20060805074200/http://sourceforge.net/).  
I’ll try to list them here, taking them in order of appearance when looking at the “Religion and Philosophy” section. I won’t be listing the programs that are obviously for Windows only, since I cannot test them.

**[BibleTime](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/bibletime)**  
There’s no need to introduce BibleTime I believe. This great Bible study program for KDE is part of the Sword project, hosted by the [Crosswire Bible Society](http://web.archive.org/web/20060805074200/http://www.crosswire.org/). Version 1.6 is currently in development, and we’ll be happy to update it in Ubuntu when it’s ready.

**[openlp.org](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/openlp)**  
I couldn’t find in what language this program is made… but surely not in any I know how to use on Linux, and the only binary that is given is for Windows, so I couldn’t try it… Any comments welcome.

**[Bibledit](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/bibledit)**  
This piece of software was just added in Debian not long ago, and synced in Ubuntu very lately. It is aimed at editing Bible files, mainly to allow translating the Bible. I couldn’t really test it because it segfaults in Ubuntu Edgy. I’ll have to see if anything can be done for that.

**[Lyricue](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/lds)**  
More and more churches use video-projectors to show the lyrics of songs on a screen. This is why lyricue exists, to allow them to use an open-source software to achieve this task. Currently, Lyricue requires a mysql DB to be set, which makes it a bit uneasy to use. Lyricue is not in Debian or Ubuntu yet, but packages exist on the website. I recently contacted the upstream developer about getting Lyricue in Ubuntu, and he said he will do that. Looking forward to uploading it ![:)](http://web.archive.org/web/20060805074200/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif)

**[GnomeSword](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/gnomesword)**  
GnomeSword is to GNOME what BibleTime is to KDE: a must. Although I prefer KDE over GNOME in general, I reckon GnomeSword is a very nice Bible study software.

**[GNU Bible (GBible)](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/gbible)**  
GBible is a Java-based Bible study software developed using HSQLDB, Lucene and Swing. It was formelly designed to use db.linux, GTK+, Glade and C. The locale focus is Portuguese(Brazil), using “Almeida Revista e Atualizada” version. I am a bit disappointed by the fact that the Bible it uses seems somehow hardcoded… I can’t see readable source files where the Bible is read, nor a way to add another Bible version to this program. Which means : “Read the Almeida Revista e Atualizada” portuguese version of the Bible, or give up on using this program… Hope to see a broader focus and some translations on this project ![:)](http://web.archive.org/web/20060805074200/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif)

**[ChurchInfo](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/churchinfo)**  
From what I understand, ChurchInfo is the future of the PHP/MySQL version of [InfoCentral](http://web.archive.org/web/20060805074200/http://www.infocentral.org/), a web-based program to manage church communities. I have played a bit with it, and have found it interesting. The only thing I’m really concerned with are the menus on the top of the window: they don’t appear on my new version of Firefox, and they are not clickable on Konqueror… which makes navigating in the program simply … impossible. Otherwise I’ve heard very nice things about this app, and I plan to package it as soon as I can understand how to get the menus to work…

**[OpenSong](http://web.archive.org/web/20060805074200/http://sourceforge.net/projects/opensong)**  
According to its author, this ruby program seems to be aimed at “managing chords and lyrics sheets (lead sheets), presenting lyrics (and custom slides) using a projector, and much more!”. However, the source tarball contains a .rb file and an xml file, and the .rb file fails to launch with ruby1.8. I didn’t try to go further. I’d be happy if the author chose to provide an installer for his program.

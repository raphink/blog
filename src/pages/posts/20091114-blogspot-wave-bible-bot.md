---
template: post
title: "Wave Bible Bot"
date: "2009-11-14T13:38:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2009/11/wave-bible-bot.html"
blogspot_url: "https://raphink.blogspot.com/2009/11/wave-bible-bot.html"
tags: ["bible", "christian", "chrétien", "flammard", "open-source", "python", "ubuntu", "wave"]
---
After a month of using Google Wave, I finally made my first Wave bot. My initial idea was to make a Bible bot using the sword API, but I couldn't find an easy way of doing that in python, and I am very reluctant to use Java. So instead, I did a python bot which parses BibleGateway.com to retrieve the results. Later, I added modules to deal with other translations, such as ESV, NET and specific French versions such as Colombe, TOB or NBS.  
  
  

#### What does it do?

  
  
Flammard is a Bible bot for Google Wave. You can add it to a wave, and it will replace some specific patterns with other content.  
  
Currently, it recognizes two kinds of patterns:  

  
-   <verse verseReference \[from Version\]> is replaced by the verse. The version is optional. Examples: <verse Gen 1:1 from NIV> or <verse Acts 3:5-15>  
    
-   <verselink verseReference \[from Version\]> is replaced by a link to the verse on another website. The version is optional. Examples: <verselink Gen 1:1 from NIV> or <verselink Acts 3:5-15>  
    

  
  
  

#### Known versions

  
  
The Bible bot uses several resources in order to support as many Bible versions as possible.  
  
The versions currently supported are:  

  
-   All versions from [BibleGateway.com](http://www.biblegateway.com/), referenced by their code (e.g. KJV, NIV, LSG) or their ID (the full list can be found [on this page](http://www.biblegateway.com/usage/linking/versionslist.php));  
    
-   The [ESV (English Standard Version) Bible](http://www.gnpcb.org/esv/);  
    
-   The NET Bible, from [Bible.org](http://bible.org/);  
    
-   The BFC (La Bible en francais courant), PDV (Parole de Vie), Colombe (La Colombe), NBS (Nouvelle Bible de Segond), TOB (Traduction OEcumenique de la Bible) from [La-Bible.net](http://lire.la-bible.net/).  
    

  
  
  
In all cases, the version is optional. When possible, the bot will try to find the right version for your blip depending on the language you have typed in the context of the tag.  
  
  
  

#### Example

  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiIC_N9xhvnB2NncAIJEqAqIjOISn5utGbJ8KtUCkE4sthPCJaGrl6Ga3NepAHY4TLW2XjQ35HwHhyphenhyphenGppzIY51NBB1kZ7jG4zItnyKSlKrIM2Lgxx9ZNLy-9OyrEdoPCUOh8I9H-BcBLXrG/s320/wave_bible_bot1.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiIC_N9xhvnB2NncAIJEqAqIjOISn5utGbJ8KtUCkE4sthPCJaGrl6Ga3NepAHY4TLW2XjQ35HwHhyphenhyphenGppzIY51NBB1kZ7jG4zItnyKSlKrIM2Lgxx9ZNLy-9OyrEdoPCUOh8I9H-BcBLXrG/s1600-h/wave_bible_bot1.png)  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhmGPNI_bktFKCOi1GfdYADqUSg39-l4Kye9ck4rIqpXDhRRPB8cWcGHK41eBkPerl84F6Y46MJriX6fI_5pC8W61gsjDohCPSlkRIMKZnCyQK11TJjU8iyNngm6-2CBSE2jipg_1ibnUx/s320/wave_bible_bot2.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhmGPNI_bktFKCOi1GfdYADqUSg39-l4Kye9ck4rIqpXDhRRPB8cWcGHK41eBkPerl84F6Y46MJriX6fI_5pC8W61gsjDohCPSlkRIMKZnCyQK11TJjU8iyNngm6-2CBSE2jipg_1ibnUx/s1600-h/wave_bible_bot2.png)  
  
  

#### Live demo

  
  
Here is a video demo of the bot working (as of today's functionalities):  
  
  
  
  

#### How can I add this bot to a wavelet ?

  
  
Simply add flammard@appspot.com as a participant to your wavelet.  
  
  

#### Where can I find the source code?

  
  
The project is hosted on Launchpad: [https://launchpad.net/wavebiblebot](https://launchpad.net/wavebiblebot). You are welcome to report bugs and wishes, or to send patches.

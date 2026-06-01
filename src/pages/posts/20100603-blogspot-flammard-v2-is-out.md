---
template: post
title: "Flammard v2 is out"
date: "2010-06-03T14:38:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2010/06/flammard-v2-is-out.html"
blogspot_url: "https://raphink.blogspot.com/2010/06/flammard-v2-is-out.html"
tags: ["bible", "christian", "flammard", "javascript", "python", "release", "ubuntu", "wave"]
---
After 6 months of loyal services, it was time for the Flammard Bible bot version 1 to leave.  
  
Several reasons pushed me to rewrite the bot:  

  
-   I had begun to rewrite the underlying modules used by the bot and wanted to use them;
  
-   I wanted to have a go at Natural Language Processing and get rid of all (or as many as possible) tags;
  
-   Finally, the robot API for Google Wave was updated, leaving me with a code that depended on an obsolete API. That was the spark to get me started;
  

  
  
In short, version 2 of the Bible bot:  

  
-   Has no '<blah>', 'v/blah/' or 'vl/blah/' tags. It just recognizes Bible references in the text and processes them automatically. The only bit of a tag that persists is 'q' or 'quote' in front of a verse reference, such as 'quote gen 1:3', which tells the bot to quote the verse instead of just making it a link to an external website;
  
-   Comes with a Wave gadget to configure it which replaces the '<bible>' and '<pref>' tags.
  

  
  
Two pretty much unused functionalities were dropped in version 2:  

  
-   The '<votd>' tag has no equivalent. My logs showed that nobody was using it. If you still want it, ping me. I might replace it with a Wave gadget once I expose the Flammard API publicly;
  
-   It is no longer possible to set the default Bible version per language, you can only set one default version per Wave.
  

  
  
You can install the bot by visiting [this wave](https://wave.google.com/wave/#minimized:nav,minimized:contact,minimized:search,restored:wave:googlewave.com!w%252BCAl2tcajD.4).

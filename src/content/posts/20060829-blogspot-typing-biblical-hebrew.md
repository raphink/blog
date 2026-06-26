---
template: post
title: "Typing Biblical Hebrew"
date: "2006-08-29T15:32:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2006/08/typing-biblical-hebrew.html"
blogspot_url: "https://raphink.blogspot.com/2006/08/typing-biblical-hebrew.html"
tags: ["bible", "english", "hebrew", "ichthux", "kde", "language", "linux", "openoffice", "restored", "typing"]
---
As we released Ichthux 6.09 beta5, we began to work on Biblical Hebrew functionalities, to make sure Ichthux could provide a full Biblical Hebrew support for Bible studies.

### Hebrew font for the WLC Bible

Kubuntu has fonts for almost every language by default. However, I included the culmus Hebrew fonts in Ichthux by default to be able to read the Bible in Hebrew. The WLC, along with other codecs of the Tanakh, doesn’t use a simple alphabet, but also has lots of signs to indicate the way to pronounce/vocalize the words and signs to indicate the middle of the verses, the middle of chapters, the middle of the Torah, or where to breathe when singing the text. All these signs cannot be displayed properly with a simple modern Hebrew font, which is why I provided culmus and used Frank Ruehl’s font by default.

The following clearly shows why it is necessary to have a custom font to read WLC in BibleTime:

![WLC with default font](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/hebrew_font_normal.jpg)  
WLC with default font

![WLC with Frank Ruehl's font](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/hebrew_font_frank_ruehl.jpg)  
WLC with Frank Ruehl’s font

Note: the rules to write a kosher Tanakh are very strict, and even with a Frank Ruehl’s font, the rendering is far from being perfect. For example, in Number 25:12, the vav in SHaLOM is not broken as it should be:

![Numbers 25:12 in WLC](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/numbers_25_12.jpg)  
Numbers 25:12 in WLC

![The broken vav of SHaLOM](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/broken-vav-num25-12.gif)  
The broken vav of SHaLOM

The big vav in the middle of the Torah, along with many other pretty important font rendering in the Hebrew tradition don’t appear in the WLC.

### Typing Biblical Hebrew

The next step was to make sure Biblical Hebrew could be typed in Ichthux. The first thing to do is to set the keyboard layout. You can do that easily in SystemSettings. Once you had added the Hebrew layout to the lsit of active layouts, you need to choose si1452 as the variant for it in order to activate the Biblical Hebrew keyboard.

Once I had that set, I tried to write in Hebrew in various programs, using Frank Ruehl’s font. My two main attempts were in OpenOffice Writer and KWord.

I have to confess I was very disappointed by OpenOffice there. I had to set the “Enabled for complex text layout (CTL)” in the Language tools, and then it wouldn’t write from right to left still, and didn’t keep the right font when I typed. I had to force it to write from right to left by changing the alignement, but then I couldn’t add spaces before the first word. Additionally, the vowels are not showing properly, but are somehow slightly switched under the next letter.

On the contrary, KWord proved very easy to use. No additional settings to be done, and it wrote from right to left very nicely. The vowels are aligned very nicely, and the rendering looks great ![:)](http://web.archive.org/web/20061230082703/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif)

Below is the word BReSHiYT written in OpenOffice and KWord for comparison.

![Breshit in OpenOffice Writer](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/breshit_ooo.jpg)  
Breshit in OpenOffice Writer

![Breshit in KWord](http://web.archive.org/web/20061230082703/http://ichthux.free.fr/snapshots/hebrew_font/breshit_kword.jpg)  
Breshit in KWord

### Conclusion

There is still some work to do to get full support for Biblical Hebrew by default in Ichthux, but at least we know where we stand now ![:)](http://web.archive.org/web/20061230082703/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif)

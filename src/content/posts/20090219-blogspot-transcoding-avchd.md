---
template: post
title: "Transcoding AVCHD"
date: "2009-02-19T10:35:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2009/02/transcoding-avchd.html"
blogspot_url: "https://raphink.blogspot.com/2009/02/transcoding-avchd.html"
tags: ["computers", "english", "ffmpeg", "film", "open-source", "ubuntu", "video"]
---
Since we're expecting a baby for the end of April, Jimena and I thought it would be really nice to have a video camera to record those precious memories. I thought it was worth it to get an HD camera, even though we don't have any HD devices yet, because we'll be happy to watch our memories in HD in a few years, when we can afford a new TV ;)  
  
So there we went, and got the [Panasonic HDC-SD9](http://www2.panasonic.com/consumer-electronics/support/Hi-Def-Camcorders/model.HDC-SD9). It's a great camera, which records directly in HD formats, from 1440x1080 to 1920x1080. The only issue came when I wanted to play these videos on my computer. Our poor dual-core Intel Pentium D with 1.5 GB RAM struggles to play the lowest quality the SD9 can produce. So there was a need to transcode this format into a more readable one, for example avi or mov.  
  
My first approach was to use a simple ffmeg line :  
`    ffmpeg -i somefile.mts -s svga -r 25 somefile.mov    `  
  
It does convert the file to a .mov successfully, but the result is horrible: the images are almost just as grabbled as reading the mts directly with VLC.  
  
  
This morning, I found [this post](http://www.fsckin.com/2008/01/03/transcoding-mtsm2ts-avchd-video-files-with-free-software/), which linked to [this forum](http://www.avsforum.com/avs-vb/showthread.php?s=58b68293508c54a5b0d77f58739058cb&t=789775&page=5), which features a great talk on how to efficiently transcode AVCHD to mov or avi. It also linked to [Ubuntu forums](http://ubuntuforums.org/showthread.php?t=1045153&highlight=avchd+to+avi) where a guy proposed to use mencoder for the job with something like  
``    mencoder $f -o `basename $f .mts`.avi -oac copy -ovc lavc -lavcopts vcodec=mpeg4:vbitrate=10000 -fps 50 -vf scale=720:576    ``  
  
The result, once again, was horrible in my case.  
  
Eventually, I tried the script located at [http://marks.org/avchd/hdffxvrt-mov1-8-09](http://marks.org/avchd/hdffxvrt-mov1-8-09), and it worked great! The only problem I had with it was that most of my videos were in 1440, so I had to use "-i 1440x1080" on them. Otherwise, the results are very nice.  
  
This script has preset formats, so you can simply call it this way  
`    ./hdffxvrt-mov1-8-09 -p small -i 1440x1080 00000.mts    `  
  
  
Nice and efficient, and uses ffmpeg under the hood, only going through a yuv demux before actually transcoding (from the little I understand about video transcoding at least). You only need to be patient.  
  
  
**Update:**  
  
I worked a bit on the script and improved it quite a bit. The first improved version can be found on [this link](http://r.pinson.free.fr/avchd/hdffxvrt-raphink-2-20-09) and includes the following changes:  

  
-   Take -f switch to choose format (mov by default) instead of having two separate scripts ;
  
-   Use mktemp to create the TMPDIR ;
  
-   Add traps to remove temporary files and directories on interrupt, kill and exit ;
  
-   Also remove output file if the file is interrupted ;
  
-   Try to detect resolution if it wasn't specified with the -i switch. This is currently a bit ugly but it works for me so far. Any improvement in this would be welcome.  
    
  

  
  
After that, I thought it would be nice to integrate it in Dolphin/Konqueror as a service menu. It gave birth to the script you will find on [this link](http://r.pinson.free.fr/avchd/mts2mov-kde_0.1.tar.gz). This is still quite a hack, and I will probably work more on it later on, but you are already welcome to try it and give some feedback.  
  
[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOXRwwD7DtWKUImh0kRGOYX76CwiklDlkCQGQ47MJyYs6gWFQNV5P4xT20Dq1vEdDZUiKVXCuayLLlRb6oYMsnNXIdQGhqxFBa00bDfvTtGb53yj05PCI6Y7qLz_qaJYxxZP6gAh9vN16u/s320/snapshot1.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhOXRwwD7DtWKUImh0kRGOYX76CwiklDlkCQGQ47MJyYs6gWFQNV5P4xT20Dq1vEdDZUiKVXCuayLLlRb6oYMsnNXIdQGhqxFBa00bDfvTtGb53yj05PCI6Y7qLz_qaJYxxZP6gAh9vN16u/s1600-h/snapshot1.png)  
  
This KDE version includes the following improvements:  

-   Register .mts files in the system ;
-   Call the script from ServiceMenus (Dolphin/Konqueror) for various preset sizes ;
-   Uses kdialog to provide information while encoding ;  
    
-   Progress bar support interacting with ffmpeg encoding progress ;  
    
-   Support for the "Cancel" button while encoding.

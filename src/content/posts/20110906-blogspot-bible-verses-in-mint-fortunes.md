---
template: post
title: "Bible verses in Mint fortunes"
date: "2011-09-06T21:37:00.003+02:00"
canonical_url: "https://raphink.blogspot.com/2011/09/bible-verses-in-mint-fortunes.html"
blogspot_url: "https://raphink.blogspot.com/2011/09/bible-verses-in-mint-fortunes.html"
tags: ["bash", "linux mint", "ubuntu"]
---
For my most recent computer, I've installed Linux Mint 11. In Mint, bash is set to display a fortune cookie every time you start a shell session.  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgsuJr9pnVPK0RyTfU-2c5vQVXWuGFQq1aaKzjk28zNfn_QJVqyoOJ7AWGDnQ7PrKY2i-wfHLHPdjahTVs_AHsmUUXdrA9NZ61yIjki17Mzr5meaNCvBmNVcZkBCEysAS7ZH914EY_85zCr/s320/mint_fortunes.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgsuJr9pnVPK0RyTfU-2c5vQVXWuGFQq1aaKzjk28zNfn_QJVqyoOJ7AWGDnQ7PrKY2i-wfHLHPdjahTVs_AHsmUUXdrA9NZ61yIjki17Mzr5meaNCvBmNVcZkBCEysAS7ZH914EY_85zCr/s1600/mint_fortunes.png)

  
This is a nice idea, however I would rather see daily Bible verses than random fortunes. Here is how to do that. First, install the verse package:  
  
`    $ sudo apt-get install verse    `  
  
Then, edit /usr/bin/mint-fortune with sudo, and replace the line:  
  
`    /usr/games/fortune | $command -f $cow    `  
  
with  
  
`    /usr/bin/verse | sed -e 's@^ *@@' | $command -f $cow    `  
  
To be sure that the file won't be overridden when you upgrade your distribution, set it as a local diversion:  
  
`    $ sudo dpkg-divert --local /usr/bin/mint-fortune    `  
  
and you're done!  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyr0sEeuXsQZPfwNXO7WWFLUOG814lJ33wX3q4nbRoULxjG7xU__DsN9-FclDC9E-VsjTUEFWYJN3igNnq3z8AJu6i-b0es0SbfyoALzL_1Ok0siZQPFWkSyhSIIL1kH93KVXbKVR3LFbU/s320/mint-fortunes-bible-nospaces.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyr0sEeuXsQZPfwNXO7WWFLUOG814lJ33wX3q4nbRoULxjG7xU__DsN9-FclDC9E-VsjTUEFWYJN3igNnq3z8AJu6i-b0es0SbfyoALzL_1Ok0siZQPFWkSyhSIIL1kH93KVXbKVR3LFbU/s1600/mint-fortunes-bible-nospaces.png)

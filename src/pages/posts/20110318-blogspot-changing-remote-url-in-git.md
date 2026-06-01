---
template: post
title: "Changing a remote URL in git"
date: "2011-03-18T11:52:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/03/changing-remote-url-in-git.html"
blogspot_url: "https://raphink.blogspot.com/2011/03/changing-remote-url-in-git.html"
tags: ["augeas", "git", "ubuntu"]
---
You cloned a git repository using a public URL, and now everytime you want to push to it, you have to specify the push R/W URL because the public URL you used to pull is read-only.  
  
This happened to me:  
  

$ git remote show origin 
\* remote origin
  Fetch URL: git://git.fedorahosted.org/git/augeas.git
  Push  URL: git://git.fedorahosted.org/git/augeas.git
  HEAD branch: master
  Remote branch:
    master tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)

  
  
and here is how I fixed it:  
  

$ git remote set-url --push origin ssh://raphink@git.fedorahosted.org/git/augeas.git
$ git remote show origin 
\* remote origin
  Fetch URL: git://git.fedorahosted.org/git/augeas.git
  Push  URL: ssh://raphink@git.fedorahosted.org/git/augeas.git
  HEAD branch: master
  Remote branch:
    master tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)

  
Note that the --push option modified only the push URL, so I keep using the public URL for fetching, which is fine.

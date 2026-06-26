---
template: post
title: "Matching a mac address"
date: "2010-10-04T22:52:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2010/10/matching-mac-address.html"
blogspot_url: "https://raphink.blogspot.com/2010/10/matching-mac-address.html"
tags: ["regexp", "ubuntu"]
---
If it's of any use to someone, here is a regexp that matches mac addresses:  
  

/\[0-9A-Fa-f\]{2}(?P<sep>\[-:\])\[0-9A-Fa-f\]{2}(?:(?P=sep)\[0-9A-Fa-f\]{2}){4}/

  
Example usage:  

$ python
 >>> reg = re.compile('\[0-9A-Fa-f\]{2}(?P<sep>\[-:\])\[0-9A-Fa-f\]{2}(?:(?P=sep)\[0-9A-Fa-f\]{2}){4}')
 >>> mac1 = "00:af:15:35:48:5e"
 >>> mac2 = "00-aa-bb-cc-dd-ee"
 >>> mac3 = "00-aa-bb-cc-dd:ee"
 >>> reg.match(mac1).group(0)
'00:af:15:35:48:5e'
 >>> reg.match(mac2).group(0)
'00-aa-bb-cc-dd-ee'
 >>> reg.match(mac3).group(0)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'NoneType' object has no attribute 'group'
 >>> reg.match(mac1).group('sep')
':'
 >>> reg.match(mac2).group('sep')
'-'

  
  
Do you use another regexp to match mac addresses?

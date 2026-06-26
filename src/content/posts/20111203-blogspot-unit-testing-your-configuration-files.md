---
template: post
title: "Unit testing your configuration files"
date: "2011-12-03T21:12:00.001+01:00"
canonical_url: "https://raphink.blogspot.com/2011/12/unit-testing-your-configuration-files.html"
blogspot_url: "https://raphink.blogspot.com/2011/12/unit-testing-your-configuration-files.html"
tags: ["augeas", "perl", "sysadmin", "ubuntu"]
---
At work, we have a lot of different services running and we end up with hundreds of thousands of configuration files in our configuration repository (especially since we don't use templates - more on that in another upcoming post...).  
  
In order to ensure the quality of these files (avoiding syntax errors and insecure configurations alike), we had the idea of writing a system to unit test the configuration files. Being involved in [Augeas](http://augeas.net/), I thought it would make a great parsing backend to write the tests.  
  
This gave birth to what is currently a Perl module called [Config::Augeas::Validator](http://search.cpan.org/perldoc?Config::Augeas::Validator), which comes with a Perl script and an SVN wrapper (this is what we used, but wrappers for other VCS are welcome) to plug it to pre- and post-commit hooks.  
  
The module relies on Augeas (and its lenses) to parse the configuration files. On top of that, you need to specify rules (which are essentially unit test scenarii), at least one for each type of file you wish to test. A minimal rule might look like this:  
  
`[DEFAULT]   lens=Fstab   pattern=.*/fstab`  
  
This rule will tell augeas-validator to test all files whose full path matches .\*/fstab against the Fstab.lns Augeas lens. If the file contains syntax errors (that is, the lens fails to parse it), the program will report it and exit with a status of 1.  
  
Here is another simple example adding two unit tests with warnings:  
  
`[DEFAULT]   lens=PHP   pattern=.*/(php\.ini|php[45]/conf\.d/.*\.ini)      [file_uploads]   name=file_uploads   explanation=file_uploads should be set to 'Off'   type=count   expr=$file//file_uploads[. != 'Off']   value=0   level=warning   tags=security      [expose_php]   name=expose_php   explanation=expose_php should be set to 'Off'   type=count   expr=$file//expose_php[. != 'Off']   value=0   level=warning   tags=security   `  
  
This test checks for php.ini files. Not only does it fail with status 1 if there is a syntax error, it also applies two unit tests called file\_uploads and expose\_php, which will make the program output a warning and exit with status 2 if they are not met. The essential part of the rules is the expr parameter, which is an [Augeas XPath expression](http://augeas.net/page/Path_expressions). In this case, the expressions must not match any nodes in order to pass the tests (hence value=0).  
  
These are just simple examples of what this module can do. You can find more examples shipped with the module itself. As a last example, here is one for Apache configuration files (in Debian/Ubuntu):  
  
`[DEFAULT]   lens=Httpd   pattern=.*/(sites-available/.*)|(apache2/.*\.conf)      [one_servername]   name=One ServerName per VirtualHost *   explanation=There should be only one ServerName per VirtualHost * entry   type=count   expr=$file[label() != "default"]/VirtualHost[arg =~ regexp("\*(:80)?")][count(directive[. = "ServerName"]) != 1]   value=0   level=warning      [bufferedlogs]   name=BufferedLogs   explanation=BufferedLogs must be set to Off   type=count   expr=$file//directive[. = "BufferedLogs"][arg = "On"]   value=0   level=warning   tags=security      [timeout]   name=Timeout   explanation=Timeout must be at least 45   type=count   expr=$file//directive[. = "Timeout"][int(arg) < 45]   value=0   level=warning   tags=security   `

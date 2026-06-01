---
template: post
title: "Modular tar pipe tar in Perl"
date: "2008-09-15T16:23:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2008/09/modular-tar-pipe-tar-in-perl.html"
blogspot_url: "https://raphink.blogspot.com/2008/09/modular-tar-pipe-tar-in-perl.html"
tags: ["english", "perl", "sysadmin", "ubuntu"]
---
I was trying to write a nice tar pipe tar system in a perl script, and got to this, which I think can be useful:  
  
  
`    #!/usr/bin/perl         use Archive::Tar;   use Net::SSH;         my $tar = Archive::Tar->new;      my $dir = "/path/to/dir";   # Copy files from dir without recursion   my @files = glob("$dir/*");   $tar->add_files(@files);         $user = "root";   $host = "myhost.example.org";   $cmd = "cd / && tar xf -";      Net::SSH::sshopen2("$user\@$host", *READER, *WRITER, "$cmd") || die "ssh: $!";      print WRITER $tar->write;   close(WRITER);   close(READER);          `  
  
  
If you know of a nicer way to do it, I'm open to ideas :)

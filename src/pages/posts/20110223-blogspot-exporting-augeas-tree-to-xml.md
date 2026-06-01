---
template: post
title: "Exporting the Augeas tree to XML"
date: "2011-02-23T09:00:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2011/02/exporting-augeas-tree-to-xml.html"
blogspot_url: "https://raphink.blogspot.com/2011/02/exporting-augeas-tree-to-xml.html"
tags: ["augeas", "config-augeas-exporter", "perl", "ubuntu"]
---
While [Augeas](http://www.augeas.net) is usually used to modify configuration files (for example as a [Puppet type](http://projects.puppetlabs.com/projects/1/wiki/Puppet_Augeas)), it can also be useful to request configuration files.  
  
Sometimes, you might want to retrieve that information from several servers and gather it on a central machine or DB to request it later. Programs that permit this usually use several parsing modules or copy the configuration files verbatim.  
  
  

#### aug2xml

  
Since Augeas can now parse a lot of configuration files, it could be useful to export its tree to a XML file that could be stored and used elsewhere.  
  
The problem, however, is that the Augeas tree is not valid XML. Mainly, the nodes in Augeas can be numbers (in the case of "seq" nodes) or begin with such characters as "#". These names are illegal as node names in XML.  
  
For this reason, I have chosen to map the nodes as "node" elements, and use a "label" attribute to store their label. The value of the nodes (where there is node) is stored in the text sub-node.  
  
The following script is a prototype to export the Augeas tree to an XML file. On Debian and Ubuntu systems, you will need to install the libconfig-augeas-perl, libxml-libxml-perl and libencode-perl packages:  
  

$ sudo apt-get install libconfig-augeas-perl \\
    libxml-libxml-perl libencode-perl

  
  
Here is the script:  
  

#!/usr/bin/perl -w

use strict;
use Config::Augeas;
use XML::LibXML;
use Getopt::Long;
use Encode;

my $path = '/files';
my $root = '/';
my $verbose;
my $debug;
my $help;

my $result = GetOptions (
   "path=s" => \\$path,
   "root=s" => \\$root,
   "verbose" => \\$verbose,
   "debug" => \\$debug,
   "help" => \\$help,
   );

if ($help) {
   usage();
   exit 0;
}

$verbose ||= $debug;

my $aug = Config::Augeas->new(root => $root);
my $doc = XML::LibXML::Document->new('1.0', 'utf-8');

my $elem = aug2xml($path);
$doc->setDocumentElement($elem);
print $doc->toString;


#######
# Subs
#######

sub usage {
   print "$0 \[-p \] \[-r fakeroot\] \[-v\] \[-d\] \[-h\]

 Flags:
   -h, --help             Show this help
   -v, --verbose          Verbose mode
   -d, --debug            Debug mode

 Options:
   -p, --path Set path to export
   -r, --root Set fakeroot for Augeas
";
}


sub aug2xml {
   my ($path) = @\_;

   my $label = '';
   if ($path =~ m|.\*/(\[^/\\\[\]+)(\\\[\\d+\\\])?|) {
      $label = $1;
   } else {
      warn "W: Could not parse $path\\n";
   }
   my $elem = XML::LibXML::Element->new('node');
   $elem->setAttribute("label", $label);

   my $value = $aug->get($path);
   if(defined($value)) {
      $elem->appendTextNode(encode('utf-8', $value));
   }

   $path =~ s| |\\\\ |g;
   my @children = $aug->match("$path/\*");

   for my $child (@children) {
      my $child\_elem = aug2xml($child);
      $elem->appendChild($child\_elem);
   }

   return $elem;
}

  
  
Having saved this code as aug2xml and made it executable, you can run:  
  

$ ./aug2xml > export.xml

  
  
This should create an export.xml file which contains all the configuration files in your system that Augeas was able to parse.  
  
  

#### Looking into the XML export

  
Now we've created the export.xml file, let's see how it looks. I've created mine from a fakeroot containing only fstab and aliases files, so it's not too big.  
  
We can use tools such as xmlindent to view it nicely:  
  

<?xml version="1.0" encoding="utf-8"?>
 <node label="files">
  <node label="etc">
   <node label="aliases">
    <node label="#comment">See man 5 aliases for format</node>
     <node label="1">
      <node label="name">postmaster</node>
      <node label="value">root</node>
     </node>
    </node>
    <node label="fstab">
     <node label="#comment">/etc/fstab: static file system information.</node>
     <node label="#comment">Use 'blkid -o value -s UUID' to print the universally unique identifier</node>
     <node label="#comment">for a device; this may be used with UUID= as a more robust way to name</node>
     <node label="#comment">devices that works even if disks are added and removed. See fstab(5).</node>
     <node label="#comment">&lt;file system&gt; &lt;mount point&gt;   &lt;type&gt;  &lt;options&gt;       &lt;dump&gt;  &lt;pass&gt;</node>
     <node label="1">
      <node label="spec">proc</node>
      <node label="file">/proc</node>
      <node label="vfstype">proc</node>
      <node label="opt">nodev</node>
      <node label="opt">noexec</node>
      <node label="opt">nosuid</node>
      <node label="dump">0</node>
      <node label="passno">0</node>
     </node>
     <node label="#comment">/ was on /dev/sda1 during installation</node>
     <node label="2">
      <node label="spec">UUID=4cbb4f80-45f9-4e46-a076-8ec1124f4835</node>
      <node label="file">/</node>
      <node label="vfstype">ext3</node>
      <node label="opt">errors
       <node label="value">remount-ro</node>
      </node>
      <node label="dump">0</node>
      <node label="passno">1</node>
     </node>
     <node label="3">
      <node label="spec">/dev/sda2</node>
      <node label="file">none</node>
      <node label="vfstype">swap</node>
      <node label="opt">rw</node>
      <node label="dump">0</node>
      <node label="passno">0</node>
     </node>
    </node>
   </node>
  </node>

  
  

#### Let's play with the XML export

  
So now we have an XML export of our configuration. What now? Let's try to make requests on it!  
  
Because of the choices explained above which turn out every node to be named 'node', the Xpath request will be uglier than it would be had we used Augeas directly.  
  
For example, let's say we want to get the file system type of the "/" entry in /etc/fstab. In Augeas, we could do:  
  

$ augtool 'get //fstab/\*\[file="/"\]/vfstype'
  //fstab/\*\[file="/"\]/vfstype = ext3

  
  
That's straight-forward enough. Now let's try to do it from our XML file:  
  

#!/usr/bin/perl -w

use strict;
use XML::LibXML;

my ($file) = @ARGV;

open (my $fh, "<$file") 
   or die "E: Could not open $file: $!\\n" ;
my $doc = XML::LibXML->load\_xml(IO => $fh);
close $fh;


print $doc->findvalue('//node\[@label="fstab"\]/node/
   node\[@label="file"\]\[child::text()="/"\]/
   ../node\[@label="vfstype"\]')."\\n";

  
  
Save this script as testaugxml, make it executable and run:  
  

$ ./testaugxml.pl export.xml 
ext3

  
It works, although the Xpath expression is certainly uglier than in Augeas.  
  
  
  

#### xml2aug

  
Now what if I wanted to import that XML file back to Augeas? That could be fun, and sometimes useful, too.  
  
There's a problem here. Exporting the Augeas tree to a clean XML file is very simple ; importing it back is more complex, because of the existing tree.  
  
Without getting into much details, we have roughly 3 possibilities:  

-   xml2aug replaces the Augeas tree with the contents of the XML file, erasing the existing tree ;
-   xml2aug replaces the Augeas tree with the contents of the XML file only on files listed in the XML file and doesn't touch other files ;
-   xml2aug applies the XML file as a patch on the existing tree.

  
The 3rd solution is very hard to implement, and the 2nd solution might be possible once Augeas allows to get more information on nodes (knowing if the node is a directory, a file or a configuration entry would help). I'm left with the 1st solution to implement my script for now.  
  
This having been said, you have been warned: there is a --root option in this script, make use of it if you don't want to lose some configuration files!  
  
Here is the script:  
  

#!/usr/bin/perl -w

use strict;
use Config::Augeas;
use XML::LibXML;
use Getopt::Long;

my $file;
my $root = '/';
my $verbose;
my $debug;
my $help;

my $result = GetOptions (
   "file=s" => \\$file,
   "root=s" => \\$root,
   "verbose" => \\$verbose,
   "debug" => \\$debug,
   "help" => \\$help,
   );

if ($help) {
   usage();
   exit 0;
}

$verbose ||= $debug;


unless (defined($file)) {
   die "E: You must specify a filename\\n";
}

open (my $fh, "<$file") 
   or die "E: Could not open $file: $!\\n" ;
my $doc = XML::LibXML->load\_xml(IO => $fh);
close $fh;

my $aug = Config::Augeas->new(root => $root);
# we want to replace everything
$aug->rm('/files/\*');
my @top\_nodes = $doc->find('/\*/node\[@label != "files"\]')->get\_nodelist();

for my $node (@top\_nodes) {
   xml2aug($node, '/files');
}

$aug->print('/files') if $debug;
$aug->save();
$aug->print('/augeas//error');


########
# Subs
########

sub usage {
   print "$0 \[-f \] \[-r fakeroot\] \[-v\] \[-d\] \[-h\]

 Flags:
   -h, --help             Show this help
   -v, --verbose          Verbose mode
   -d, --debug            Debug mode

 Options:
   -f, --file Set XML file to import from
   -r, --root Set fakeroot for Augeas
";
}

sub xml2aug {
   my ($elem, $path) = @\_;

   my $type = $elem->nodeType;

   my $label = $elem->getAttribute('label');

   my $matchpath = "$path/\*\[last()\]";
   $matchpath =~ s| |\\\\ |g;
   my $lastpath = $aug->match("$path/\*\[last()\]");

   if(defined($lastpath)) {
      print "V: Inserting $label after $lastpath\\n" if $verbose;

      # Insert last node
      $aug->insert($label, "after", $lastpath);
   } else {
      $aug->set("$path/$label", '');
   }

   $matchpath = "$path/${label}\[last()\]";
   $matchpath =~ s| |\\\\ |g;
   my $newpath = $aug->match($matchpath);


   my $value;

   for my $child ($elem->childNodes()) {
      if ($child->nodeType == XML\_TEXT\_NODE) {
         # Text node
         $value = $child->nodeValue;
      } else {
         xml2aug($child, $newpath);
      }
   }

   if (defined($value)) {
      print "V: Setting value of $newpath to $value\\n" if $verbose;
      $aug->set($newpath, $value);
   }
}

  
  

#### Future development

  
The current state of this prototype is a set of Perl scripts. Eventually, I would like to merge at least the export functionality in augtool, so as not to depend on Perl.

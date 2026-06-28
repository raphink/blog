---
template: post
title: "Building docs with NaturalDocs"
date: "2010-11-22T13:57:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2010/11/building-docs-with-naturaldocs.html"
blogspot_url: "https://raphink.blogspot.com/2010/11/building-docs-with-naturaldocs.html"
tags: ["augeas", "debian", "documentation", "packaging", "ubuntu"]
---
I mentionned NaturalDocs [in an earlier post](http://www.raphink.info/2008/09/naturaldocs.html) on this blog since we're using it to document the [Augeas C API](http://augeas.net/docs/references/c_api) and [Augeas lenses](http://augeas.net/docs/references/lenses).  
  
With the latest version of Augeas [now out](https://www.redhat.com/archives/augeas-devel/2010-November/msg00110.html), I wanted to get these docs generated with the package so they could be shipped in an augeas-doc package in Debian and Ubuntu. I first had to fix a missing link in the [naturaldocs](https://launchpad.net/ubuntu/natty/+source/naturaldocs/1:1.5-0ubuntu1) package (which was also the occasion to upgrade it to 1.5). Then I had to get naturaldocs in main, since augeas is in main already. While going through the [MIR](https://bugs.launchpad.net/ubuntu/+source/naturaldocs/+bug/677822), I was asked if other packages in main could benefit from this change. I haven't found any, but there's quite a few packages in universe that could use naturaldocs to generate documentation at build time. The [bug report](https://bugs.launchpad.net/ubuntu/+source/naturaldocs/+bug/677822) lists some of them.  
  
If you're interested in building NaturalDocs documentation in your package, here is the way it was done for Augeas.  
  
Augeas is a C project using autotools. It was thus easier to activate NaturalDocs as an option in configure. This can easily be adapted for other cases, including running the commands in debian/rules directly.  
  
In configure.ac:  
  
```m4
dnl Check for NaturalDocs
AC\_PATH\_PROGS(\[ND\_PROG\], \[naturaldocs NaturalDocs\], missing)
AM\_CONDITIONAL(\[ND\_ENABLED\], \[test "x$ND\_PROG" != "xmissing"\])

dnl NaturalDocs output format, defaults to HTML
ND\_FORMAT=HTML
AC\_ARG\_WITH(\[naturaldocs-output\],
  \[AS\_HELP\_STRING(\[--with-naturaldocs-output=FORMAT\],
    \[format of NaturalDocs output (possible values: HTML/FramedHTML, default: HTML)\])\],
  \[
    if test "x$ND\_PROG" = "xmissing"; then
      AC\_MSG\_ERROR(\[NaturalDocs was not found on your path; there's no point in setting the output format\])
    fi
    case $withval in
       HTML|FramedHTML)
          ND\_FORMAT=$withval
          ;;
       \*)
          AC\_MSG\_ERROR($withval is not a supported output format for NaturalDocs)
          ;;
    esac
  \])
AC\_SUBST(ND\_FORMAT)
```

  
  
In doc/naturaldocs/Makefile.am:  
  
```makefile
EXTRA\_DIST = $(wildcard conf/Augeas.css conf/c\_api/\*.txt) \\
             $(wildcard conf/lenses/\*.txt) \\
             Modules/NaturalDocs/Languages/Augeas.pm

ND\_CONF=$(srcdir)/conf
ND\_OUTPUT=output
ND\_STYLE=../Augeas

ND\_PERL5LIB=$(abs\_srcdir)/Modules
ND\_PERL5OPT='-MNaturalDocs::Languages::Augeas'

if ND\_ENABLED
all-local: NaturalDocs
endif

NaturalDocs: NDLenses NDCAPI

env:
 echo LIB $(ND\_PERL5LIB)
 echo OPT $(ND\_PERL5OPT)
 test -n "$$PERL5OPT" && ND\_PERL5OPT="$(ND\_PERL5OPT) $$PERL5OPT" || ND\_PERL5OPT=$(ND\_PERL5OPT); \\
 test -n "$$PERL5LIB" && ND\_PERL5LIB="$(ND\_PERL5LIB):$$PERL5LIB" || ND\_PERL5LIB=$(ND\_PERL5LIB); \\
        PERL5LIB=$$ND\_PERL5LIB PERL5OPT=$$ND\_PERL5OPT env | grep PERL

NDLenses: NDConf
 @mkdir -p $(ND\_OUTPUT)/lenses
 @(echo "Format lens documentation"; \\
   test -n "$$PERL5OPT" && ND\_PERL5OPT="$(ND\_PERL5OPT) $$PERL5OPT" || ND\_PERL5OPT=$(ND\_PERL5OPT); \\
   test -n "$$PERL5LIB" && ND\_PERL5LIB="$(ND\_PERL5LIB):$$PERL5LIB" || ND\_PERL5LIB=$(ND\_PERL5LIB); \\
   PERL5LIB=$$ND\_PERL5LIB PERL5OPT=$$ND\_PERL5OPT \\
          $(ND\_PROG) -p conf/lenses \\
       -i $(top\_srcdir)/lenses \\
       -o $(ND\_FORMAT) $(ND\_OUTPUT)/lenses \\
       -s $(ND\_STYLE))

NDCAPI: NDConf
 @mkdir -p $(ND\_OUTPUT)/c\_api
 @(echo "Format C API documentation"; \\
   test -n "$$PERL5OPT" && ND\_PERL5OPT="$(ND\_PERL5OPT) $$PERL5OPT" || ND\_PERL5OPT=$(ND\_PERL5OPT); \\
   test -n "$$PERL5LIB" && ND\_PERL5LIB="$(ND\_PERL5LIB):$$PERL5LIB" || ND\_PERL5LIB=$(ND\_PERL5LIB); \\
   $(ND\_PROG) -p conf/c\_api \\
     -i $(top\_srcdir)/src \\
     -o $(ND\_FORMAT) $(ND\_OUTPUT)/c\_api \\
     -s $(ND\_STYLE))

NDConf:
 @(if test ! -d $(ND\_CONF); then \\
     cp -pr $(ND\_CONF) conf; \\
   fi)

clean-local:
 rm -rf output conf/Data
 rm -rf $(ND\_CONF)/c\_api/Data $(ND\_CONF)/lenses/Data
```

  
  
After that, the NaturalDocs docs can be built by calling --with-naturaldocs-output=HTML or --with-naturaldocs-output=FramedHTML.  
  
  
I hope this can be useful to improve the shipped documentation for projects already using NaturalDocs.

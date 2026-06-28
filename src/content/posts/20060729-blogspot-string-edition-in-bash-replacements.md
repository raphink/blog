---
template: post
title: "String edition in bash: replacements"
date: "2006-07-29T14:18:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2006/07/string-edition-in-bash-replacements.html"
blogspot_url: "https://raphink.blogspot.com/2006/07/string-edition-in-bash-replacements.html"
tags: ["bash", "linux", "restored", "sysadmin"]
---
Many of us are used to using sed for pattern replacements in strings, but it is also possible to perform these replacements from within bash, using ${parameter#word}, ${parameter##word}, ${parameter%word}, ${parameter%%word}, ${parameter/pattern/string/}, and ${parameter//pattern/string}.

All these forms are explained in “man bash” but no example is given. Since an example is often the best way to show how things work, here are a few examples for these features. I will only give examples here, considering you can lookup for these entries in “man bash” if you want the full theorical explanation, that I find confusing.

Let us define a global variable we will be working on:

```bash
$ FQDN="foo.bar.com" # let's define a variable called FQDN for our examples
$ echo ${FQDN} # just a check
foo.bar.com
```

Now let’s have a look at ${parameter#word} and ${parameter##word}, which act on the beginning of the string:

```bash
$ echo ${FQDN#*.} # this removes the shortest pattern matching "*." in the beginning of $FQDN, so it removes "foo."
bar.com
$ echo ${FQDN##*.} # this removes the longest pattern matching "*." in the beginning of $FQDN, so it removes "foo.bar."
com
```

${parameter%word} and ${parameter%%word} achieve quite the same, but on the end of the string:

```bash
$ echo ${FQDN%.*} # this removes the shortest pattern matching ".*" in the end of $FQDN, so it removes ".com"
foo.bar
$ echo ${FQDN%%.*} # this removes the longest pattern matching ".*" in the end of FQDN, so it removes ".bar.com"
foo
```

Now it’ll be fairly easy to understand what ${parameter/pattern/string} and ${parameter//pattern/string} do… They are direct replacements for sed, respectively with and without the g option:

Let’s define a new string for this one:

```bash
$ TEST_STRING="foo is long and bar is long"
$ echo ${TEST_STRING} # just a check
foo is long and bar is long
```

and now to see what these variables do:

```bash
$ echo ${TEST_STRING/long/short} # replaces the first occurence of "long" by "short" in $TEST_STRING
foo is short and bar is long
$ echo ${TEST_STRING//long/short} # replaces all occurences of "long" by "short" in $TEST_STRING, same as using g in sed
foo is short and bar is short
```

Enjoy and feel free to provide more examples you’d find useful as comments ![:)](http://web.archive.org/web/20060805074200/http://raphink.info/blog/wp-includes/images/smilies/icon_smile.gif)

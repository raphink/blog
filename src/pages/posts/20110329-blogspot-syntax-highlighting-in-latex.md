---
template: post
title: "Syntax highlighting in LaTeX"
date: "2011-03-29T22:43:00.002+02:00"
canonical_url: "https://raphink.blogspot.com/2011/03/syntax-highlighting-in-latex.html"
blogspot_url: "https://raphink.blogspot.com/2011/03/syntax-highlighting-in-latex.html"
tags: ["augeas", "latex", "python", "ubuntu"]
---
Lately, I have been busy making a [book on Augeas](https://github.com/raphink/Augeas-book). I wanted something that would look nice, and that would use only LaTeX.  
  
A colleague of mine told me to have a look at the [Pygments syntax highlighter](http://pygments.org/) and its LaTeX module [minted](http://code.google.com/p/minted/). I'm very happy with them so far.  
  

#### Installing Pygments

  
Installing Pygments on Ubuntu is as easy as can be:  
  

$ sudo apt-get install python-pygments

  
This provides a /usr/bin/pygmentize command, which is then used by minted.  
  
  

#### Installing minted

  
I didn't find a package for minted, so I downloaded the files [from the CTAN](http://www.ctan.org/tex-archive/macros/latex/contrib/minted/) and made a minted directory in my source.  
  
When building with pdflatex, I make sure to export the TEXINPUTS=minted: variable so that pdflatex uses the minted directory for inclusions.  
  
  

#### Adding syntax highlighting

  
Now that all the tools are installed, we need to actually use them in the LaTeX source. Here is a simple example:  
  

\\mint{console}|$ sudo apt-get install augeas-tools|

  
  
A multi-line example:  
  

\\begin{minted}{console}
$ sudo yum install readline-devel
$ sudo apt-get install libreadline-dev
\\end{minted}

  
  
And even a listing example:  
  

\\begin{listing}
  \\begin{minted}{augtool-shell}
/files/etc/foo.conf
/files/etc/foo.conf/#include = /etc/foo.d/\*
  \\end{minted}
  \\caption{Augeas does not interpret include statements}
  \\label{lst:intro\_include\_tree}
\\end{listing}

  
  
There is much that can be done, and the [documentation is well made](http://mirrors.ctan.org/macros/latex/contrib/minted/minted.pdf).  
  
  

#### I'm missing lexers

  
I would love my book to be full of colours. Not only for languages that are well known, but also, and especially, for the languages and commands that are specific to Augeas.  
  
Of course, Pygments doesn't provide lexers for Augeas syntax (yet), so I need to write them.  
  
The first lexer I would like to have is the augtool-shell lexer, which will put syntax highlighting on commands from an augtool session.  
  
My lexer looks like this:  
  

import re

try:
    set
except NameError:
    from sets import Set as set
from bisect import bisect

from pygments.lexer import Lexer, LexerContext, RegexLexer, ExtendedRegexLexer, \\
     bygroups, include, using, this, do\_insertions
from pygments.token import Punctuation, Text, Comment, Keyword, Name, String, \\
     Generic, Operator, Number, Whitespace, Literal
from pygments.util import get\_bool\_opt
from pygments.lexers.other import BashLexer

\_\_all\_\_ = \['AugtoolShellLexer'\]


class AugtoolShellLexer(RegexLexer):
    """
    Lexer for Augtool shell sessions.
    """

    name = 'AugtoolShell'
    aliases = \['augtool-shell'\]
    filenames = \['\*.augtoolshell'\]
    mimetypes = \['text/x-augtool-shell'\]

    tokens = {
        'root': \[
            (r'^\\s+$', Text),           # empty line
            (r'^\[;#\].\*?$', Comment),    # comment
            (r'^(rm\\s+:.\*)', Text),     # removed nodes
            (r'^(Saved.\*)', Text),      # saved
            (r'^(augtool\\>)(\\s+)(\\S+)(?:(\\s+)(.\*))?$',   # augtool prompt
             bygroups(Generic.Prompt, Whitespace, Keyword, Whitespace, String)),
            (r'^(\[^=\]+)(?:(\\s+)(=)(\\s+)(.\*))?$',    # ls/get/print
             bygroups(String, Whitespace, Operator, Whitespace, String)),
            (r'^(\\S+)(\\s+)(label)(=)(\\S+)(\\s+)(value)(=)(\\S+)(\\s+)(span)(=)(\\S+)$',  # span output
             bygroups(String, Whitespace, Keyword, Operator, String, Whitespace,
                                    Keyword, Operator, String, Whitespace,
                                    Keyword, Operator, String)),
        \]
    }

  
  
It is located in the augeas-lexer/augeaslexer/augeaslexer.py file, and the augeas-lexer directory contains the following files:  
  

augeas-lexer/
├── augeaslexer
│   ├── augeaslexer.py
│   └── \_\_init\_\_.py
└── setup.py

  
\_\_init\_\_.py is an empty file, and setup.py contains the following:  
  

"""
Augeas syntax highlighting for Pygments.
"""

from setuptools import setup

entry\_points = """
\[pygments.lexers\]
augtool-shell = augeaslexer.augeaslexer:AugtoolShellLexer
"""

setup(
    name         = 'augeaslexer',
    version      = '0.1',
    description  = \_\_doc\_\_,
    author       = "Raphael Pinson",
    packages     = \['augeaslexer'\],
    entry\_points = entry\_points
)

  
  
In order to build with this new lexer, I need to install it in my system (if someone knows how to do without this step, I'll be very happy to hear it!). The following command does that:  
  

$ sudo python setup.py install

  
Now when I run pygmentize, I should see my lexer:  
  

$ pygmentize -L | grep augtool
\* augtool-shell:
    AugtoolShell (filenames \*.augtoolshell)

  
  
I've actually added (or begun to add) 3 more lexers to my module: AugtoolLexer, AugeasLexer and PuppetAugeasLexer.  
  
The result can be see in the [PDF version of the book](http://www.scribd.com/doc/51028532/Augeas-devel) (which is still a work in progress).  
  
  

#### Defining macros

  
One thing LaTeX users love is its flexibility. On big projects such as books, it is often useful to define macros and new environments.  
  
Here is an example of a listing containing several languages with line numbering. The macros take care of applying the line numbering options (linenos and firstnumber) and defining the standard options for my document (fontsize=\\footnotesize and bgcolor=bg).  
  
The macros look like this:  

% minted commands

\\newcommand{\\mymint}\[3\]\[\]{\\mint\[fontsize=\\footnotesize,bgcolor=bg,#1\]{#2}#3}
\\newcommand{\\consolecode}\[2\]\[\]{\\mymint\[#1\]{console}#2}
\\newcommand{\\augtoolshcode}\[2\]\[\]{\\mymint\[#1\]{augtool-shell}#2}

% inputminted

\\newcommand{\\myinputminted}\[3\]\[\]{\\inputminted\[fontsize=\\footnotesize,bgcolor=bg,#1\]{#2}{../listings/#3}}

  
And the listing:  

\\begin{listing}
  \\consolecode\[linenos\]|$ augtool --backup --root myroot|
  \\myinputminted\[linenos,firstnumber=2\]{augtool-shell}{rm\_fstab\_opt.augtoolshell}
  \\consolecode\[linenos,firstnumber=15\]|$ diff -u myroot/etc/fstab myroot/etc/fstab.augsave|
  \\myinputminted\[linenos,firstnumber=16\]{diff}{fstab\_opt.diff}
  \\caption{Removing an option in fstab}
  \\label{lst:rm\_fstab\_opt}
\\end{listing}

  
This produces the following output:  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhEW7b3Tbh62i5m6AmdfAoyETfZLpX5P4kyQ24d1SYBED2mBr9QFj4sIjsshETZJlIukypfTPQ0K-AjMtuTDad6CrWlgrK8cHckFyAjlgXyS_ZMODv0BHYOuxk4WNAyFOSTg_D13GFiVL3I/s320/listing_minted_macros.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhEW7b3Tbh62i5m6AmdfAoyETfZLpX5P4kyQ24d1SYBED2mBr9QFj4sIjsshETZJlIukypfTPQ0K-AjMtuTDad6CrWlgrK8cHckFyAjlgXyS_ZMODv0BHYOuxk4WNAyFOSTg_D13GFiVL3I/s1600/listing_minted_macros.png)

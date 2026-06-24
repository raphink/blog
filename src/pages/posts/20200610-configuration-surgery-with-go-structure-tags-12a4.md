---
template: post
title: "Configuration surgery with Go structure tags"
date: "2020-06-10T20:55:35Z"
excerpt: "Narcissus is a reflection library letting you edit configuration files in Go"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fp9blragy3jsbexp72cs0.jpg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fp9blragy3jsbexp72cs0.jpg"
canonical_url: "https://dev.to/raphink/configuration-surgery-with-go-structure-tags-12a4"
devto_url: "https://dev.to/raphink/configuration-surgery-with-go-structure-tags-12a4"
tags: ["go", "opensource", "augeas", "showdev"]
---
From Docker to Kubernetes, from Consul to Terraform, Go has been used increasingly in system tools these last years.

Since most of these system tools manage systems running on Unix systems, one of their core tasks is to deal with files, and [configuration files in particular](https://dev.to/camptocamp-ops/how-to-manage-files-with-puppet-55e4).


# Augeas: the configuration management scalpel

[Augeas](https://augeas.net/) is a C library to modify configuration files. It allows to parse files with many different syntax (over 300 by default), modify the configuration using a tree accessed with an XPath-like language, and write back the configuration.

It tries hard to modify only what you mean to, keeping all details (spaces, indentations, new lines, comments) unchanged.

![Augeas](https://dev-to-uploads.s3.amazonaws.com/i/xij7ocuklz6agg2rm95h.png)

Because of its history, Augeas is mainly known in the Puppet world. However, there are also plugins for [Ansible](https://github.com/paluh/ansible-augeas), [Chef](https://github.com/nhuff/chef-augeas), [SaltStack](https://docs.saltstack.com/en/latest/ref/states/all/salt.states.augeas.html), [(R)?ex](https://github.com/RexOps/rex-augeas) and more tools… Augeas is also used directly in C libraries such as libvirt and Nut.


# Augeasproviders

In the Puppet world, the [Augeasproviders project](http://augeasproviders.com/) was created to develop native Puppet types and providers (in Ruby) based on Augeas.

These providers use the Augeas Ruby bindings to draw on Augeas' power, all the while providing a simple interface for users, without the need to know how Augeas works.

At the core of the Augeasproviders project, there is a base provider shipped in the [hearculesteam-augeasproviders_core](https://github.com/hercules-team/augeasproviders_core) Puppet module, which provides an interface to build more providers, in a declarative way.

For example, you can set the location of the node corresponding to the Puppet resource to manage in the Augeas tree:

```ruby
resource_path do |resource|
  service = resource[:service]
  type = resource[:type]
  mod = resource[:module]
  control_cond = (resource[:control_is_param] == :true) ? "and 
  control='#{resource[:control]}'" : ''
  if target == '/etc/pam.conf'
    "$target/*[service='#{service}' and type='#{type}' and module='#{mod}' #{control_cond}]"
  else
    "$target/*[type='#{type}' and module='#{mod}' #{control_cond}]"
  end
end
```

The `create` and `destroy` methods, as well as the getters and setters for the Puppet resource properties, can also be described in a similar fashion, making it simpler to [develop new providers based on Augeas](https://github.com/hercules-team/augeasproviders/blob/master/docs/development.md).


# Go bindings

As for many other languages, there are Go bindings for Augeas: 

[GitHub — dominikh/go-augeas](https://github.com/dominikh/go-augeas)

Much like the Ruby bindings, the go library lets you manipulate an Augeas handler to query the Augeas tree, modify it, and save it.


# Go structure tags

In the Go world, structures have optional tags which can be used for parsing and writing to external formats.

This is used to reflect structures as JSON, YAML, XML, or specify library options to manage the structure fields: 

```go
// Version is an S3 bucket version
type Version struct {
  ID           uint      `sql:"AUTO_INCREMENT" gorm:"primary_key" json:"-"`
  VersionID    string    `gorm:"index" json:"version_id"`
  LastModified time.Time `json:"last_modified"`
}
```

They are also used to build program interfaces by [specifying configuration options](https://github.com/jessevdk/go-flags):

```go
type config struct {
  Version        bool     `short:"V" long:"version" description:"Display version."`
  Token          string   `short:"t" long:"token" description:"GitHub token" env:"GITHUB_TOKEN"`
  Users          []string `short:"u" long:"users" description:"GitHub users to include (comma separated)." env:"GITHUB_USERS" env-delim:","`
  Manpage        bool     `short:"m" long:"manpage" description:"Output manpage."`
}
```

The tags above (`sql`, `gorm`, `json`, `short`, `long`, `description`, `env`, `env-delim`) are used by Go libraries through the [Go reflection library](https://golang.org/pkg/reflect/) to provide dynamic features for structures.


# Narcissus: Augeasproviders for the Go world

While Hercules is known in Greek mythology for his works —including cleaning the stables of King Augeas—, Narcissus is famous for gazing at his reflection in the water.


[GitHub — raphink/narcissus](https://github.com/raphink/narcissus)


The Narcissus project is a Go library providing structure tags to manage configuration files with Augeas. It then maps structure tags to the Augeas tree dynamically, allowing you to expose any configuration file (or file stanza) known to Augeas as a Go structure.


## Example of `/etc/group`

The Unix `group` file is very simple and well-known. It features one group per line, with fields separated by colons:

```
root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:syslog,raphink
```

### Parsing with Augeas

Augeas parses it by storing each group name as a node key in the tree, and exposing each field by its name:

```console
$ augtool print /files/etc/group
/files/etc/group
/files/etc/group/root
/files/etc/group/root/password = "x"
/files/etc/group/root/gid = "0"
/files/etc/group/daemon
/files/etc/group/daemon/password = "x"
/files/etc/group/daemon/gid = "1"
/files/etc/group/bin
/files/etc/group/bin/password = "x"
/files/etc/group/bin/gid = "2"
/files/etc/group/sys
/files/etc/group/sys/password = "x"
/files/etc/group/sys/gid = "3"
/files/etc/group/adm
/files/etc/group/adm/password = "x"
/files/etc/group/adm/gid = "4"
/files/etc/group/adm/user[1] = "syslog"
/files/etc/group/adm/user[2] = "raphink"
```

Modifying any of these fields and saving the tree will result in an updated `/etc/group` file. Adding new entries in the tree will result in additional entries in `/etc/group`, provided the tree is valid for the `Group.lns` Augeas lens.


## Parsing with Narcissus

In our Go code, we can map a `group` structure to entries in the `/etc/group` file easily by using the Narcissus package:

```go
import (
	"log"

	"honnef.co/go/augeas"
	"github.com/raphink/narcissus"
)

type group struct {
	augeasPath string
	Name       string   `narcissus:".,value-from-label"`
	Password   string   `narcissus:"password"`
	GID        int      `narcissus:"gid"`
	Users      []string `narcissus:"user"`
}

func main() {
	aug, err := augeas.New("/", "", augeas.None)
	if err != nil {
		log.Fatal("Failed to create Augeas handler")
	}
	n := narcissus.New(&aug)

	group := &group{
		augeasPath: "/files/etc/group/docker",
	}
	err = n.Parse(group)
	if err != nil {
		log.Fatalf("Failed to retrieve group: %v", err)
	}

	log.Printf("GID=%v", group.GID)
	log.Printf("Users=%v", strings.Join(group.Users, ","))
}
```

The `augeasPath` field is necessary to store the location of the file in the Augeas tree, in our case `/files/etc/group/docker` to manage the `docker` group in the file.

Then each structure field is linked to the corresponding node name in the Augeas tree:

* Name is taken from the node label, so we use the special value `.,value-from-label`, where `.` refers to the current node, and `value-from-label` tells Narcissus how to get the value
* `password` for the Password
* `gid` for the GID
* `user` for the Users, parsed as a slice of strings (i.e. the `user` label might appear more than once in the Augeas tree)

Note that all fields must be capitalized in order for Go reflection to work.

Once we call the `Parse()` method on the Narcissus handler, the structure is dynamically filled with the values in the Augeas tree, so we can access the gid with `group.GID` and the users with `group.Users`.


## Modifying files

The main point of the Augeas library is not just to parse, but also to modify configuration files in a versatile way.

In Narcissus, this is done by calling the `Write()` method on the Narcissus handler. Narcissus then transforms the structure back to the Augeas tree and saves it.

For example, using the `PasswdUser` type provided by default in the `narcissus` package:

```go
user := n.NewPasswdUser("raphink")

// Modify UID
user.UID = 42

if err := n.Write(user); err != nil {
  log.Fatalf("Failed to save user: %v", err)
}
```


## Included formats

Narcissus comes with a few structures already mapped:

* `/etc/fstab`, with the `NewFstab()` method
* `/etc/hosts` with the `NewHosts()` method
* `/etc/passwd` with `NewPasswd()` and `NewPasswdUser()` methods
* `/etc/services` with `NewServices()` and `NewService()` methods


Which structures will you map with it? Which tool could benefit from this library?

Let me know in the comments!

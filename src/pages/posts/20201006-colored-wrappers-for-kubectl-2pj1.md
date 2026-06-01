---
template: post
title: "Colored wrappers for kubectl"
date: "2020-10-06T19:50:58Z"
excerpt: "Kubectl commands, but in color"
canonical_url: "https://dev.to/raphink/colored-wrappers-for-kubectl-2pj1"
devto_url: "https://dev.to/raphink/colored-wrappers-for-kubectl-2pj1"
---
When using Kubernetes, `kubectl` is the command we use the most to visualize and debug objects.

However, it currently does not support colored output, though there is [a feature request opened for this](https://github.com/kubernetes/kubectl/issues/524).

Let's see how we can add color support. I'll be using zsh with [oh my zsh](https://ohmyz.sh/).


*Edit:* this feature was [merged in oh my zsh](https://github.com/ohmyzsh/ohmyzsh/pull/9316), so it is now standard.


# Zsh plugin

Let's make this extension into a zsh plugin called `kubectl_color`:

```shell
❯ mkdir -p ~/.oh-my-zsh/custom/plugins/kubectl_color
❯ touch ~/.oh-my-zsh/custom/plugins/kubectl_color/kubectl_color.plugin.zsh
```

Now we need to fill in this plugin.


## JSON colorizing

Let's start with JSON, by adding an alias that colorizes JSON output using the infamous [`jq`](https://stedolan.github.io/jq/):

```zsh
kj() {
  kubectl "$@" -o json | jq
}

compdef kj=kubectl
```

The `compdef` line ensures the `kj` function gets autocompleted just like `kubectl`.


*Edit:* I've added another wrapper for [`fx`](https://github.com/antonmedv/fx), which provides a dynamic way to parse JSON:

```zsh
kjx() {
  kubectl "$@" -o json | fx
}

compdef kjx=kubectl
```


## YAML colorizing

Just like for JSON, we can use [`yh`](https://stedolan.github.io/jq/) to colorize YAML output:

```zsh
ky() {
  kubectl "$@" -o yaml | yh
}

compdef ky=kubectl
```

# Energize!

Our plugin is now ready, we only need to activate it in `~/.zshrc` by adding it to the list of plugins, e.g.:

```zsh
plugins=(git ruby kubectl kubectl_color)
```

[asciinema cast 363827](https://asciinema.org/a/363827)

and with `fx`:

[asciinema cast 364137](https://asciinema.org/a/364137)

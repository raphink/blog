---
template: post
title: "Taming Puppetserver 6: a Grafana story"
date: "2020-05-13T08:32:41Z"
excerpt: "Using Grafana & Catalog Diff to tune the Puppet Server"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Ft2lnmj23y7z3cvgo0b1t.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Ft2lnmj23y7z3cvgo0b1t.png"
canonical_url: "https://dev.to/camptocamp-ops/taming-puppetserver-6-a-grafana-story-3c4f"
devto_url: "https://dev.to/camptocamp-ops/taming-puppetserver-6-a-grafana-story-3c4f"
---
After some time preparing for the migration, yesterday was finally the time to switch our first production Puppetserver to Puppet 6.

Everything was ready: we had been running both versions of the server alongside each other for some time, [performing catalog diffs](https://dev.to/camptocamp-ops/automated-puppet-impact-analysis-1c1), and nothing seemed to be getting in the way as I went into ArgoCD and deployed the new version of the stack.

![Deploying the Puppetserver in ArgoCD](https://dev-to-uploads.s3.amazonaws.com/i/4yegip5ggdh0k7npdz8b.png)


The first 30 minutes went fine. But then catalogs started failing compilation, and other services colocated on the OpenShift cluster became slow.


# The Problem

In retrospect, I should have known something was wrong. Two weeks ago when I started my tests with Puppet 6 on another platform, I noticed that the server would die of OOM quite rapidly. Our Puppetserver 5 pods had been running happily for years with the following settings:

```yaml
max_active_instances: '4'
java_xmx: '2g'

requests:
  cpu: 10m
  memory: 2Gi
limits:
  cpu: 3
  memory: 4Gi
```

When I started new Puppet 6 instances with these settings, they would die. Initially, I thought the Xmx wasn't high enough so I set it to `3g` and everything seemed fine again, for the duration of the catalog-diff tests.

But when the servers started crashing in production yesterday, it was clear there was another problem. And upgrading the Xmx to a higher value didn't help.

So we looked at the graphs.


# The Graphs

For years, we have been gathering internal metrics from our Puppetservers. Our [Puppetserver Helm chart](https://github.com/camptocamp/charts/tree/master/puppetserver) comes equipped with a JMX Exporter pod to gather the data and send them to Prometheus. We then have a Grafana dashboard presenting all the Puppetserver metrics in a useful manner.

![Puppetserver metrics in Grafana](https://dev-to-uploads.s3.amazonaws.com/i/wxq2pi5b4jn5knp4pn71.png)


Looking at the graphs from even before the switch showed that something was indeed aloof. 

![JVM Metrics for Puppetserver 5 and 6](https://dev-to-uploads.s3.amazonaws.com/i/63f6ewg4uheojxp1abv3.png)


Clearly, the Puppetserver 6 instances had a very different memory ramp up (blue and yellow "teeth" lines), even during the tests phase. I just hadn't noticed then.


We started a series of tests, using Puppet Catalog Diff runs to test load the servers, and playing on all various parameters of our stack:

* memory requests
* memory limits
* cpu limits
* Java Xmx
* max active instances


It quickly became clear that the main factor in our problem was that the memory request was too low.

The official [Puppet documentation](https://puppet.com/docs/puppetserver/latest/tuning_guide.html#jvm-heap-size) gives a rule of thumb for tuning the Puppetserver memory. It indicates that each active instance requires 512MB, but another 512MB should be provided for non-heap needs:

> You’ll also want to allocate a little extra heap to be used by the rest of the things going on in Puppet Server: the web server, etc. So, a good rule of thumb might be 512MB + (max-active-instances * 512MB).

Our graphs clearly showed that the non-heap memory of the instances stabilized a little bit over 512MB (around 550MB as I'm writing this).


Since we requested 4 JRuby instances, we should ensure at least (4+1)*512MB of RAM, so 2.5GB. And while our limit was set to 4GB, the requests were only set to 2GB. Changing the requested memory to a higher value showed that this was what was making our servers misbehave.


# Further tuning


## CPU limit

We originally set the containers to a CPU limit of 3 because or compute nodes have 4 CPUs and we wanted to leave one free.

We actually noticed that Puppetserver was using closer to 2.5 CPUs as a mean. So we set the limit to 4 and saw that the Puppetserver seemed to use even less CPU, down to a mean of 2.

Note that limiting CPUs is necessary when running Java in containers, otherwise Java believes it runs on a single CPU.


## Max JRuby Instances

The number of JRubies recommended changed between Puppet 5 and 6, as stated in the documentation. Up to Puppet 4, it was recommended to set it to `num-cpus + 2`, but the docs now state:

> As of Puppet Server 1.0.8 and 2.1.0, if you don’t provide an explicit value for this setting, we’ll default to num-cpus - 1, with a minimum value of 1 and a maximum value of 4.

We ran load tests with different values of max JRuby instances and found that `num-cpus - 1` was indeed the best good value.

Most importantly, we found that setting up the max JRuby instances higher than the number of CPUs made compilation time quite slower (supposedly as it would increase context-switch between the instances).


## Final settings

Following the guidelines and our tests, we ended up with:

```yaml
max_active_instances: '3'   # since we have 4 CPUs
java_xmx: '2g'              # (3+1)*512MB

requests:
  cpu: 10m
  memory: 3Gi               # 1.5*XmX
limits:
  cpu: 4                    # Use all available CPUs as limit
  memory: 3.3Gi             # 1.1*request just in case
```

On this graph from the last 2 days, we can clearly see the situations before production time, during crisis, and after proper tuning:

![JVM Metrics evolution](https://dev-to-uploads.s3.amazonaws.com/i/t2lnmj23y7z3cvgo0b1t.png)



# Kubernetes-related issues


So our Puppetserver was back under control, with pretty similar memory settings to what Puppet 5 used.

Keeping the two pods we had been running, with their new tuned settings, we ran stress tests by setting the number of parallel threads in the Catalog Diff run.

When running 12 threads in parallel (far more than what 2 pods with 3 JRubies each can take), we noticed something I had seen before but not understood:

```css
Failed to retrieve catalog for foo.example.com from puppetserver in environment catalog_diff: Failed to open TCP connection to puppetserver:8140 (No route to host - connect(2) for "puppetserver" port 8140)
```

I had initially thought this was what happened by the Puppetserver was too busy and started rejecting connections. But no, this was clearly another problem, linked to Kubernetes networking and readiness probes.

As we kept an eye on the Pods readiness during the run, we noticed the pods were going on and off, and thus being taken out of the Kubernetes service on a regular basis. The TCP connection issues happened when both pods were taken out of the service at the same time, since the service ended up with no endpoints left.

So we turned to the pod's readiness probe to tune it.

This is the default readiness probe we use in our Helm chart:

```yaml
readinessProbe:
  httpGet:
    path: /production/status/test
    port: http
    scheme: HTTPS
    httpHeaders:
      - name: Accept
        value: pson
  initialDelaySeconds: 30
```

The initial delay lets the Puppetserver start its first JRuby instance before sending a probe. The default in Kubernetes would be `0` otherwise, which would clearly fail for a Puppetserver.

For all other settings, we relied on the defaults. As per [Kubernetes docs](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes):

> * initialDelaySeconds: Number of seconds after the container has started before liveness or readiness probes are initiated. Defaults to 0 seconds. Minimum value is 0.
> * periodSeconds: How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1.
> * timeoutSeconds: Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1.
> * successThreshold: Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness. Minimum value is 1.
> * failureThreshold: When a Pod starts and the probe fails, Kubernetes will try failureThreshold times before giving up. Giving up in case of liveness probe means restarting the container. In case of readiness probe the Pod will be marked Unready. Defaults to 3. Minimum value is 1.


The `timeoutSeconds` parameter looks very low at 1 second by default. Indeed, we know that a busy Puppetserver could take more than 1 second to respond and that would be perfectly acceptable. So we've set it to `5` instead and the service has been much more stable since.

We've also set `failureThreshold` to `5`.


# Conclusion

A small fine-tuning goes a long way!

Be sure to gather enough data about your Puppetserver so you have the tools to debug its behavior when you need.


Do you have Puppet, Kubernetes, or observability needs? You can [contact  us](https://www.camptocamp.com/contact/) and we'll be happy to put our expertise at your service!

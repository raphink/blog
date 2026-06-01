---
template: post
title: "Taming Puppetserver 6 Pt II: Garbage Collection"
date: "2020-05-15T10:49:37Z"
excerpt: "PuppetServer can be spending a lot of time doing gargage collection, which impacts its performance"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F1wtluh7qosm01n29xmgq.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F1wtluh7qosm01n29xmgq.png"
canonical_url: "https://dev.to/camptocamp-ops/taming-puppetserver-6-pt-ii-garbage-collection-2oh2"
devto_url: "https://dev.to/camptocamp-ops/taming-puppetserver-6-pt-ii-garbage-collection-2oh2"
---
Now that our internal Puppet Infrastructure is [migrated to Puppet 6 and tuned](https://dev.to/camptocamp-ops/taming-puppetserver-6-a-grafana-story-3c4f), it was time to switch a second infra to it.

Yesterday, I migrated our second infrastructure, and started seeing more issues. The rules-of-thumb from last post were useful, but I still needed to upgrade available memory to make up for a lack of computing power (probably to be imputed to the underlying IaaS throttling virtual CPUs).

And then, a Puppetserver crashed with a `GC overhead limit exceeded` error. This error happens when the CPU spends more than 98% performing garbage collection.


# Analyzing Garbage Collection Data

Looking at our Grafana dashboard, I realized we had no metrics about garbage collection, so I added a graph with two metrics:

* mean time per GC: the average time taken by each garbage collection request to complete, calculated as a rate over 1 minute (since `jvm_gc_collection_seconds_sum` is a cumulative counter)
* GC time: the percentage of time spent by the CPUs doing GC, over 1 minute (since `jvm_gc_collection_seconds_count` is also a cumulative counter)

The formulas are as follow:

* `time per request {{gc}}`: `rate(jvm_gc_collection_seconds_sum{job="puppetserver"}[1m])/rate(jvm_gc_collection_seconds_count{job="puppetserver"}[1m])`
* `rate {{gc}}`: `rate(jvm_gc_collection_seconds_sum{job="puppetserver"}[1m])`

![Graph queries](https://dev-to-uploads.s3.amazonaws.com/i/euwyfd4972ggylucm4n3.png)


# GC time

I then looked at the graphs around the time when the `GC overhead limit exceeded` error happened:

![GC overhead limit exceeded](https://dev-to-uploads.s3.amazonaws.com/i/w6k51xxcgoucexyieap3.png)


Yes, I had a problem indeed. I restarted the Puppetservers and this hasn't happened since. However, the rates for PS MarkSweep have kept pretty high still. Here's the last 15 minutes as I'm writing:

![Standard activity for Puppet Infra 2](https://dev-to-uploads.s3.amazonaws.com/i/y93wzup9e7wglf4ectng.png)


In comparison, the infrastructure I upgraded last week is faring much better, with GC rates well under 10%:

![Standard activity for Puppet Infra 1](https://dev-to-uploads.s3.amazonaws.com/i/466p0q75k2irwheuze22.png)


# Mean time per GC

In addition to a high rate spent performing garbage collection on the PS MarkSweep GC threads, I also noticed that the mean GC time for PS MarkSweep is pretty high, too, at around 2 to 3s. The values are slightly lower (a bit under 2s) on my first infrastructure.


# Getting rid of PS MarkSweep

All in all, it seems PS MarkSweep garbage collection is to blame. It tends to take lots of CPU, for long periods of time.

The good news is: [PS MarkSweep is a legacy garbage collector](https://stackoverflow.com/questions/39929758/ps-marksweep-is-which-garbage-collector/44923227#44923227), and it's not too hard to get rid of it, since [OpenJDK 11 replaces it with the G1 Young Generation garbage collector by default](https://blog.idrsolutions.com/2019/05/java-8-vs-java-11-what-are-the-key-changes/).

The [official puppetserver Docker image](https://hub.docker.com/r/puppet/puppetserver) installs the `puppetserver` package, which pulls `openjdk-8-jre-headless` as a dependency. [OpenJDK 11 is also officially supported](https://puppet.com/docs/puppetserver/latest/install_from_packages.html#java-support) starting with Puppet 6.6, but the package doesn't allow to install it instead of OpenJDK 8. So for now, I'll just derive an image and install `openjdk-11-jre-headless` in addition to OpenJDK8 and let Ubuntu update the alternative for Java automatically.


The following graph shows the difference in GC time between PS MarkSweep and G1, following the upgrade to OpenJDK 11:

![PS MarkSweep vs G1](https://dev-to-uploads.s3.amazonaws.com/i/1wtluh7qosm01n29xmgq.png)


And here's what GC looks like after a good warm up:


![New GC graph](https://dev-to-uploads.s3.amazonaws.com/i/hvr49m18eeidpxt31u7k.png)


From 2s to 80ms, that's a great improvement if you ask me!

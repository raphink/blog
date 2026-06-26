---
template: post
title: "Immutability & loose coupling: a match made in heaven"
date: "2021-03-18T07:31:29Z"
excerpt: "Decoupling in container orchestration enables immutable infrastructure workflows."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fzptftzr4jxlblx11pf8n.jpg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fzptftzr4jxlblx11pf8n.jpg"
canonical_url: "https://www.camptocamp.com/en/news-events/immutability-and-loose-coupling-a-match-made-in-heaven"
devto_url: "https://dev.to/camptocamp-ops/immutability-loose-coupling-a-match-made-in-heaven-37kl"
tags: ["devops", "containers", "immutability", "architecture"]
series: "\"DevOps: Concepts, Culture, and Consequences\""
---
When it comes to infrastructure and deployment automation, two opposite approaches share the podium: [mutable vs immutable management](https://www.digitalocean.com/community/tutorials/what-is-immutable-infrastructure).

## Mutable Systems

Mutable systems usually have a long life cycle, typically in the order
of weeks to years. As their requirements change (new files,
configurations, users, packages, etc.), the systems are modified to
match a new target state. When left unmanaged, mutable systems tend to
drift away from their target state, in a *divergent* dynamic.

![Convergence Models in Mutable Systems](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/11trbxkb1ev9goye0q2k.png)


Automating mutable systems is often referred to as Configuration Management, and leverages tools such as [Cfengine](https://cfengine.com/), [Puppet](https://puppet.com/), [Chef](https://www.chef.io/), or [Ansible](https://www.ansible.com/). This tooling uses principles based on the concepts of target state, idempotence, and somewhat related to [Mark Burgess’ Promise Theory](https://en.wikipedia.org/wiki/Promise_theory).  Configuration Management aims to make the system *convergent*, by running a tool on a regular basis, in order to resynchronize the system with its target state. Some of these tools (e.g.  [mgmt](https://github.com/purpleidea/mgmt)) also attempt to reach *congruence* by adopting a reactive approach, triggering corrective actions on events.

## Immutable Systems

In an immutable system, any change requires a new deployment. Whether it be a change in configuration, new files, or new users, immutability demands that the system be destroyed and rebuilt from scratch.

![Trash full? Let's move to a new house!](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hl5ewtyqpo5offh4p9jh.png)

An immutable approach can greatly simplify deployments. Avoiding convergence, immutable systems rely on artifacts that are built once, and can be deployed multiple times. These artifacts can increase trust in the ability to rebuild the system from scratch if necessary. It can also ease scalability, since the artifact can be precisely duplicated.

However, immutability comes with a high cost: in order to be done properly, it must be strict. Any change to the state involves a complete replacement of the artifact. A lack of abiding to that rule results in a convergent system (at best), which cannot be managed in an immutable manner.

## Mutable vs Immutable

If immutable systems are easier to maintain, what are the reasons for not using them?  The system’s complexity is probably the main justification. A traditional mutable system features multiple layers (Operating System, Middleware, Applications) that are usually strongly coupled. For example, the flavor and version of the Operating System define which version of a Middleware (e.g. Tomcat, Apache) is available for installation. In turn, the Middleware version defines which libraries are available for the Application. On most Unix-based systems, shared libraries are at the root of strong links between software versions, based on the underlying ABIs required to run them.

If such strongly coupled systems are to be managed in an immutable manner, then the *whole system* is the immutable artifact. In the majority of organizations, this implies managing tens to thousands of artifacts, and rebuilding them from scratch on a regular basis. Such complexity is too much of a cost.

Enters decoupling technologies: Over the years, new technologies have surfaced, which allow to decouple system components and ease their management in an immutable manner.

# Virtualization and IaaS

With the rise of virtualization in the early years of the 21st century, it became easier to decouple the hardware from the Operating System. You could now size virtual machines as precisely as desired, in terms of CPU, memory, or disk, without adding or replacing any physical device.

This unlocked access to a first level of automated immutability, using Virtual Machine images as the immutable artifact. Image generators (such as Hashicorp Packer) appeared, easing the generation of VM images.

Provided the whole target state —including the OS, middleware and application itself— is built into the VM image, an immutable workflow can be used to manage it. In this case, whenever a change is required, the whole image needs to be rebuilt and redeployed to new VMs.


<figure>
  <img alt="Golden Images are a common approach to divergent templating" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0gu5n8xhs57jvxnkn3ay.jpg" />
  <figcaption>Golden Images are a common approach to divergent templating</figcaption>
</figure>


For a time, this deployment could not be easily automated, as physical nodes still needed to be manually picked before deploying the VM images.  Infrastructure as a Service (IaaS), often referred to as “Cloud”, changed that.

IaaS provided APIs on top of virtualization, and the IaaS system (e.g.  AWS EC2, OpenStack) would often pick the physical hypervisor node itself, making it possible to fully automate the deployment of new artifacts (such as VM images).

One important problem remained to achieve immutable infrastructure in most situations: the complexity of the artifact itself.

# Containers and Orchestrators

When setting up applications on existing systems, several issues often arise, among which are: packaging, configuration, and dependencies.

For years, developers and systems engineers tried to solve the problem of application packaging and deployment using all kinds of package managers, from deb/rpm to homemade systems. This often failed, because these packages didn’t allow for multiple instantiation of the application, were not easy to configure, and were too tightly coupled to the rest of the system.

Docker containers provided a unified way of packaging applications, in the form of OCI images, a rather unified way of configuring them (using environment variables or mounted files, in the [12 factor app](https://12factor.net/) fashion).

But mainly, containers provided an abstraction level, a decoupling from the system. With containers, it doesn’t matter anymore which OS is running the container engine. Developers can now choose to run any version of Tomcat or Apache, on any node with a container engine. As a corollary, they can also run any combination of Middleware and Applications, regardless of the libraries provided on the underlying system.

Furthermore, containers were made to be managed in an immutable manner, using OCI images as immutable artifacts. Every time a container needs to be modified, it requires the creation of a new container from a new image.



The benefits are huge. With this decoupling of the Operating System from the Middleware and Applications, the monolithic immutable artifact that was previously managed as a VM image can now be broken down into many pieces: the application is now an immutable artifact, and so are the middleware components as well.

Even better: since all the components running on the machines are now immutable, the machines themselves have now become totally neutral; all they require is a container engine in order to run containers.

One thing can still make a node a snowflake: manually deployed containers, using tools such as Docker or Docker-compose.

What IaaS did for VMs, Container orchestrators now do for containers: they provide an API to orchestrate the dynamic deployment of containers on a cluster of nodes.

<figure>
  <img alt="Container Orchestration is to Containers what IaaS is to Virtual Machines" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c4m11g0j9tcebfi9zlic.png" />
  <figcaption>Container Orchestration is to Containers what IaaS is to Virtual Machines.</figcaption>
</figure>

The nodes are thus totally neutral now. As a result, their templates are greatly simplified, and they can now easily be managed in an immutable way. This new paradigm opened the way to new Operating Systems specialized for container orchestration, such as [CoreOS](https://getfedora.org/en/coreos?stream=stable) or [RancherOS](https://rancher.com/docs/os/v1.x/en/), whose life cycles are meant to be managed with an immutable workflow.



# Immutability & Convergence

Now that we have a full Immutable System, does it solve the problem of convergence?

Immutable artifacts in themselves are not supposed to evolve, but their target state does evolve. In this regard, the situation with containers is similar to that of Golden Images for Virtual Machines: though the artifact is immutable, it can easily be used as a template leading to an unmaintained, divergent system.

There is thus still a need for convergence tools in the container world.  However, this is not because the objects themselves drift from their target state. Rather, the target state evolves while the objects —supposedly— are stuck in their original state.

![Convergence Models in Immutable Systems](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kyd2lcx01jxcgq1qiq6w.png)


Where Configuration Management tools ensure a convergence of states for mutable systems such as VMs, packaging tools such as [Helm](https://helm.sh/) and [Helmfile](https://github.com/roboll/helmfile) can be used to periodically re-synchronize containers and other immutable objects with their target state.

Finally, congruence is also achievable, with tools such as [Argo CD](https://argoproj.github.io/argo-cd/). Argo CD not only deploys immutable objects to a Kubernetes cluster, but also keeps them synchronized with their last known target state, ensuring a continuous management.


# Conclusion

Containers and Container Orchestrators enable fully immutable workflows for infrastructure, middleware and applications alike:

  - Nodes can be managed as virtual machines, with immutable VM images deployed dynamically using IaaS;

  - Middleware and applications can be managed as containers, with immutable OCI images deployed dynamically using Container Orchestrators.

Are immutable systems always the best answer? As we’ve seen, the cost in artifact management and orchestration is far from negligible. Due to the transient nature that comes with their immutability, containers are better suited for stateless applications that easily scale on clusters of neutral nodes. For this reason, highly stateful applications with long life cycles, such as databases, are still better maintained as mutable systems most of the time.

Choosing an immutable vs mutable architecture depends a lot on an organization’s software architecture and culture, and is not a light choice to make. Is immutable infrastructure the solution to your automation problems? Contact us, we can help you find out!

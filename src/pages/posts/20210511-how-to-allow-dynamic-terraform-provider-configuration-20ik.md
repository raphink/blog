---
template: post
title: "How to allow dynamic Terraform Provider Configuration"
date: "2021-05-11T11:47:57Z"
excerpt: "Terraform providers can be dynamically configured using other resource attributes if their code allows for it"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fbjkdnrg8gmbjiazvn8l8.jpg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fbjkdnrg8gmbjiazvn8l8.jpg"
canonical_url: "https://dev.to/camptocamp-ops/how-to-allow-dynamic-terraform-provider-configuration-20ik"
devto_url: "https://dev.to/camptocamp-ops/how-to-allow-dynamic-terraform-provider-configuration-20ik"
---
[Terraform](http://terraform.io/) relies heavily on the concept of [providers](https://www.terraform.io/docs/providers/index.html), a base brick which consists of Go plugins enabling the communication with an API.

Each provider gives access to one or more resource types, and these resources then manage objects on the target API.

Most of the time, a provider's configuration is static, e.g.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

However, in some cases, it is useful to configure a provider dynamically, using the attribute values from other resources as input for the provider's configuration.

I'll use the example of the [Argo CD provider](https://github.com/oboukili/terraform-provider-argocd). *In a single Terraform run*, we would like to:

* install a Kubernetes cluster (using a [DevOps Stack](https://devops-stack.io) K3s Terraform module)
* install Argo CD on the the cluster using the [Helm provider](https://registry.terraform.io/providers/hashicorp/helm/latest/docs)
* instantiate Argo CD resources (projects, applications, etc.) on this new Argo CD server.


Our code will look like this:


```hcl
# Install Kubernetes & Argo CD using a local module
# (from https://devops-stack.io)
module "cluster" {
  source = "git::https://github.com/camptocamp/devops-stack.git//modules/k3s/docker?ref=master"

  cluster_name = "default"
  node_count   = 1
}

# /!\ Setup the Argo CD provider dynamically
# based on the cluster module's output
provider "argocd" {
  server_addr = module.cluster.argocd_server
  auth_token  = module.cluster.argocd_auth_token
  insecure    = true
  grpc_web    = true
}

# Deploy an Argo CD resource using the provider
resource "argocd_project" "demo_app" {
  metadata {
    name      = "demo-app"
    namespace = "argocd"
  }

  spec {
    description  = "Demo application project"
    source_repos = ["*"]

    destination {
      server    = "https://kubernetes.default.svc"
      namespace = "default"
    }

    orphaned_resources {
      warn = true
    }
  }

  depends_on = [ module.cluster ]
}
```


This requires to configure Argo CD dynamically, using the output of the Kubernetes cluster's resources.


# Provider Initialization

Providers are initialized early in a Terraform run, as their initialization is required to compute the graph which defines in which order the resources are applied.

This means it is actually not possible to make a provider initialize after a secondary resource is created.

Officially, the story stops here, and Terraform has [a bug report](https://github.com/hashicorp/terraform/issues/24055) to track the feature allowing to dynamically configure providers.

So… it's game over then? 🎮 👾
Not really!


# Leveraging Pointers

When a provider is configured in Terraform, it triggers a configuration function:

```go
func Provider() *schema.Provider {
    return &schema.Provider{
      ConfigureFunc: func(d *schema.ResourceData) (interface{}, error) {
        // Create someObject
        return someObject, nil
      }
    }
}
```

This `ConfigureFunc` method is usually used to create a static client for the target API. In the Argo CD provider for example, it returns a `ServerInterface` structure, with pointers to several clients, instantiated from the provider parameters:

```go
type ServerInterface struct {                                                   
    ApiClient            *apiclient.Client                                      
    ApplicationClient    *application.ApplicationServiceClient                  
    ClusterClient        *cluster.ClusterServiceClient                          
    ProjectClient        *project.ProjectServiceClient                          
    RepositoryClient     *repository.RepositoryServiceClient                    
    RepoCredsClient      *repocreds.RepoCredsServiceClient                      
    ServerVersion        *semver.Version                                        
    ServerVersionMessage *version.VersionMessage                                                                                                              
}
```

The return statement from the `ConfigureFunc` eventually looks like this:

```go
return ServerInterface{                                                             
    &apiClient,                                                                     
    &applicationClient,                                                             
    &clusterClient,                                                                 
    &projectClient,                                                                 
    &repositoryClient,                                                              
    &repoCredsClient,                                                               
    serverVersion,                                                                  
    serverVersionMessage}, err
```

Let's add a new field to the `ServerInterface` to store the pointer to the provider's `ResourceData` object, which gives access to the provider's parameters:

```go
type ServerInterface struct {                                                       
    ApiClient            *apiclient.Client                                          
    ApplicationClient    *application.ApplicationServiceClient                      
    ClusterClient        *cluster.ClusterServiceClient                              
    ProjectClient        *project.ProjectServiceClient                              
    RepositoryClient     *repository.RepositoryServiceClient                        
    RepoCredsClient      *repocreds.RepoCredsServiceClient                          
    ServerVersion        *semver.Version                                            
    ServerVersionMessage *version.VersionMessage                                    
    ProviderData         *schema.ResourceData                                       
}
```

Now in the `ConfigureFunc`, we'll instantiate the `ServerInterface`, providing only the `ProviderData` pointer. The first resource that needs to use the provider will then instantiate the clients, when the provider parameters are available. We'll need the `ConfigureFunc` method to return a pointer to a `ServerInterface`, so we can later cache the clients and avoid recreating them for every resource:

```go
ConfigureFunc: func(d *schema.ResourceData) (interface{}, error) {                  
    server := ServerInterface{ProviderData: d}                                      
    return &server, nil                                                             
},
```

# Initialize the Clients

Now we need to actually initialize the clients in each resource.

Each resource method gets the interface returned by the `ConfigureFunc` function as an empty interface parameter, usually called `meta`:

```go
func resourceArgoCDProjectCreate(ctx context.Context, d *schema.ResourceData, meta interface{}) diag.Diagnostics {
```

These methods currently simply cast the `meta` parameter as a `ServerInterface` structure and use the pre-initialized clients:

```go
server := meta.(ServerInterface)
```

We now need to cast `meta` as a pointer to a `ServerInterface` structure instead (since we'll need to modify the clients from within the resources), and initialize the clients:

```go
server := meta.(*ServerInterface)                                                   
if err := server.initClients(); err != nil {                                        
    return []diag.Diagnostic{                                                       
        diag.Diagnostic{                                                            
            Severity: diag.Error,                                                   
            Summary:  fmt.Sprintf("Failed to init clients"),                        
            Detail:   err.Error(),                                                  
        },                                                                          
    }                                                                           
}
```

The `initClients()` method of the `ServerInterface` structure will be called, allowing to set up the clients using the current provider parameters.


# Client Pool Caching

In the `ServerInterface#initClients()` method, we want to make sure we reuse existing clients. This is rather simple, since each client is stored as a pointer in the structure, so it defaults to `nil`:

```go
func (p *ServerInterface) initClients() error {                                 
    d := p.ProviderData                                                         
                                                                                
    if p.ApiClient == nil {                                                     
        apiClient, err := initApiClient(d)                                      
        if err != nil {                                                         
            return err                                                          
        }                                                                       
        p.ApiClient = &apiClient                                                
    }

    // etc for all clients

    return nil
}
```


# Conclusion

That's it, we're done. With these modifications, `terraform plan` now works. The resources get applied in the proper order, and the outputs from the `cluster` module get properly passed as configuration to the Argo CD clients.

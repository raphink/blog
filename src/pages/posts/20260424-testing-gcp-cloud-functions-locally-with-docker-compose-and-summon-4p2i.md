---
template: post
title: "Testing GCP Cloud Functions Locally with Docker Compose and Summon"
date: "2026-04-24T09:38:50Z"
excerpt: "Testing GCP Cloud Functions locally can be tricky. This setup uses Docker and Summon to easily run them with cloud secrets."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ftcl6nq9y51kkg0mac08i.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ftcl6nq9y51kkg0mac08i.png"
canonical_url: "https://dev.to/raphink/testing-gcp-cloud-functions-locally-with-docker-compose-and-summon-4p2i"
devto_url: "https://dev.to/raphink/testing-gcp-cloud-functions-locally-with-docker-compose-and-summon-4p2i"
tags: ["security", "devops", "development", "serverless"]
---
I use GCP Cloud Functions quite a bit, but testing them locally can be challenging.


Here's how I do it.

# Package and run with Docker

The first step is to build one container per function. I use Docker for this, with two steps.

## Add an executable entrypoint

My functions are written in Go, so I add a `cmd/main.go` to my codebase to run an HTTP server that calls the function logic:

```go
package main

import (
	"log"
	"os"

	// Blank-import the function package so the init() runs
	_ "yourfunctionpackage"

	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
)

func main() {
	// Use PORT environment variable, or default to 8080.
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}
	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}
```

## Orchestration

I then create a `docker-compose.yaml` file in my project to easily start and stop the stack, and expose the ports on my machine:

```yaml
version: "3"
services:
  myfunction:
    build: .
    ports:
      - "8080:8080"
    environment:
      MY_API_KEY: ${MY_API_KEY}
      DB_PASSWORD: ${DB_PASSWORD}
      GOOGLE_APPLICATION_CREDENTIALS: "/root/.config/gcloud/application_default_credentials.json"
      FUNCTION_TARGET: MyFunction
    volumes:
      - "~/.config/gcloud:/root/.config/gcloud:ro"
```


# Secrets

The next issue is secrets. My functions are configured to take secrets as environment variables so I can pass them from GCP Secret Manager.

But locally? I could be tempted to do one of these:

- Keeping a `.env` file around (and hoping you didn't commit it)
- Hardcoding values in your shell profile
- Commenting out the secret-fetching logic and replacing it manually

But all of these create drift between local and prod, as well as --and mainly-- a risk of leaking secrets.

Fortunately, there's a cleaner way.


## The Pattern

Three tools, working together:

- **GCP Secret Manager** — single source of truth for secret values
- **[Summon](https://cyberark.github.io/summon/)** — injects secrets as env vars at process startup, without writing them to disk
- **Docker Compose** — builds and runs your functions locally

The result: `summon docker compose up` — and your containers get the same secrets they'd get in production, pulled live from Secret Manager.


## What It Looks Like

### The summon GCP plugin

Summon is a pluggable tool. You can provide your own script to map between your secret vault, the keys you want to pass, and the values you want to retrieve.

In our case, the vault is GCP Secret Manager, and I want to retrieve secrets by passing the project name and secret name, so I have a plugin that looks like this:

```bash
#!/bin/bash
# Install this file in /usr/local/lib/summon/gcloud

read -r PROJECT SECRET VERSION <<<$@

gcloud secrets versions access "$VERSION" --project="$PROJECT" --secret="$SECRET"
```

Make this script executable and place it in the Summon library (typically `/usr/local/lib/summon/`), and you're ready for the next step! 



### `secrets.yml`

This is the only file you maintain. It maps environment variable names to GCP secret paths:

```yaml
MY_API_KEY: !var my-project my-api-key latest
DB_PASSWORD: !var my-project db-password latest
```

When called, Summon will read this file and resolve each `!var` entry by calling the configured secret provider we've just configured above.

Couple this with the Docker Compose file we wrote earlier, and all you need to do is:

```shell
summon docker compose up
```

That's it! Summon resolves the secrets, exports them into the environment, and Docker Compose inherits them. No `.env` file, no plaintext values on disk.

# The Deploy Side

In production, your deploy script simply needs to map the same secret names as env vars using the `--set-secrets` flag:

```bash
gcloud functions deploy my-function \
  --set-secrets MY_API_KEY=my-api-key:latest \
  --set-secrets DB_PASSWORD=db-password:latest \
  ...
```

Just make sure the secrets are shared with the compute service account so it's allowed to access them when starting the functions.

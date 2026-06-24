---
template: post
title: "Streamlining Access to Embedded Instruqt Labs"
date: "2024-10-03T11:58:29Z"
excerpt: "Building a Go proxy to simplify access to embedded Instruqt labs"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fzua09vi3wcpzll54airu.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fzua09vi3wcpzll54airu.png"
canonical_url: "https://instruqt.com/blog/guest-post-how-to-build-a-proxy-with-instruqt-go-to-simplify-instruqt-lab-automation"
devto_url: "https://dev.to/raphink/streamlining-access-to-embedded-instruqt-labs-4ph9"
tags: ["instruqt", "labs", "go", "devrel"]
---
How do you teach a very technical topic to prospects and customers? How do you make it a smooth ride?

At Isovalent, we're passionate about making the learning experience as seamless as possible for our users. Isovalent are the creators of Cilium, the _de facto_ cloud networking platform for Kubernetes. While we love networking and security, we appreciate folks might find it a difficult topic. We thought we would make learning Kubernetes networking fun, so we make it a point to gamify the learning experience.
Instruqt provides a great platform to build hands-on labs that can be both technically advanced and engaging for users.

We also believe the user experience should be smooth and the processes fully automated.
Fortunately, a lot can be done by leveraging the [Instruqt graphQL API](https://api-docs.instruqt.com/).
To that purpose, we wrote our own `instruqt-go` library, which we've decided to open source. The library is designed to help developers automate and integrate with the Instruqt platform with ease.

[GitHub — isovalent/instruqt-go](https://github.com/isovalent/instruqt-go)

One of the issues in publishing Instruqt labs is to link user information from Instruqt with that of your own database or CRM.
In this first post, we’ll guide you through building a proxy using `instruqt-go` that:
- collects user identifiers (e.g., HubSpot tokens);
- validates user identity;
- redirects users to a lab with unique access tokens generated via the Instruqt API.

We will then publish the function on Google Cloud Functions.


# Why a Proxy

There are various reasons to collect user information in labs:
- It is useful to be able to generate badges (and [we love badges](https://www.credly.com/organizations/isovalent/badges)) upon completion of the lab (more to come on that in a future post).
- It allows to show users their progress through the labs so they know which ones to take (see for example the [Cilium Labs Map](https://labs-map.isovalent.com/)).


![Cilium Labs Map](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5upiqyiiwbr6i5jv9lg8.png)

# How to Pass User Data

There are several methods to pass user data to Instruqt tracks.

## Custom Parameters

Instruqt [custom parameters](https://docs.instruqt.com/tracks/share/embed-a-track#custom-url-parameters) are very useful to pass any kind of information when starting a track. These fields are simply added to the URL as query parameters, prefixed with `icp_`. These parameters can also be retrieved in Instruqt webhooks as well as through the Instruqt GraphQL API, making them practical to use.

Until recently, Instruqt encouraged track developers to pass user information (such as name, email, or token) using custom parameters.

However, there are a few downsides to using custom parameters:
1. They are not standardized, and Instruqt doesn't interpret them. This means user sessions will show as anonymous in Instruqt reports (and the unique user count might be wrong).
2. They are not encrypted by default. You can of course encrypt them for your own keys, but Instruqt will show you the encrypted value in play reports.
3. I have seen on multiple occasions custom parameters being lost when users restart a lab. I actually started my own cache database to counter this issue.


## Invites

Instruqt invites allow to create a list of tracks and generate an invitation link that can be shared with users for easy access. Invites can be set to collect user data via a form.

This user data is then added to the user's details on Instruqt (user details are attached to user accounts, but are unique per Instruqt team).

This is extremely practical for workshops, but there's again a few limitations:
1. Using an invite to access all labs means that invite must contain all published labs.
2. Invites have their own landing page, so it wouldn't work with our [Cilium Labs map](https://labs-map.isovalent.com/) or other kiosk approaches.

Note: Instruqt recently introduced landing pages, which is a form of invites with a way to tune the landing page, with the same advantages and limitations.


## Third Party Forms

Recently, Instruqt added another way to pass user information, which combines the benefits of both previous methods.

The [encrypted PII method](https://docs.instruqt.com/tracks/share/embed-a-track#add-user-details-or-gate-access-with-a-third-party-form) allows to pass a `pii_tpg` query parameter to an embed URL. This means:
1. The data is encrypted, using a public key provided by Instruqt, so URLs don't contain readable user information.
2. Instruqt understands the `pii_tpg` data and has the private key to decrypt it. The information is used to fill in the user's details, just as if they had acceted an invite.
3. This is not linked to invites, so it can be used with any track.

We're going to use this new method in this example, as it is the most versatile today to pass information to Instruqt in a safe and reliable manner.


# A Note on Embed Tokens

When you visit a track page on Instruqt, there is an option to embed the track.
This gives you a URL which contains a token unique to the track.

While it is perfectly valid to use that URL, it also means that whoever has access to this token can start the track whenever they want.

Instruqt has recently added an API call to generate one-time tokens for tracks, such that URLs using such tokens can only be used once.

The proxy we're coding will use one-time tokens, since we have access to the API and can easily generate them.


# Creating the Proxy

## Initial Steps

First, create a directory for your function:

```shell
mkdir instruqt-proxy
```

Move to this directory and initialize the Go environment:

```shell
# Replace example.com with the prefix of your choice
go mod init example.com/labs
```


## Google Cloud Function Harnessing

For local testing, create a `cmd` directory:

```shell
mkdir cmd
```

Create a `main.go` file in that directory, with the following content:

```go
package main

import (
	"log"
	"os"

	// Blank-import the function package so the init() runs
  // Adapt if you replaced example.com earlier
	_ "example.com/labs"

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

## Creating the Function


Back to the `instruqt-proxy` directory, create a `proxy.go` file and start by adding the `init()` function to it, along with the Go packages we will be using:

```go
package labs

import (
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"

	"github.com/isovalent/instruqt-go/instruqt"
)

func init() {
	functions.HTTP("InstruqtProxy", instruqtProxy)
}
```

This will allow Google Cloud Functions to call the `instruqtProxy` function when it is initialized.

Let's write that function:

```go
const (
	// Replace team name with yours
	instruqtTeam = "isovalent"
)

func instruqtProxy(w http.ResponseWriter, r *http.Request) {
	instruqtToken := os.Getenv("INSTRUQT_TOKEN")

	if instruqtToken == "" {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	instruqtClient := instruqt.NewClient(instruqtToken, instruqtTeam)

	// Get user from passed token
	utk := r.URL.Query().Get("utk")
	if utk == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	user, err := getUser(utk)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	labSlug := r.URL.Query().Get("slug")

	url, err := getLabURL(instruqtClient, user, labSlug)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	http.Redirect(w, r, url, http.StatusFound)
}
```

In this function, we:
1. get the Instruqt token from the `INSTRUQT_TOKEN` environment variable
2. initialize the Instruqt API client for the token and team
3. retrieve a `utk` parameter from the URL parameters in order to authenticate the user
4. get user information based on that UTK
5. get the lab slug from the URL parameters
6. retrieve the lab URL for the redirection
7. redirect the user using an `http.Redirect` function


## Implement getLabURL()

The `getLabURL` function will generate the redirect URL for the lab based on user information, the requested lab slug, and dynamic information from the Instruqt API.

Let's write it:

```go

const (
	// Replace with your sign-up page format
	labSignupPage = "https://isovalent.com/labs/%s"

	// Adapt to your values
	finishBtnText = "Try your next Lab!"
	finishBtnURL  = "https://labs-map.isovalent.com/map?lab=%s&showInfo=true"
)

func getLabURL(instruqtClient *instruqt.Client, u user, slug string) (string, error) {
	track, err := instruqtClient.GetTrackBySlug(slug)
	if err != nil {
		return "", err
	}

	// Unknown user
	if u.Email == "" {
		url := fmt.Sprintf(labSignupPage, slug)
		return url, nil
	}

	// Get one-time token
	token, err := instruqtClient.GenerateOneTimePlayToken(track.Id)
	if err != nil {
		return "", err
	}

	labURL, err := url.Parse(fmt.Sprintf("https://play.instruqt.com/embed/%s/tracks/%s", instruqtTeam, track.Slug))
	if err != nil {
		return "", err
	}

	// Prepare the fields to encrypt
	encryptedPII, err := instruqtClient.EncryptUserPII(u.FirstName, u.LastName, u.Email)
	if err != nil {
		return "", err
	}

	// Add params
	params := map[string]string{
		"token":             token,
		"pii_tpg":           encryptedPII,
		"show_challenges":   "true",
		"finish_btn_target": "_blank",
		"finish_btn_text":   finishBtnText,
		"finish_btn_url":    fmt.Sprintf(finishBtnURL, track.Slug),
	}

	q := labURL.Query()
	for key, value := range params {
		q.Set(key, value)
	}

	// Encode the parameters
	labURL.RawQuery = q.Encode()

	return labURL.String(), nil
}
```

First, note that we have defined some new constants that you can tune:

- `labSignupPage` is the URL on your website where unauthenticated users will be redirected. It contains a variable for the lab slug.
- `finishBtnText` is the text shown on the finish button of the lab.
- `finishBtnURL` is the action of the button at the end of the lab. It also contains a variable for the lab slug.


Now let's explain the `getLabURL()` function steps:

1. Retrieve track information from the Instruqt API, error if it cannot be found.
2. If the user is unknown, redirect to sign-up page.
3. Generate a one-time token for the embedded track access.
4. Generate the redirect URL.
5. Encrypt user information using the PII key from the Instruqt API.
6. Add all parameters (one-time token, encrypted user information, finish button options) to the redirect URL.
7. Encode the URL.
8. Return the resulting URL.


## The `getUser()` Function


The last piece missing in this proxy is the `getUser()` function. I can't help you much here, since this part is where you plug your own logic. You might be using a CRM like Hubspot to [retrieve contact information from the UTK](https://legacydocs.hubspot.com/docs/methods/contacts/get_contact_by_utk), or another database, it's up to you!

The code I'll show you here simply returns a sample user:


```go
/*
 * This is where you add the logic to get user information from your CRM/database.
 */
type user struct {
	FirstName string
	LastName  string
	Email     string
}

func getUser(utk string) (u user, err error) {
	// Implement the logic to get your user information from UTK

	u = user{
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john@doe.com",
	}

	return u, err
}
```


# Testing the code

Now that we have our whole `proxy.go` function, let's test it!

First, update your `go.mod` and `go.sum` files with:

```shell
go get ./...
go mod tidy
```

In your Instruqt dashboard, go to "API keys" and get the value of your API key. Export it as a variable in your shell:

```shell
export INSTRUQT_TOKEN=<your_instruqt_token>
```


Next, launch the function on your local machine:

```shell
FUNCTION_TARGET=InstruqtProxy go run ./cmd/main.go
```

Finally, in another terminal, make test requests to `localhost:8080` where your function will be running (you can pass a `PORT` environment variable above to change the port if necessary):

```shell
curl  -i "localhost:8080/?slug=cilium-getting-started&utk=someUtkValue"
```

Adapt to use a track slug that exists in your Instruqt organization. If the track exists, you should get a `302` response with the redirect URL containing a one-time token for access, as well as John Doe's information encrypted with the PII key, and a one-time token (starting with `ott_`)!


# Alternative testing: using Docker

If you'd like to use Docker to test your function locally, you can create a `Dockerfile` in your current directory:

```dockerfile
FROM golang:1.23

WORKDIR /app

COPY . .

RUN go build -o myapp ./cmd/main.go

ENV DEV=true
ENV PORT=8080

EXPOSE $PORT

CMD ["./myapp"]
```


Add a `docker-compose.yaml` file:

```yaml
version: '3'
services:
  proxy:
    build: ./
    ports:
      - "8080:8080"
    environment:
      INSTRUQT_TOKEN: ${INSTRUQT_TOKEN}
      FUNCTION_TARGET: InstruqtProxy
```

Finally, build and launch your container:

```shell
docker-compose up --build
```

And you can send requests to `localhost:8080` just the same as before!


# Hosting the Proxy on Google Cloud Functions

In order to deploy to Google Cloud, first make sure you are logged in to your Google Cloud project:

```shell
gcloud auth application-default login
```


## Create a Secret for the API Token

Next, let's create a new secret for the Instruqt token:

```shell
echo -n "$INSTRUQT_TOKEN" | gcloud secrets create instruqt-token --data-file=-
```

In order to adjust the permissions on this secret, you will need to get your project ID:

```shell
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
```

Then, add the "Secret Manager Secret Accessor" role for the default Compute Engine service account for the project:

```shell
gcloud secrets add-iam-policy-binding instruqt-token \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

Your secret is now ready to be used by the function!


## Deploy the Function

You can then deploy the function (adapt the region if needed):

```shell
gcloud functions deploy "instruqt-proxy" \
  --gen2 --runtime=go122 --region=europe-west1 --source=. \
  --entry-point="InstruqtProxy" --trigger-http --allow-unauthenticated \
  --set-secrets="INSTRUQT_TOKEN=instruqt-token:latest"
```

This will upload and build your project, and return the URL to access the function.

This URL will look something like `https://europe-west1-<project>.cloudfunctions.net/instruqt-proxy`.
You can then test the function using that URL instead of `localhost:8080`!


# Further Considerations

This is a simplified approach to the lab proxy we use at Isovalent. There are things you might want to consider with this implementation:

- If you have actual user (instead of marketing contact), switch to a proper authentication system (e.g. JWT) instead of UTK.
- The current implementation will give access to any lab in your collection if you know its slug. You might want to filter them out (using for example track tags).
- This implementation manages errors but is very basic in logging. We would recommend using Google Cloud logging to easily audit function runs.
- You might want to pass extra information as [custom parameters](https://docs.instruqt.com/tracks/share/embed-a-track#custom-url-parameters). For example, we like to pass some form of event or campaign ID. These can then be retrieved via the API as part or the Track structure.
- If you're using a custom form and redirecting to the proxy, you might want to be sure your CRM/database has already gotten the user information. You can for example implement a retry logic in the proxy function.
- Invite embed URLs contain the invite ID. If you want to support invites, the proxy could take an optional `invite` parameter and add it to the URL.

# Using the Proxy

This proxy can typically be used to give access to authenticated users in a safe way, while preserving user information in Instruqt reports and making sure embed URLs are not reusable.

Here is an example of usage of this proxy:

1. Set up lab sign-up pages with the form system of your choice (e.g. using Hubspot forms).
2. Retrieve a user identifier from the page context (e.g. a [Hubspot cookie token](https://knowledge.hubspot.com/privacy-and-consent/what-cookies-does-hubspot-set-in-a-visitor-s-browser)).
3. Redirect users to the proxy, passing the user identifier and lab slug as parameters.

This can allow you to build a series of public sign-up pages for your labs, similar to what we have built on [the Isovalent website](https://isovalent.com/labs/). It can also be used to build a [Kiosk interface](https://www.youtube.com/watch?v=QEh16xu1xvc&t=3s), or even a more creative landing page such as the [Cilium Labs map](https://labs-map.isovalent.com/), where clicks on the map redirect to the lab proxy.

By making a complex networking technology like Cilium fun with our labs, we have made it the experience for users less intimidating and more approachable. Using our proxy can help you provide a similar user experience to your prospects. Please get in touch if you have any questions.

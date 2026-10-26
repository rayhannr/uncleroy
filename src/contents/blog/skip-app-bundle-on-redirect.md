---
title: Redirect Without Downloading the Whole App
image: ./images/skip-app-bundle-on-redirect.webp
imageCaption: An image with the text "redirect without downloading the whole app"
imageCredit: Ivan Aleksic
imageLink: https://unsplash.com/photos/black-and-white-street-sign-318xrIWYwoQ
description: Because a redirect only needs a small piece of logic
metaDescription: Every redirect in this multi-tenant React app forced a 1MB re-download. Moving redirect logic out of the app with dynamic import cut it to one.
publishedAt: 2026-08-09T15:38:00Z
status: published
---

<strong>TL;DR:</strong> If you know a path in your app will send the user to another domain (a separate app, or the same app on another subdomain), redirect immediately. Don't wait for the app bundle to load, especially when it's big. Run the redirect logic at the top of the entry file, before the app or its router (like React Router) is even set up, and load the app with a dynamic `import()` only when there's nothing to redirect.

One of my favorite things to do at work between tasks is digging into performance issues. This one came from a multi-tenant React app I maintain, where multiple customers share the same environment and infrastructure, but each gets their own subdomain.

The domain is something like example.com. Customers log in there, then get redirected to a subdomain tied to their customer ID. The ID is derived from the name they fill in during registration, not a UUID. So if someone registers as "Fantastic Baby", their ID becomes `fantasticbaby` and they end up at `fantasticbaby.example.com`.

The entry file of the app looks roughly like this:

```js
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <SomeProvider>
    <AnotherProvider>
      <MainLayout>
        <ErrorBoundary>
          <Routes>
            {/* some routes that don't need session */}
            <SessionManager>
              {/* some routes that need a valid session */}
            </SessionManager>
          </Routes>
        </ErrorBoundary>
      </MainLayout>
    </AnotherProvider>
  </SomeProvider>
)
```

Inside `SessionManager`, a few things happen before the main content renders. It fetches the current user data to get their customer ID, then branches depending on the current URL:

- No subdomain in the URL: redirect to the subdomain tied to the customer ID.
- Subdomain present but the fetch errors with a `subdomain mismatch` message: the correct customer ID can't be resolved, so it redirects back to no subdomain and starts over.
- Subdomain present and matches: the app finally renders its content.

There's one more redirect and it goes to a different app. Login is handled by a separate app under `/auth`, and we use [PKCE](https://oauth.net/2/pkce/). That means the login can't finish unless this app stored a code verifier and a state before sending the user over. So a few paths here, like `/register`, exist only to start that flow. 

On those paths, the app generates a code verifier and a state, saves them to local storage, then redirects to the login app with `client_id`, `redirect_uri`, `state`, `code_challenge` and `code_challenge_method` as query params.

`client_id` tells the login app which app is asking, and `redirect_uri` is where it sends the user back after login. Once the user is back, the app uses the stored verifier to exchange the code for a token.

## The problem

The initial JS bundle is over 1MB, containing the core logic and all the upfront dependencies. That's a problem in itself, but it becomes particularly painful here because of how the redirections work.

Each time the browser lands on a new subdomain (or the base domain), it has to download that file again. I wrote about the cache mechanism we have in [another post](/blog/nginx-cache-control-react-performance), but the cache isn't shared across subdomains, so it doesn't help here.

On a normal login, the user starts at no subdomain and gets redirected once. That's two downloads of the same 1MB file. If the subdomain mismatch path triggers, they get redirected twice, which means three downloads. All before the app even renders.

## The solution

The redirect logic doesn't need to live inside `SessionManager` and it doesn't belong in the router either. A redirect set up in React Router, whether it's a `<Navigate>` element or a loader, only runs after the router has mounted, and the router ships inside the bundle. By then the user has already downloaded the very thing we wanted to skip.

The redirect has to run before the app exists at all, so I moved it to the top of the entry file.

```js
// main.ts
const didRedirect = await resolveRedirection()
if (!didRedirect) {
  const { mountApp } = await import('./mountApp')
  mountApp()
}
```

```js
// mountApp.ts
export function mountApp() {
  createRoot(document.getElementById('root')).render(
    /* same providers and routes as the entry file above */
  )
}
```

And `resolveRedirection` is plain logic with no dependency on the app. Roughly:

```js
// resolveRedirection.ts
const AUTH_BASE_URL = 'https://example.com/auth'

// paths in this app that only exist to send the user to the login app
const AUTH_REDIRECTS = {
  '/register': '/register',
  // ...
}

export async function resolveRedirection() {
  const authPath = AUTH_REDIRECTS[location.pathname]
  if (authPath) {
    const codeVerifier = generateCodeVerifier()
    const state = generateState()
    localStorage.setItem('code_verifier', codeVerifier)
    localStorage.setItem('state', state)

    const params = new URLSearchParams({
      client_id: 'dummy-client-id',
      redirect_uri: 'https://example.com/callback',
      state,
      code_challenge: await createCodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
    })
    location.replace(`${AUTH_BASE_URL}${authPath}?${params}`)
    return true
  }

  const subdomain = getSubdomain(location.hostname)

  try {
    const { customerId } = await fetchCurrentUser()
    if (!subdomain) {
      location.replace(`https://${customerId}.example.com${location.pathname}${location.search}`)
      return true
    }
  } catch (error) {
    // the correct customer ID can't be resolved from here, so start over from the base domain
    if (subdomain && error.message === 'subdomain mismatch') {
      location.replace(`https://example.com${location.pathname}${location.search}`)
      return true
    }
    // any other error is left for the app to handle once it mounts
  }

  return false
}
```

The `AUTH_REDIRECTS` branch handles the PKCE paths from earlier. Doing it here means they don't need a route in React Router, and the redirect still happens before the bundle loads. 

Everything `resolveRedirection` calls, like the PKCE helpers, `getSubdomain` and `fetchCurrentUser`, needs to stay small. If any of them imports something heavy, the entry file pulls it in and the dynamic import stops helping.

The key part is `await import('./mountApp')`. That's a dynamic import, and it defers loading the file until the condition is met. If I'd used a normal import at the top of the entry file, the bundle would still be pulled in upfront regardless of whether a redirect was about to happen, which would defeat the whole point.

Now `resolveRedirection` runs first. If it redirects, the browser navigates away before `mountApp` ever loads. No 1MB download until the user is actually on the right subdomain and the app needs to render.

The impact isn't that noticeable on a fast connection, since 1MB is nothing on a good connection. But we have customers all over the world, and slow 4G or worse isn't rare in some of those places. For them it's a different story. 

Before this change, getting a user from login to the correct subdomain with the app loaded could take more than 10 seconds. After, it's 3–5 seconds.
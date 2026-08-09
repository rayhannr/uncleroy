---
title: Avoid duplicate bundle downloads on redirect with dynamic import
image: ./images/dynamic-import-avoid-bundle-redownload-on-redirect.webp
imageCaption: An image with the text "avoid duplicate bundle downloads on redirect with dynamic import"
imageCredit: Julia Taubitz
imageLink: https://unsplash.com/photos/white-line-with-text-on-dark-floor--U8W2c6idHo
description: Redirects don't need the whole app loaded first
metaDescription: Every redirect in this multi-tenant React app forced a 1MB re-download. Moving redirect logic out of the app with dynamic import cut it to one.
publishedAt: 2026-08-09T15:38:00Z
status: published
---

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

## The problem

The initial JS bundle is over 1MB, containing the core logic and all the upfront dependencies. That's a problem in itself, but it becomes particularly painful here because of how the redirections work.

Each time the browser lands on a new subdomain (or the base domain), it has to download that file again. I wrote about the cache mechanism we have in [another post](/blog/nginx-cache-control-react-performance), but the cache isn't shared across subdomains, so it doesn't help here.

On a normal login, the user starts at no subdomain and gets redirected once. That's two downloads of the same 1MB file. If the subdomain mismatch path triggers, they get redirected twice, which means three downloads. All before the app even renders.

## The solution

The redirect logic doesn't need to live inside `SessionManager`. More importantly, it doesn't need the entire app to be loaded before it runs. So I moved it out.

```js
// entry file
const didRedirect = resolveRedirection()
if (!didRedirect) {
  const { mountApp } = await import('./mountApp')
  mountApp()
}
```

```js
// mountApp.ts
createRoot(/* same as before */)
```

The key part is `await import('./mountApp')`. That's a dynamic import, and it defers loading the file until the condition is met. If I'd used a normal import at the top of the entry file, the bundle would still be pulled in upfront regardless of whether a redirect was about to happen, which would defeat the whole point.

Now `resolveRedirection` runs first. If it redirects, the browser navigates away before `mountApp` ever loads. No 1MB download until the user is actually on the right subdomain and the app needs to render.

The impact isn't that noticeable on a fast connection, since 1MB is nothing on a good connection. But on slow 4G or worse, which isn't rare in developing countries, it's a different story. Before this change, getting a user from login to the correct subdomain with the app loaded could take more than 10 seconds. After, it's 3–5 seconds.

If the company ever seriously targets customers beyond countries with solid internet infrastructure, that gap matters even more.

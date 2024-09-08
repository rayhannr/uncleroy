---
title: Cache Control for React App Using Nginx
image: /images/blog/cache-control-for-react-app-using-nginx.webp
imageCaption: An image with the text "cache control for react app using nginx"
imageCredit: Rahul Mishra
imageLink: https://unsplash.com/photos/a-computer-screen-with-a-program-running-on-it-JpF58ANavoc
description: Speed up your React app's reload time with cache control
publishedAt: 2024-09-08T15:12:01.841Z
status: published
layout: ../../layouts/Blog.astro
---

At the time of writing this blog, I’m maintaining a React app with a hefty initial bundle size of 1.5 MB. The `` `.nginx.conf` `` file initially looked like this

```nginx
location / {
  add_header Cache-Control "no-store";
  try_files $uri $uri/ /index.html
}
```

which added `` `Cache-Control: no-store` `` to the response header, preventing the browser from caching any assets. The intention behind this was to ensure users always received the latest content after new updates were deployed.

However, this approach led to inefficient use of bandwidth and increased load times, as users were forced to re-download all assets on every reload, even when no changes had been made.

## Solution

It was straightforward. I just updated the `` `.nginx.conf` `` to look like this

```nginx

location /index.html {
  add_header Cache-Control "no-store";
}

location / {
  try_files $uri $uri/ /index.html
}
```

<br />

- The location block for `/index.html` has a `Cache-Control` header set to prevent caching. `no-store` ensures the file is always fetched from the server.
- The `try_files $uri $uri/ /index.html;` directive is used to handle client-side routing in the React application. It ensures that non-matching routes fallback to index.html, which is necessary for single-page applications (SPAs).
- Static assets are typically cached by default without any custom `Cache-Control` headers. However, to implement more tailored Cache-Control directives for assets like JS, CSS, images, and fonts, we can do it as follows

<br />

```nginx
# cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$ {
  add_header Cache-Control "public, max-age=31536000";
}
```

## Explanation

### How a React app works with static assets

- `index.html`: This is the entry point of our React app. When a user visits our site, the browser loads this HTML file, which contains references to the JavaScript, CSS, and other static assets needed to run the app.
- <b>Static assets</b> (e.g., `.js`, `.css`, images): These are typically generated with unique filenames that include hashes (e.g., main.abc123.js). The hashes change whenever the content of these files changes.

### Cache static assets aggressively

- Since the filenames of static assets (like JavaScript and CSS) change with each deployment due to hash-based versioning, it's safe to cache them aggressively (e.g., for a year). Once a browser downloads an asset, it won’t download it again unless the filename changes, which only happens when there’s a new deployment.
- Caching static assets ensures that users don’t have to re-download these large files every time they visit the site, significantly improving load times and reducing server load.

### Ensure `index.html` is not cached

- The `index.html` file references the most recent versions of the static assets (JavaScript, CSS). If this file is cached too long, users might load an outdated version that points to old assets (from a previous deployment).
- When the browser fetches `index.html` and it is not cached (or only cached briefly), it always loads the most recent version. This ensures that the latest filenames for assets (e.g., `main.abc456.js` after a new deployment) are served to the user.

### The strategy in practice

- <b>Cache `index.html` with no-store or a short max-age</b>: This ensures the browser always checks with the server for the latest `index.html`. By doing this, users will always get the updated references to the latest version of your static files after a new deployment.
- <b>Cache static assets (`.js`, `.css`, etc.) aggressively</b>: These assets can be cached for a long time (e.g., 1 year) because their filenames will change whenever there is a new deployment.

## Summary

By not caching `index.html` (or caching it with a very short expiry), you ensure that users always get the latest references to your static assets after a new deployment. At the same time, you can cache static assets (like JavaScript and CSS files) aggressively because they are versioned with a hash.

This approach provides the best balance between performance (fewer asset downloads) and ensuring that users always get the latest content after an update.

---
title: Nginx Cache-Control Guide for High-Performance React Apps
image: ./images/nginx-cache-control-react-performance.webp
imageCaption: An image with the text "nginx cache-control guide for high-performance react apps"
imageCredit: Rahul Mishra
imageLink: https://unsplash.com/photos/a-computer-screen-with-a-program-running-on-it-JpF58ANavoc
description: Configure Nginx Cache-Control for faster React apps and up-to-date content after each deploy
metaDescription: Learn how to configure Cache-Control headers in Nginx to boost React app performance, reduce load times, and ensure users always receive the latest content after each deployment
publishedAt: 2024-09-08T15:12:01.841Z
status: published
---

When maintaining a React application, one of the biggest challenges is managing large initial bundle sizes. In my case, the React app had an initial bundle size of 1.5 MB. Initially, the `.nginx.conf` file looked like this:

```nginx
location / {
  add_header Cache-Control "no-store";
  try_files $uri $uri/ /index.html
}
```

This configuration added the `Cache-Control: no-store` header to all responses, preventing the browser from caching any assets. The goal was to ensure that users always received the latest content after a new deployment.

However, this approach led to several performance issues: users had to re-download all assets with every page reload, even if no changes had been made to the assets. This resulted in inefficient bandwidth usage and slower load times.

## Solution

The solution was straightforward. I simply updated the `.nginx.conf` file to:

```nginx

location /index.html {
  add_header Cache-Control "no-store";
}

location / {
  try_files $uri $uri/ /index.html
}
```

### Key Changes

- <strong>Cache Control for `index.html`:</strong> The new configuration prevents `index.html` from being cached with a `Cache-Control: no-store` header, ensuring that the latest version of `index.html` is always fetched from the server.

- <strong>Handling Client-Side Routing:</strong> The `try_files` directive ensures proper handling of React's client-side routing. If a route doesn't match any files, it falls back to `index.html`, which is crucial for Single Page Applications (SPAs).

- <strong>Static Asset Caching</strong>: Static assets like JavaScript, CSS, and image files can be cached aggressively. To implement this, I added the following block to the configuration:

```nginx
# cache for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$ {
  add_header Cache-Control "public, max-age=31536000";
}
```

## Understanding React App Caching

### How React Apps Handle Static Assets

- `index.html`: This file is the entry point for the React app. The browser loads it, and it contains references to JavaScript, CSS, and other assets necessary for the app.
- <strong>Static assets</strong> (e.g., JavaScript, CSS, images): These assets are typically versioned with unique filenames, incorporating hashes (e.g., `main.abc123.js`). The hash changes whenever the content of these files is updated.

### Why Cache Static Assets Aggressively?

- Static assets are versioned using hash-based filenames, meaning their names change whenever their content changes. This makes it safe to cache them for extended periods, such as one year. Once a browser downloads these assets, it won't need to download them again until the filename changes.
- Aggressive caching of static assets greatly improves load times and reduces server load since the browser doesn't need to download the same files on every visit.

### Why Prevent Caching of `index.html`?

- `index.html` contains references to the latest versions of static assets. If `index.html` is cached for too long, users may be served an outdated version of this file, causing them to load incorrect or outdated assets.
- By ensuring that `index.html` is not cached, the browser always fetches the latest version of this file. This guarantees that users always get the most recent version of static assets with each deployment.

### The Cache Strategy in Action

- <strong>Cache `index.html` with no-store or short expiry:</strong> This ensures that the browser always checks the server for the latest version of `index.html`, which in turn ensures users get the most up-to-date references to static assets.
- <strong>Cache Static Assets Aggressively:</strong> Files like JavaScript and CSS can be cached for long periods (e.g., one year) because their filenames change with each deployment, ensuring the browser always retrieves the updated versions when needed.

## Conclusion

By preventing long-term caching of `index.html` and aggressively caching static assets like JavaScript and CSS, you ensure users always receive the latest app version without sacrificing performance. This approach improves load times, minimizes bandwidth usage, and reliably delivers updated content after each deployment.

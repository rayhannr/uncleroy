---
title: Install NPM dependencies from multiple registries
image: ./images/install-npm-multiple-registries.webp
imageCaption: An image with the text "install npm dependencies from multiple registries"
imageCredit: Paul Esch-Laurent
imageLink: https://unsplash.com/photos/orange-pink-keyboard-oZMUrWFHOB4
description: Configure .npmrc to load npm packages from both private and public registries
publishedAt: 2024-07-28T14:55:39.942Z
status: published
---

<strong>TL;DR:</strong> To use a private `npm` registry in your project, add the following lines to your `.npmrc` file:

```ini
@{scope}:registry={your_private_registry}
//{your_private_registry}/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

By default, `npm install` pulls all dependencies listed in your `package.json` from the [public npm registry](https://registry.npmjs.org/). However, many enterprise or internal projects rely on packages hosted in private `npm` registries.

You can configure `npm` to install public packages from the default registry and private packages from your own private registry by scoping them and updating your `.npmrc` accordingly.

## Example

If your `package.json` includes:

```json
"dependencies": {
  "@rayhannr/validator": "3.1.0",
  "react": "18.3.1"
}
```

And your `.npmrc` looks like this:

```ini
@rayhannr:registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

Then:

- `react` will be downloaded from the public `npm` registry
- `@rayhannr/validator` will come from `@rayhannr` private registry

## When Your Private Packages Aren't Scoped

If your private package names aren't prefixed with a scope (e.g., `@rayhannr`), update your `.npmrc` to:

```ini
registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

This setup tells `npm` to fetch all packages from your private registry. Make sure your private registry is set up to proxy the public `npm` registry. Otherwise, public packages like `react` won't be accessible.

<strong>Note:</strong> Accessing a private registry requires authentication. You'll need an access token and must include it in your `.npmrc`. If you're using Sonatype Nexus Repository Manager as your private npm registry, the authentication token is a Base64-encoded string of your Nexus username and password in the `username:password` format.

For example, if your username is `admin` and your password is `admin123`, your token would be:

```bash
echo -n "admin:admin123" | base64
```

Which outputs:

```bash
YWRtaW46YWRtaW4xMjM=
```

---
title: Install NPM Dependencies from Multiple Registries
image: ./images/install-npm-multiple-registries.webp
imageCaption: An image with the text "install npm dependencies from multiple registries"
imageCredit: Paul Esch-Laurent
imageLink: https://unsplash.com/photos/orange-pink-keyboard-oZMUrWFHOB4
description: Configure .npmrc to load npm packages from both private and public registries
metaDescription: Set up .npmrc to install packages from a private npm registry and the public registry at the same time. Covers scoped packages, unscoped fallback, and auth tokens.
publishedAt: 2024-07-28T14:55:39.942Z
status: published
---

At work I deal with an internal npm registry for shared packages. Getting those to install alongside public packages like `react` wasn't immediately obvious, since `npm` doesn't just figure it out on its own. Here's how to configure it properly using `.npmrc`.

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

## When your private packages aren't scoped

If your private package names aren't prefixed with a scope (e.g., `@rayhannr`), update your `.npmrc` to:

```ini
registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

This tells `npm` to fetch all packages from your private registry. For public packages like `react` to still resolve, your private registry needs to be configured to proxy requests it can't fulfill to `registry.npmjs.org`. If it isn't set up that way, `npm install` will fail for anything not hosted on your registry.

## Auth tokens

Private registries require an access token in your `.npmrc` to authenticate.

If you're using Sonatype Nexus Repository Manager, the token format is slightly different: it expects a Base64-encoded string of `username:password`:

```bash
echo -n "admin:admin123" | base64
```

Which outputs:

```bash
YWRtaW46YWRtaW4xMjM=
```

## A few things worth noting

**Don't commit real tokens.** It's common to check `.npmrc` into version control so the registry URL is shared across the team, but the auth token should never be in there as a literal value. Use an environment variable reference instead:

```ini
@rayhannr:registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken=${NPM_TOKEN}
```

Each developer sets `NPM_TOKEN` locally, and in CI it gets injected as a secret.

**In GitHub Actions**, you can pass it in via your workflow:

```yaml
- name: Install dependencies
  run: npm install
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`npm` will substitute `${NPM_TOKEN}` from the environment when it reads your `.npmrc`.

**If you get a 401**, the token is either wrong or expired. Double-check the value and that it has read access to the registry. For Nexus, also make sure the token is re-encoded if the password changed.

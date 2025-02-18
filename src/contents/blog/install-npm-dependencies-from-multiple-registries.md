---
title: Install NPM dependencies from multiple registries
image: ./images/install-npm-dependencies-from-multiple-registries.webp
imageCaption: An image with the text "install npm dependencies from multiple registries"
imageCredit: Paul Esch-Laurent
imageLink: https://unsplash.com/photos/orange-pink-keyboard-oZMUrWFHOB4
description: You may need this when you're working on Javascript project that requires installing dependencies from a private registry
publishedAt: 2024-07-28T14:55:39.942Z
status: published
---

<strong>TL;DR:</strong> Add this line to your `.npmrc` file

```make
@{scope}:registry={your_private_registry}
//{your_private_registry}/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

By default, `npm install` loads all dependencies defined in `package.json` from the [npm package registry](https://registry.npmjs.org/). However, you may encounter projects that depend on packages published to a private registry.

You can configure `npm install` to load public dependencies from the npm package registry and private dependencies from a private registry in a single project by following the step mentioned in the TL;DR above.

Let's say your `package.json` looks like this:

```json
"dependencies": {
  "@rayhannr/validator": "3.1.0",
  "react": "18.3.1"
}
```

and your `.npmrc` is as follows:

```make
@rayhannr:registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

`npm install` will download `react` from the public npm registry and `@rayhannr/validator` from rayhannr private registry.

If the private dependencies' names do not start with `@{scope}`, you may need to update the `.npmrc` file as follows:

```make
registry=https://registry.rayhannr.org
//registry.rayhannr.org/:_authToken={YOUR_AUTH_TOKEN_HERE}
```

This configuration instructs `npm install` to load all dependencies from the private registry. Ensure that the private registry you're pointing to acts as a proxy to the public npm registry, allowing you to download both public and private dependencies.

<strong>Note:</strong> It needs authorization to load dependencies from the private registry. Make sure to have an access token and pass it to your `.npmrc` file, replacing `{YOUR_AUTH_TOKEN_HERE}`. I won't explain the authorization process in this blog.

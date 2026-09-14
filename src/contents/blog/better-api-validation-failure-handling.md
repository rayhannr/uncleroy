---
title: A Feature Flag for Controlling API Validation in Production
image: ./images/better-api-validation-failure-handling.webp
imageCaption: An image with the text "a feature flag for controlling api validation in production"
imageCredit: Nong
imageLink: https://unsplash.com/photos/a-close-up-of-a-computer-screen-with-a-sign-on-it-O_Xy25Dj7Mo
description: One feature flag saved our team from production errors and midnight wake-ups
metaDescription: A simple feature flag to soft-disable API validation in production, unblock clients from Zod errors instantly, and avoid overnight wake-ups over trivial contract mismatches.
publishedAt: 2025-12-10T14:42:30.714Z
status: published
---

API response validation sounds straightforward until it breaks in production at 3 AM. A simple feature flag is how my team stopped losing sleep over it.

## Building our frontend and the need for validation

In our frontend application, almost every API request targets our own internal backend services, so strong runtime validation has always been essential. We originally relied on [io-ts](https://gcanti.github.io/io-ts/) with manually written schemas derived from the backend’s Swagger docs, but that approach became increasingly hard to maintain.

As the system grew, we introduced a new workflow that combined [Zod](https://zod.dev/) with a custom code generation tool. Instead of hand-maintaining io-ts schemas, the generator produced Zod schemas, data models, and API call functions all at once. 

Moving to Zod and adopting codegen happened together. The schemas were cleaner, easier to keep in sync, and we stopped hand-maintaining io-ts types. That mostly held up.

## When strict validation becomes a real problem

Zod is great, but strict validation has a dark side. Whenever the backend returned something that did not match the contract, the validation failed and the UI showed an error state. We called these incidents Zod errors.

Sometimes this was correct. Incorrect data can cause UI crashes or break interaction flows. But other times the issue was trivial. For example, one API contract defined `id`, `email`, and `updatedAt` as required strings. If the backend returned `updatedAt` as `null` for some edge case, the entire response was treated as invalid even though the UI only needed `id` and `email`.

In development, this was easy to deal with. Fix it, open a PR, merge, move on. Production was a different situation entirely.

## A midnight incident that should not have been an incident

One of our clients is in a different timezone. While it was daytime for them in North America, it was night time for me in Indonesia. They encountered a Zod error because the UI refused to render data due to a single field being slightly off contract.

LiveOps team on shift called me in the middle of the night. I checked the issue and the fix was literally a one line change. But deploying that fix to the client environment required a hotfix process that was much longer than a normal PR.

This was not the first time. It was always the same sequence: a tiny contract mismatch, Zod fails hard, the client is blocked, and someone on the engineering team loses sleep over it.

Something had to change.

## The idea that flipped everything

Our application already had a feature flag system. Different clients have different needs, and we use feature flags to toggle features for specific customers. These flags are editable directly in the app and only our internal team can access them.

So the idea hit me. What if API response validation itself could be toggled with a feature flag? If the flag is on, we validate as usual. If the flag is off, we skip validation and let the UI render whatever it can. It would not replace proper fixes. It would just give us room to breathe.

If a client encounters a Zod error, LiveOps can flip a switch and instantly unblock them without filing an emergency patch or waking anyone up.

I tested the idea in our dev environment and it worked.

## Operationalizing the safety net

To make this useful, I wrote a runbook for our team. It explains what to do when a Zod error appears in production.

- Check if the client is blocked by a validation failure.
- Toggle the validation flag off for that client.
- Confirm that their UI now loads correctly.
- If the UI is correct and stable, escalate the issue normally during work hours.
- If the UI misbehaves without validation, escalate immediately to the responsible engineer.

With this in place, a validation failure no longer had to block a client until a hotfix was deployed.

## How the validation flag actually works

In practice, the validation flag is not read from a static constant. Instead, it lives inside our SDK configuration and the SDK re-evaluates it on every request.

```javascript
const sdk = {
  config: () => ({
    useValidation: localStorage.getItem("useValidation") === "true",
    baseURL: "https://api.example.com",
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
  }),
}
```

`config` being a function is what makes this work. Calling `sdk.config()` re-evaluates `useValidation` on every request, which means the flag is always up to date. If we had defined this as a plain constant, the value would only be read once on initial load, and changing the flag later would have had no effect.

We also keep this logic out of the generated API layer. All API utilities are produced by codegen, and we intentionally avoid embedding feature flag logic there. That logic lives outside codegen and changes more frequently, while generated code should stay stable.

With that in place, the request flow becomes straightforward.

```javascript
async function fetchWithOptionalValidation(fetcher, schema) {
  const response = await fetcher();
  const { useValidation } = sdk.config();

  if (!useValidation) {
    return response;
  }

  const parsed = schema.safeParse(response);

  if (!parsed.success) {
    throw new Error(`response from url ${response.config.url} doesn't match model ${schema}`);
  }

  return parsed.data;
}
```

## Keeping the flag in sync

To make this reliable, we also keep the validation flag in sync with the rest of the app. Feature flags are fetched from the backend and stored in application state, but we also mirror the validation flag into `localStorage`.

When a flag is updated manually, we update `localStorage` immediately.

```javascript
function updateFlag(flag, enabled) {
  // update flag in app state

  if (flag.name === "isApiValidationEnabled") {
    localStorage.setItem("useValidation", String(enabled))
  }
}
```
We do the same during initial flag hydration.

```javascript
function getFlags() {
  const flags = fetchFlagsFromBackend()
  // store flags in app state

  localStorage.setItem("useValidation", String(flags.isApiValidationEnabled))
}
```
When `getFlags` runs on page load, `localStorage` is updated as well. This prevents stale values from previous sessions and ensures validation behavior is correct from the very first request.

## The outcome

Since adopting this approach, we have not had to wake anyone up at night to deal with trivial validation failures. Minor contract mismatches no longer block clients, and our LiveOps team has a safe and immediate way to mitigate incidents.

Validation is still in place when we need it. Now it can also be turned off without a deployment.
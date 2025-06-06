---
title: Spoticeipt
description: Spotify top track receipt generator
image: ./images/spoticeipt.webp
imageCaption: Spoticeipt UI showing a receipt of current user's stats from last year
publishedAt: 2024-11-24T13:55:07.182Z
projectUrl: https://spoticeipt.vercel.app
status: published
---

I never planned to build this app, but one day I saw many people on X sharing their Spotify top tracks in a receipt-like format, inspired by [@albumreceipts](https://www.instagram.com/albumreceipts/). I thought it would be awesome to create an app that generates something like that— and that's how `Spoticeipt` was born.

`Spoticeipt` connects to the [Spotify Web API](https://developer.spotify.com/documentation/web-api), requiring users to link their Spotify accounts. Once linked, users can generate receipts showcasing their top tracks, artists, genres, or stats from the past month, 6 months, or year. It can also create album track lists, similar to what `albumreceipts` offers. Additionally, `Spoticeipt` provides insights into a user's music taste, powered by the [Gemini API](https://ai.google.dev/gemini-api/docs).

Recently, I noticed a lot of buzz around [shadcn](https://ui.shadcn.com/), a library that lets developers copy and paste component source code for easy customization rather than installing it as an npm package. However, since it’s built on [Radix UI](https://www.radix-ui.com/), I still need to install Radix as an npm package.

I used [jotai](https://jotai.org/) and [React Query](https://tanstack.com/query/latest), which might seem overkill for a small app, but they make state management much easier by eliminating the need to pass props between components. For Spotify Web API integration, I chose [@spotify/web-api-ts-sdk](https://www.npmjs.com/package/@spotify/web-api-ts-sdk) because of its clear documentation, straightforward interface, and, most importantly, its built-in auto-refresh token functionality, which saved me the effort of implementing it myself.

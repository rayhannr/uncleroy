---
title: TypeSoFast!
description: Typing speed test with computer, 1v1, and room races, backed by AccelByte Gaming Services
image: ./images/type-so-fast.webp
imageCaption: TypeSoFast! mid-run in Indonesian on a 60s test, with the 3D keyboard background reacting to each keystroke
publishedAt: 2026-09-27T14:12:00.000Z
projectUrl: https://typesofast.rayhannr.dev
status: published
---

## Background

I built [the first version of TypeSoFast!](./type-so-fast-legacy) in 2021 with Create React App. It was a 10fastfingers clone in Indonesian, a word list I scraped from news sites, a timer, and a WPM number at the end. Your top three scores went into localStorage and came back as a podium. That was the extent of it, so a different browser or a cleared cache put you back at zero.

I work at AccelByte, but not as a game developer. I'm on the web side, so I barely touch how our services actually work inside a game. What I knew was the Admin Portal, the screens where game developers configure those services. If I want to have useful opinions about the product, I should know what it feels like to sit where our customers sit, with the same docs, SDKs, and tooling they get.

There's a second reason. AccelByte gets associated with big publishers shipping AAA titles, which is fair, since that's a lot of our business. But the services themselves don't care how big your game is. Auth, leaderboards, achievements, matchmaking, and cloud saves are the same problems whether you have a 300-person studio or one guy rebuilding a typing test on weekends. I wanted a working counterexample I could point at.

The third reason turned up once I started. We ship an MCP server and an AI plugin so game developers can work with the SDKs through an agent instead of reading docs by hand. That tooling is only useful if what it tells you is correct. If it points someone confidently at the wrong endpoint, or at an API that doesn't behave the way it claims, it costs more time than it saves. The only way I could think of to check was to build a real integration and see where it led me wrong.

So I rebuilt the whole thing on AccelByte Gaming Services (AGS).

## The stack

The frontend is Next.js with TypeScript, Tailwind, React Query, and [Three.js](https://threejs.org/) for the background and result animations. The backend is a Go service on Cloud Run wrapping the AGS Go SDK. Realtime messaging runs on [Pusher Channels](https://pusher.com/channels/).

Everything the browser hits goes to one domain. The Next.js config rewrites `/api/*` to the Cloud Run service, so there's no CORS setup and no second origin to manage.

The backend started as about 35 Next.js API routes on the AccelByte TypeScript SDK. I moved all of it to Go later, partly to learn Go properly and partly because a stateless service on Cloud Run's free tier costs nothing when nobody's playing. Doing it route by route meant I wrote the same integrations twice, once in each SDK.

## What AGS handles

Almost all of the backend. IAM covers login, both anonymous device ID and Google, plus account linking so an anonymous player keeps their progress after signing in. Cloud Save stores personal bests, run history, daily streaks, XP and level, per-mode win streaks, and UI settings like accent color. Statistics tracks best WPM per duration and per mode, games played, total words typed, and total XP.

Leaderboards read from those stats. There are all-time and weekly boards split by duration and mode, plus a separate XP board. Most achievements are tied to a stat, like best WPM over 100, so AGS unlocks them on its own once the stats land. It doesn't announce it, so after each run my code fetches the unlocked list and compares it to the one from before to see what's new, then fires a toast. A few conditions can't be expressed as a stat, like a 100% accuracy run or playing every mode at least once. Those I check and unlock myself.

Matchmaking, Session, and Social handle the multiplayer.

## The modes

Solo is the original game, now with 15/30/60/120 second durations, three word modes (words, numbers, punctuation), and both Indonesian and English word lists.

vs Computer races you against a bot across four difficulty tiers. The bot runs its own instance of the same reducer the player uses, driven by a self-scheduling timer with a pace, some jitter, and two kinds of mistakes: slip-and-correct, and slip-and-ship. Both sides tick off one shared interval and read from the same word list. After the first playtest I bumped every tier's pace by about 15%, then added a fourth tier at roughly 130 WPM because hard was still beatable.

vs Player is a quick match against a stranger through AGS Matchmaking, which pairs two tickets into a game session. Live progress syncs over a WebRTC data channel.

Room lets you create a match for up to five players and share a short code. AGS Session has join-by-code built in, so I didn't have to invent a code scheme or store anything myself. Starting the match locks the room against further joins.

There's also a friends list. You add people with a short public ID, see who's online, and invite a friend straight into a match without going through random matchmaking.

## The pain points

This was the actual point of the exercise. Lobby is the AGS service that would have carried friend presence and invites, and its websocket can't be used from a browser. It wants an `Authorization` header at handshake time, and the browser `WebSocket` API has no way to send one. There's no query-param fallback and no post-connect auth frame either. I burned three spikes on this, including a Node experiment that only "worked" because Node's WebSocket supports a non-standard headers option no browser has. That's why both ended up on Pusher instead.

Session `PATCH` replaces the whole attributes object rather than deep merging it. In PvP, two writers touch session attributes independently. One writes the shared word list, the other writes the WebRTC offer and answer. With stale client-side copies, they silently wipe each other's fields. It showed up as a `words[0] is undefined` crash on roughly two out of three runs. The same endpoint also needs an optimistic-concurrency `version` field or it returns a 400, which is easy enough to handle once you know about it.

The endpoint that generates a room's join code returns nothing at all unless the session's joinability is `OPEN`. No error, no warning, just no code. On the good side, generating and revoking a code are both leader-enforced server-side, so I didn't have to write my own host check.

The AGS gateway sent no CORS headers at the time. Every `@accelbyte/sdk-*` package ships generated React Query hooks, and I was excited to use them, but they call AGS directly from the browser and the browser blocked every response. Anything touching AGS had to go through my own backend instead, which is where the hooks stop being any use. AGS has since added CORS configuration to the Admin Portal, so a customer can set it up themselves instead of filing a LiveOps ticket.

Then the SDK-specific ones. In the Go SDK, the generated friends-list methods either route to an admin-only path that 403s with a player token, or declare the response as a one-element array when AGS actually returns a plain object, which fails to unmarshal. I ended up calling the self-scoped REST paths directly. The bulk display-name lookup hits `bulk/basic`, which 404s in this deployment, so I switched to the admin endpoint. And Cloud Save's `Value interface{}` decodes JSON numbers as `json.Number` rather than `float64`, so a bare type assertion fails quietly and makes every saved number look absent.

In the TypeScript SDK, `UserStatisticApi` has two different classes backing identically named methods, one public and one admin. Only the public one works with a player token. Nothing in the types tells you which one you imported.

None of these are dealbreakers, and most cost me an afternoon each. But every one of them is an afternoon a real customer would also spend, so I've filed them as such.

## How the agent tooling held up

I did nearly all of the AGS configuration through our own AI plugin driving the `ags` CLI rather than clicking through the Admin Portal. That covered every achievement config, all the leaderboard configs across duration, mode, time range, and XP, the PvP match pool and rule set, and the session templates. Something like forty resources. It was easily the best part of the experience, and I never had to fall back to the portal after the first phase.

The pain points above were a different kind of problem. An API's signature rarely tells you how it actually behaves. That's the hardest thing for an agent to know, and the thing a developer most needs warning about. Nothing told me upfront that CORS would block the generated React Query hooks, that Lobby's websocket couldn't be reached from browser code, that a room's join code needs `OPEN` joinability, or that session `PATCH` overwrites instead of merges. I found all four by running code against the real namespace and watching it fail.

So the working rule for the project became: don't trust a generated call until it has run against a live namespace and returned what it claimed it would. A type check or a successful build doesn't count. That habit caught every SDK defect listed above, and I'd want the tooling to push people toward it rather than assume the happy path. All of it went back as feedback, which was the point.

## Testing this was harder than building it

Type checks and builds tell you nothing about a two-player race. I found every concurrency bug in this project with Playwright, driving two or three real browser contexts against the live AGS dev namespace.

The room test creates a room, joins with two more contexts, starts the match, then has a fourth context try the code and confirms it gets rejected. That last part proves the lock actually rejects joins rather than hiding the button. Writing it caught a bug where the start handler fired two concurrent session writes that raced the same version field and blew through their retries. I also had to parallelize the test's own waits, because loading four real browsers one after another against live services timed out on wall clock alone.

I verified anything on the Go side with `go run .` and curl against the real namespace before deploying. A passing `go build` means very little when the bug is an SDK method pointing at the wrong endpoint.

## Known limitations

There's no TURN relay, only public STUN, so two PvP players both behind symmetric NATs won't connect. That's acceptable on typical home and office networks and a real limitation everywhere else.

Match invites only arrive live. If you're not connected when the Pusher event fires, you miss it. Friends and blocks always read straight from AGS, so those are fine, but the invite itself has no persisted record to fall back on.

The client decides room wins by comparing your WPM against the highest opponent WPM from a throttled progress stream. That's enough to gate an achievement. I wouldn't trust it if anything were actually at stake.

## The part I actually wanted to prove

This is a browser typing game with no budget and one developer. It still ended up with real accounts, cross-device saves, per-mode leaderboards, thirty-something achievements, matchmaking, party rooms, and a friends list, and the backend bill is zero.

AGS gets associated with big publishers because that's who you see using it, not because it's priced out of reach of anyone smaller. The services underneath are just the ordinary, tedious problems every game has, and a small web game runs into all of them too, usually with fewer people around to solve them.

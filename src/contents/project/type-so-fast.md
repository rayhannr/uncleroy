---
title: TypeSoFast!
description: Typing speed test with computer, 1v1, and room races, backed by AccelByte Gaming Services
image: ./images/type-so-fast.webp
imageCaption: TypeSoFast! mid-run in Indonesian on a 60s test, with the 3D keyboard background reacting to each keystroke
publishedAt: 2026-07-05T03:07:10.000Z
projectUrl: https://typesofast.rayhannr.dev
status: published
---

## Background

I built [the first version of TypeSoFast!](./type-so-fast-legacy) in 2021 with Create React App. It was a 10fastfingers clone in Indonesian, a word list I scraped from news sites, a timer, and a WPM number at the end. Your top three scores went into localStorage and came back as a podium. That was the extent of it, so a different browser or a cleared cache put you back at zero.

I work at AccelByte, but not as a game developer. I'm on the web side, so I barely touch how our services actually work inside a game. What I knew was the Admin Portal, the screens where game developers configure those services. If I want to have useful opinions about the product, I should know what it feels like to sit where our customers sit, with the same docs, SDKs, and tooling they get.

There's a second reason. AccelByte gets associated with big publishers shipping AAA titles, which is fair, since that's a lot of our business. But the services themselves don't care how big your game is. Auth, leaderboards, achievements, matchmaking, and cloud saves are the same problems whether you have a 300-person studio or one guy rebuilding a typing test on weekends. I wanted a working counterexample I could point at.

The third reason turned up once I started. We ship an [MCP server](https://github.com/AccelByte/ags-api-mcp-server) and an [AI plugin](https://github.com/AccelByte/ai-plugins) so game developers can work with the SDKs through an agent instead of reading docs by hand. That tooling is only useful if what it tells you is correct. If it points someone confidently at the wrong endpoint, or at an API that doesn't behave the way it claims, it costs more time than it saves. The only way I could think of to check was to build a real integration and see where it led me wrong.

So I rebuilt the whole thing on AccelByte Gaming Services (AGS).

## The stack

The frontend is Next.js with TypeScript, Tailwind, React Query, and [Three.js](https://threejs.org/) for the background and result animations. The backend is a Go service on Cloud Run wrapping the AGS Go SDK. Realtime messaging runs on AGS Lobby and the browser connects to it directly.

Requests go to one domain. The Next.js config rewrites `/api/*` to the Cloud Run service, so there's no CORS setup. Cloud Run only ever sees short REST calls and the Lobby socket never touches it.

The backend started as about 35 Next.js API routes on the AccelByte TypeScript SDK. I moved all of it to Go later, partly to learn Go properly and partly because a stateless service on Cloud Run's free tier costs nothing when nobody's playing. Doing it route by route meant I wrote the same integrations twice, once in each SDK.

Realtime went through two more passes. I started on [Pusher Channels](https://pusher.com/channels/) for reasons covered below and moved everything to AGS Lobby once the backend lived on Cloud Run. At first the Go service held the Lobby sockets and relayed them to browsers. I later dropped the relay and let browsers connect to Lobby themselves.

## What AGS handles

Almost all of the backend. IAM covers login, both anonymous device ID and Google, plus account linking so an anonymous player keeps their progress after signing in. Cloud Save stores personal bests, run history, daily streaks, XP and level, per-mode win streaks, and UI settings like accent color. Statistics tracks best WPM per duration and per mode, games played, total words typed, and total XP.

Leaderboards read from those stats. There are all-time and weekly boards split by duration and mode, plus a separate XP board. Most achievements are tied to a stat, like best WPM over 100, so AGS unlocks them on its own once the stats land. It doesn't announce it, so after each run my code fetches the unlocked list and compares it to the one from before to see what's new, then fires a toast. A few conditions can't be expressed as a stat, like a 100% accuracy run or playing every mode at least once. Those I check and unlock myself.

Matchmaking, Session, Lobby, and Social handle the multiplayer.

## The modes

Solo is the original game, now with 15/30/60/120 second durations, three word modes (words, numbers, punctuation), and both Indonesian and English word lists.

vs Computer races you against a bot across four difficulty tiers. The bot runs its own instance of the same reducer the player uses, driven by a self-scheduling timer with a pace, some jitter, and two kinds of mistakes: slip-and-correct, and slip-and-ship. Both sides tick off one shared interval and read from the same word list.

vs Player is a quick match against a stranger through AGS Matchmaking, which pairs two tickets into a game session. Tickets carry the player's duration, word mode, and language, and only identical settings get paired. Live progress syncs over a WebRTC data channel.

Room lets you create a match for up to five players and share a short code. AGS Session has join-by-code built in, so I didn't have to invent a code scheme or store anything myself. Starting the match locks the room against further joins.

There's also a friends list. You add people with a short public ID, see who's online, get notified when a request is accepted, and invite a friend straight into a match without going through random matchmaking. An invite carries the inviter's race settings, so the friend races on those.

## The pain points

This was the actual point of the exercise.

- **Lobby's websocket looks impossible to open from a browser.**

  It wants an `Authorization` header at handshake time, and the browser `WebSocket` API has no way to send one. I tried a query param, a few variations of it, and the token in the subprotocol list next to `Bearer`, and spent three separate attempts on it, including a Node experiment that only "worked" because Node's WebSocket supports a non-standard headers option no browser has.

  I concluded it couldn't be done and built a relay around that. It could. Lobby accepts the access token as the only requested subprotocol, which is what [`@accelbyte/sdk-lobby`](https://www.npmjs.com/package/@accelbyte/sdk-lobby) does, and I only found that after the relay was already live.

- **Session `PATCH` replaces the whole attributes object instead of merging it.** 

  In PvP, one writer sets the word list and another sets the WebRTC offer and answer, and with stale client copies they silently wipe each other's fields. It showed up as a `words[0] is undefined` crash on roughly two out of three runs. The same endpoint also needs an optimistic-concurrency `version` field or it returns a 400.
- **A room's join code is generated only if the session's joinability is `OPEN`.** 

  Otherwise the endpoint returns nothing, with no error and no warning. Generating and revoking a code are leader-enforced server-side, so I didn't have to write my own host check.

- **The Go SDK's generated friends-list methods are unusable with a player token.** 

  They either route to an admin-only path that 403s or expect the wrong response shape, so I call the self-scoped REST paths directly.

The Lobby one is why realtime started on Pusher. The frontend and backend were both on Vercel, which is serverless. A function there lives for one request and then goes away, so there's nowhere to keep a socket open for a Lobby relay. Pusher holds the connections itself, so my backend only had to send it a message. Once the backend moved to Cloud Run, which runs a normal long-lived process, that reasoning stopped holding.

My first Lobby version assumed the browser couldn't connect, so the browser held a socket to the Go service and the service held the Lobby socket on its behalf, where a Go client sets the header freely. That worked, but every open tab kept a Cloud Run instance billed for as long as the socket lived. I limited it to one instance, cut sockets after 15 minutes, and dropped hidden tabs, all to limit a cost that shouldn't have existed.

Now the login response carries the Lobby URL and the browser dials it with its own access token. The relay, its origin allowlist, and the 15 minute request timeout are gone, and Cloud Run only handles short REST calls. Senders push app payloads through Lobby's freeform notifications over REST and AGS delivers each one to whichever socket belongs to that player. 

Presence needed almost no code since AGS marks a player online while their socket is open. The cost is speed. Lobby was noticeably slower than Pusher in my tests from Indonesia, though part of that is distance because the AGS namespace is in the US and my Pusher cluster was in Singapore.

The only presence code I wrote disconnects a tab that's been hidden for a minute, so a forgotten tab doesn't look online to friends forever.

## How the agent tooling held up

I did nearly all of the AGS configuration through our own AI plugin driving the [`ags` CLI](https://github.com/AccelByte/accelbyte-ags-cli) rather than clicking through the Admin Portal. That covered every achievement config, all the leaderboard configs across duration, mode, time range, and XP, the PvP match pool and rule set, and the session templates. Something like forty resources. 

The portal was only needed for the IAM client and the third-party login setup for device ID and Google, which I still created there. Everything after that was the CLI, and it was easily the best part of the experience. Configuration is where an agent does well because the shape of each resource is documented and a wrong value fails loudly.

Where the tooling couldn't help was the behavior behind the API, which is what the pain points above were about. A signature rarely tells you how an endpoint acts, so that's the hardest thing for an agent to know and the thing a developer most needs warning about. 

Nothing told me upfront that CORS would block the generated React Query hooks, that a browser needs the token as a subprotocol to open Lobby's websocket, that a room's join code needs `OPEN` joinability, or that session `PATCH` overwrites instead of merges. I found all four by running code against the real namespace and watching it fail. For the Lobby one, the answer was in the SDK's source the whole time.

So the working rule for the project became: don't trust a generated call until it has run against a live namespace and returned what it claimed it would. A type check or a successful build doesn't count. That habit caught every SDK defect listed above, and I'd want the tooling to push people toward it rather than assume the happy path. All of it went back as feedback, which was the point.

## Testing this was harder than building it

Type checks and builds tell you nothing about a two-player race. I found every concurrency bug in this project with Playwright, driving two or three real browser contexts against the live AGS dev namespace.

The room test creates a room, joins with two more contexts, starts the match, then has a fourth context try the code and confirms it gets rejected. That last part proves the lock actually rejects joins rather than hiding the button. 

Writing it caught a bug where the start handler fired two concurrent session writes that raced the same version field and blew through their retries. I also had to parallelize the test's own waits, because loading four real browsers one after another against live services timed out on wall clock alone.

I verified anything on the Go side with `go run .` and curl against the real namespace before deploying. A passing `go build` means very little when the bug is an SDK method pointing at the wrong endpoint.

## Known limitations

Match invites only arrive live. If you're not connected when the Lobby notification fires, you miss it. Friends and blocks always read straight from AGS, so those are fine, but the invite itself has no persisted record to fall back on.

I refuse to pay a single penny for a typing game, so the Go service only runs on one small instance. Since browsers connect to Lobby directly, Cloud Run no longer holds a connection per open tab and only serves short requests, so the bill stays small.

The downside is that it'll feel slow if a lot of people are racing at once. I'm okay with that. I'd rather it be slow than cost me money, and there's a budget alert in case it still does.

PvP relays through AGS's TURN servers when two players can't connect directly, and falls back to public STUN alone if fetching the credentials fails. The Go SDK has no client for the TURN manager, so that's another direct REST call.

The client decides room wins by comparing your WPM against the highest opponent WPM from a throttled progress stream. That's enough to gate an achievement. I wouldn't trust it if anything were actually at stake.

## The part I actually wanted to prove

This is a browser typing game with no budget and one developer. It still ended up with real accounts, cross-device saves, per-mode leaderboards, thirty-something achievements, matchmaking, party rooms, and a friends list with live presence, all on a backend that runs on one small Cloud Run instance.

AGS gets associated with big publishers because that's who you see using it, not because it's priced out of reach of anyone smaller. The services underneath are just the ordinary, tedious problems every game has, and a small web game runs into all of them too, usually with fewer people around to solve them.

If you have a game idea of your own, you can [sign up for AGS](https://prod.gamingservices.accelbyte.io/auth/register) and build on the same services this project uses.

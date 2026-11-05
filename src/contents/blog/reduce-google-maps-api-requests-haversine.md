---
title: Use Haversine to Cut Google Maps Requests by 80 Percent
image: ./images/reduce-google-maps-api-requests-haversine.webp
imageCaption: An image with the text "use haversine to cut google maps requests by 80 percent"
imageCredit: Dorin Seremet
imageLink: https://unsplash.com/photos/a-view-of-a-castle-through-the-trees-oKSWsxjwzAU
description: Straight-line first, Google Maps only for the shortlist
metaDescription: How I reduced Google Maps API requests in a places list by ranking with the haversine formula first, then requesting road distance only for the closest candidates.
status: published
publishedAt: 2026-11-05T15:59:03.000Z
---

In my last post I worked out how the [haversine formula](/blog/haversine-distance-formula) works. The function I was studying lives in [Places to Go](https://github.com/rayhannr/places-to-go), a side project where I keep a list of places to eat.

It has a sync distance tool. I give it a location, and it fills in how far each saved place is from there. It used to ask Google Maps about all 200+ places every time.

Haversine is how I got that down to 10 or 20, and 40 at most.

## What Places to Go stores

Everything lives in a Google Sheet. Each row is a place, with columns for its name, Google Maps link, the city Google gives me when I add it, plus the distance and travel time from where I am.

The link is where the coordinates come from. Haversine needs a latitude and longitude for each place, and I already have them in the link.

## Every place, every time

Each sync recalculated the distance to every place in the list. Every one of them went to Google Maps.

My list has 200+ places, and Google bills the Routes API per element, which means per origin and destination pair. One sync from one location meant 200+ elements.

I keep my Google bill at $0 with rate limits. Google gives $200 of free credit a month, and the limits are sized so the worst case stays under it. The budget I wrote for a full sync works out to about $2.30, and I only allow 20 of them every 30 days.

That's a lot of work for an answer I mostly don't use. If I sync from Yogyakarta, I don't care about the places in Denpasar. I want the closest few, in Yogyakarta or the areas next to it, like Sleman to the north and Bantul to the south.

And I won't need to know the 30th closest place either. Top 10 is plenty. The tool caps what it shows at 10, and returns 5 by default.

## Filtering by city looks right and isn't

The obvious fix is to find which city the location is in, filter the list to that city, and sync only those.

I never built this one. I could see it wouldn't be accurate before I wrote any code.

It sounds right, but it misses cases. Say I'm on the north side of Yogyakarta, and Sleman starts right past it. A place in Sleman near the border might be five minutes away. A place on the south side of Yogyakarta could be across the whole city.

If I filter to Yogyakarta, I'd never see the place in Sleman, even though it's the closest one.

In that case, city names are a bad proxy for distance. So I needed to measure the distance itself.

## Straight line first

That's where haversine comes in. It gives the straight-line distance between two coordinates, and I already had the function in the project.

It's plain math on numbers I already have, so it's cheap. It doesn't need a Google Maps request or a network call.

So the sync now runs haversine from the target location to every place in the list and sorts the results from the nearest.

## Haversine can be wrong

Haversine isn't 100% accurate for what I want. It only looks at two coordinates and ignores everything between them. Rivers, mountains and one-way streets don't exist for it.

Say place P is 2 km from me in a straight line, but there's a river in between. The nearest bridge is 4 km upstream, so I have to detour to it and come back. By road, that's 8 km.

Place Q is 3 km away in a straight line, on my side of the river. The road is direct, so it's about 3.5 km.

Haversine ranks P ahead of Q, even though Q is much closer by road.

Still, haversine can only give a distance that's too short, never too long, because a road is never shorter than a straight line. So a place that's 5 km away in a straight line is at least 5 km away by road. It can't beat one that's 4 km away by road.

So I use haversine to pick which places to ask Google about, not to pick the final top N.

## Road distance for the shortlist

The number I care about is the road distance and travel time which comes from Google's Routes API.

So the second stage asks Google about the shortlist only. Everything behind it in the sort order is left out.

Visited places are skipped too. They're unlikely to be revisited, and fewer places means fewer elements per request.

## How many to ask about

Because haversine can be wrong, picking exactly N isn't enough. The 10th closest by straight line isn't always the 10th closest by road.

So the code asks Google in batches and stops once the top N can't change. Here's the loop, trimmed down. The candidates are already sorted nearest first by haversine, and `hav` is each one's straight-line distance.

```ts
const MAX_ROUTED = 40
const routed = new Map() // candidate index -> road distance
let done = 0
let target = Math.max(topN * 2, topN + 5)

while (done < target) {
  await routeBatch(candidates.slice(done, target)) // Routes API, fills `routed`
  done = target
  if (done >= candidates.length) break // everything is routed

  const nthBest = nthSmallest(routed, topN) // Nth best road distance so far
  if (nthBest <= candidates[done].hav) break // nothing left can beat it
  if (done >= MAX_ROUTED) break // the cap of 40, more on that below

  target = Math.min(MAX_ROUTED, done + Math.max(10, topN))
}
```

`routed` holds the road distance for every place routed so far.

`done` is how many candidates have been routed so far.

`target` is where the current batch ends. The first batch is bigger than N: the larger of 2N or N + 5. With N = 10 that's 20 places. With N = 5 it's 10. The `+ 5` is there so a small N like 1 doesn't ask for just 2.

The loop runs while the current batch still has places that haven't been routed.

`routeBatch` sends the places from `done` to `target` to the Routes API and stores their road distances in `routed`. Then `done` moves up to `target`.

The first `break` is for a short list. If every candidate has been routed, there is no next place to compare against, so the loop ends before it reads `candidates[done]`.

`nthBest` is the Nth best road distance among everything routed so far.

The second `break` is the stop check, and it uses the rule from earlier. `candidates[done]` is the nearest place that hasn't been routed yet. If `nthBest` is no more than that place's straight-line distance, that place can't beat it. Say the Nth best road distance is 3.1 km and the next place is 3.2 km away in a straight line. Nothing behind it can win either, since they're all farther in a straight line.

The third `break` is the hard cap of 40.

If none of the `break`s fire, `target` moves forward by another 10 (or N, if N is bigger), never past the cap, and the loop asks again.

Take place P from the river example. It gets routed and comes back at 8 km, so it doesn't make the top N. Place Q ranks behind P by haversine but is in the same batch, so it comes back at 3.5 km and takes the spot. If the roads are bad enough that the top N isn't settled yet, the next batch goes out.

## The cap of 40

That loop needs a hard limit. Say my list has 200 places around town X, and I open the app from town Y, 100 km away. Every place is about 100 km away in a straight line and maybe 130 km by road. The stop check asks "is 130 under 100?" and the answer is never yes, so it would ask about all 200.

So there's a cap of 40 places per sync. Since N can't be more than 10, that's 4 times the most I ever need to rank. The true nearest 10 should sit well inside the nearest 40 by straight line.

When the cap is hit, the code logs it and stops. The top N is then a best guess instead of a proof. That only happens when everything is far away and roughly the same distance.

## What it saves

Before, one sync cost 200+ elements. Now the first batch is 10 when N is 5, or 20 when N is 10. Most of the time the stop check passes right there. Even in the worst case it never goes past 40, which is a cut of at least 80% for my 200+ places.

At the roughly $0.01 per element my budget assumes, that's about $0.10 to $0.40 per sync instead of $2.30.

My rate limits are still sized for the old cost, so there's a lot of room I haven't used yet.

## Some smaller things

The cells for places that weren't routed get blanked. Google Sheets treats `null` as "don't touch this cell", so a skipped place would keep the distance from my last sync, from a different location. An empty string fixes that.

The same haversine function also powers a smaller shortcut. If I haven't moved more than 2 km since the last sync, the tool skips the whole thing and says the data is still fresh.

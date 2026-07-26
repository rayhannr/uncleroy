---
title: 'Dashboard vs CLI vs MCP: When to Use Which'
image: ./images/dashboard-vs-cli-mcp.webp
imageCaption: 'An image with the text "dashboard vs cli vs mcp: when to use which"'
imageCredit: fruitfullmedia
imageLink: https://unsplash.com/photos/a-person-driving-a-car-on-a-road-next-to-a-forest-fey671cCzNo
description: How I actually choose between dashboard, CLI, and MCP
metaDescription: Comparing dashboards, CLIs, and MCP tools with real-world examples from Supabase, Vercel, a game admin portal, and a personal side project.
publishedAt: 2026-07-26T14:55:27.000Z
status: published
---

There was a reorg at my company last month, and I got reassigned to maintain an admin dashboard that's been around for about 8 years. I've worked on it the most out of anyone for the last 5 years, so it made sense. My first reaction, though, was worry. The company is pushing hard toward CLI, MCP, and AI plugins, tool integrations that any AI harness can plug into, letting users control the product through their own AI agents. I figured the dashboard was on its way to becoming a relic, and I'd spend my time polishing something that mattered less every quarter.

I brought that up with my manager, and the conversation reframed it for me. The dashboard isn't competing with CLI and MCP. They solve different problems for different situations, and neither one makes the other obsolete.

Here's what I mean, with examples from my own day to day.

## Supabase for personal projects

I use Supabase for side projects that need a database. Before AI-assisted coding was really a thing, and with SQL never being my strong suit, I'd create tables straight in the Supabase dashboard, which was slow and honestly kind of painful. Now I usually talk through the schema with an AI agent first, let it generate a migration script, and run that with the CLI. Pulling migrations from prod to local also goes through the CLI, no question.

But for anything small, the dashboard still wins. Checking whether a user row got created after signup, flipping on a third-party login provider, adding one optional column before the app is even in production, none of that is worth writing a CLI command or prompting an agent for. Clicking around the dashboard is just faster.

## Vercel dashboard for quick checks

Same pattern with Vercel. It has a CLI, but I barely touch it. I use the dashboard to check failed deployments, look at analytics for this blog, inspect cron job results, and set environment variables. None of that requires hopping between multiple menus or chaining steps together. It's a single lookup or a single update, which is exactly what a dashboard is good at. There's nothing to memorize and nothing to ask an AI about, so the dashboard saves time rather than costing it.

## The admin portal I actually work on

The reassignment I mentioned is for a game admin portal. It's what publishers, studios, or individual developers use to run the backend of their game: managing player profiles, banning players, setting up leaderboard configs, updating item prices in the store, configuring third-party login, checking billing, and more.

As a user of that same kind of tool, the dashboard is the obvious choice for one-off operations like banning a player, comparing this month's billing against last month's, or turning off Google login. No menu-hopping, and the interface is a lot easier to read than raw JSON. But for something like setting up matchmaking, which touches multiple menus and a pile of fields that all depend on each other, the CLI is where I go. With an MCP server and AI plugin behind it, I can just describe what I want to an agent and let it drive the CLI or MCP tools to get there.

## MCP for a spreadsheet I hated using

The clearest case for MCP is [Places to Go](/project/places-to-go), a side project of mine. I used to log interesting restaurants by hand in a Google Sheet, mostly ones I found on Instagram: find the place on Instagram, look it up on Google Maps, copy the link, then paste the name, city, and link into the sheet. Three apps just to save one row, and the sheet itself was never a nice place to type into, tiny cells, way too easy to paste into the wrong row.

Now I have an MCP server in front of that sheet with tools to get a place by name, category, or city, add a place along with its distance and travel time from home, find the nearest places to my current location, and a few others. I paste the Instagram link into Claude, and it adds the row for me. I barely open the spreadsheet directly anymore.

The one time I did open it was to add a new category column across 200-plus existing rows, and I did that part by hand. I didn't trust an AI agent to guess the right category for each one at that scale, so I'd rather burn an afternoon on it myself than risk an agent quietly getting some of them wrong.

## My rule of thumb

Dashboard, CLI, and MCP each have their own best-fit use case, and even for the same task, different people will reach for different tools depending on how they think. For me, the CLI and MCP earn their place when a task needs several steps to get one thing right, especially the tedious kind that spans multiple apps. The dashboard wins when the task is a single simple step, because there's nothing to memorize and nothing to write, just a click. And when the task needs judgment an AI agent can only guess at, like re-categorizing 200 rows correctly, I'd rather do it myself than risk it getting some wrong at scale. If it were something a script could determine reliably instead of guess, I'd automate it without a second thought.

That's really what settled my worry about the dashboard becoming irrelevant. CLI and MCP can technically do everything the dashboard does, but capability was never the question. It comes down to convenience most of the time, and to trust the rest of the time, and a dashboard still wins on both often enough to stay worth keeping around.

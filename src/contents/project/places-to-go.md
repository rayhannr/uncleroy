---
title: Places To Go
description: Personal food destination tracker with a sarcastic AI assistant
image: ./images/places-to-go.webp
imageCaption: Places To Go showing the chat interface with the AI recommending nearby places in Bandung, and the Wheel of Places with 9 places ready to spin
publishedAt: 2026-05-05T14:44:29.000Z
projectUrl: https://places-to-go-demo.vercel.app
status: published
---

## Background

I follow a lot of culinary review accounts on Instagram, especially ones around my city. Every time I see an interesting place, I bookmark it. After a while, I realized this wasn't working. I rarely checked my bookmarks, and they were always mixed with other stuff that had nothing to do with food.

So I started using a Google Sheets table to track places I wanted to visit. That helped with organization, but the process of adding a new place was painful. Every time I found somewhere interesting on Instagram, I had to open Google Maps, look it up, and copy the link. On mobile, you can't just copy a Maps URL directly. You have to share it to another app first. Then I'd switch to the spreadsheet, type in the place name, city, and paste the link. If I also wanted to know how far away it was or how long it'd take to get there, that meant even more manual work.

I got tired of that whole routine, so I started looking for a way to automate it. I came across a tutorial showing that [OpenClaw](https://openclaw.ai/), an open-source locally-running AI agent, could connect to Telegram. I tried it, it worked, but it had to run on my laptop the whole time. I looked into deploying it somewhere for free, but the options I found were either too slow or hit the memory limit before the app could even run properly.

Around the same time, I remembered a conversation I had with my manager at work about the Vercel AI SDK. That gave me the idea to just build something myself, cloud-native, free to deploy, and does exactly what I need. So here we are.

## How it works

Places To Go is a personal food destination tracker built around a conversational AI interface. Instead of filling out forms or switching between apps, I just chat with it naturally and it does the rest. It works on both a Next.js web app and a Telegram bot, so I can use it from anywhere.

The AI assistant runs on [Mistral AI](https://mistral.ai/) with a sarcastic persona that speaks English, Indonesian, and Javanese. It sticks to one language per message and uses no emojis. The Telegram bot is locked down with user ID filtering, so only authorized users can interact with it.

### Adding places to the tracker

This is the main workflow. When I ask the assistant to add a place, it takes care of everything: resolving Google Maps short links, extracting coordinates and the place name, calculating the distance in kilometers and travel time in minutes using the [Google Maps Routes API](https://developers.google.com/maps/documentation/routes), and saving it all to a Google Sheet. What used to take several minutes of copying and pasting now takes a single chat message.

### Smart recommendations

Once the list grows, the assistant can help me decide where to eat. It can sort by the nearest spots, the quickest to reach, a specific city, or a fuzzy search by name. When I genuinely can't decide, there's a random pick option too. For discovering new restaurants outside my tracker, it searches Google Maps directly and returns the top three results with names, cities, and links.

### Tracking and managing places

After I visit a place, I can tell the assistant to mark it as visited with the date. If I mark the wrong one by mistake, I can unmark it. I can also delete places permanently when they close or I'm no longer interested, and the assistant handles shifting the remaining rows in the sheet so nothing gets out of order. I don't need to type the exact name for any of this either.

### Wheel of Places

The AI already has a random pick tool, but I wanted something more visual and satisfying. I had been wanting to build a spin wheel, something like Wheel of Names, for a long time, way before the AI hype. I just never had the time or the motivation to sit down and build it for its own sake. This project finally gave me a good enough reason.

The wheel pulls my full place list and lets me cherry-pick which entries go in, filter by visit status, or search by name or city to narrow the selection. Once I spin and land on a place, it gets struck through in the list and excluded from the next spin, so I don't keep landing on the same spot. A reset button brings everything back. The winner modal shows the place name, city, distance, travel time, and a direct Google Maps link to get there.

### Live GPS location

The app supports real-time location tracking from both the web and Telegram. To keep Google Maps API costs low, it only recalculates distances when I move more than 2 kilometers from my last known position. My location is stored in a dedicated tab named "Session" on Google Sheets, so it persists between conversations.

### MCP server

The app exposes a [Model Context Protocol](https://modelcontextprotocol.io/) server at `/api/mcp`, so I can connect my tracker directly to MCP-compatible AI clients like Claude Desktop. That means I can query and manage my list from inside any chat interface that supports MCP tools, without opening the web app at all. Since the Vercel AI SDK and MCP work with tools in a similar way, I define them once and share the same instance between both, so the two interfaces always stay in sync.

## Tech stack

The web frontend is built with [Next.js 16](https://nextjs.org/) using the App Router, styled with [Tailwind CSS 4](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/). The Telegram bot runs on [grammY](https://grammy.dev/).

On the backend, everything runs as Next.js API routes. The AI layer uses [Vercel AI SDK v6](https://sdk.vercel.ai/docs) with Mistral AI as the LLM provider. The MCP server is built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk).

I intentionally used my personal [Google Sheets](https://developers.google.com/sheets/api) as the database to keep the project completely free-tier and low-maintenance. It eliminates the need for a traditional database and provides a built-in UI for managing data manually when needed. For anyone looking to build a similar system, setting up a dedicated Google Sheet with the correct schema is a core requirement, as the application logic is tightly coupled with the sheet's structure. Location features rely on the Google Maps Geocoding, Places, and Routes APIs, and the entire application is deployed on [Vercel](https://vercel.com/).

Since this app is backed by my personal Google Sheet, I needed a way to let others explore it without giving them access to my actual data. The project link above points to a public demo that uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) as storage instead, so anyone can try the full web experience on a shared, isolated list. The Telegram bot and MCP server are disabled in demo mode, and the list is capped at 75 places to keep the shared store clean.

---
title: Places To Go
description: AI food tracker with a conversational roast master persona
image: ./images/places-to-go.webp
imageCaption: Places To Go chat interface showing the roast master AI assistant searching for a place, adding it to the tracker, and marking it as visited in a dark mode UI
publishedAt: 2026-05-05T14:44:29.000Z
projectUrl: https://github.com/rayhannr/places-to-go
status: published
---

## Background

I follow a lot of culinary review accounts on Instagram, especially ones around my city. Every time I see an interesting place, I bookmark it. After a while, I realized this wasn't working. I rarely checked my bookmarks, and they were always mixed with other stuff that had nothing to do with food.

So I started using a Google Sheets table to track places I wanted to visit. That helped with organization, but the process of adding a new place was painful. Every time I found somewhere interesting on Instagram, I had to open Google Maps, look it up, and copy the link. On mobile, you can't just copy a Maps URL directly. You have to share it to another app first. Then I'd switch to the spreadsheet, type in the place name, city, and paste the link. If I also wanted to know how far away it was or how long it'd take to get there, that meant even more manual work.

I got tired of that whole routine, so I built an app to handle it. Now when I spot a good place, I just open the app or message the Telegram bot, ask it to find the place on Google Maps, and add it to my list. One message, done.

## How it works

Places To Go is a personal food destination tracker built around a conversational AI interface. Instead of filling out forms or switching between apps, I just chat with it naturally and it does the rest. It works on both a Next.js web app and a Telegram bot, so I can use it from anywhere.

The AI assistant runs on [Mistral AI](https://mistral.ai/) with a "roast master" persona that speaks English, Indonesian, and Javanese. It sticks to one language per message and uses emojis sparingly. The Telegram bot is locked down with user ID filtering, so only authorized users can interact with it.

### Adding places to the tracker

This is the main workflow. When I ask the assistant to add a place, it takes care of everything: resolving Google Maps short links, extracting coordinates and the place name, calculating the distance in kilometers and travel time in minutes using the [Google Maps Routes API](https://developers.google.com/maps/documentation/routes), and saving it all to a Google Sheet. What used to take several minutes of copying and pasting now takes a single chat message.

### Smart recommendations

Once the list grows, the assistant can help me decide where to eat by recommending places through different filters. It can sort by the nearest spots, the quickest to reach, a random pick when I can't decide, or by a specific city. For discovering new restaurants that aren't in my tracker yet, it searches Google Maps directly and returns the top results with names, cities, and links.

### Tracking visits

After I visit a place, I can tell the assistant to mark it as visited with the date. If I mark the wrong one by mistake, I can undo it. The assistant uses fuzzy matching to find the right place, so I don't have to type the exact name from the spreadsheet.

### Live GPS location

The app supports real-time location tracking from both the web and Telegram. To keep Google Maps API costs low, it only recalculates distances when I move more than 2 kilometers from my last known position. My location is stored in a dedicated tab named "Session" on Google Sheets, so it persists between conversations.

## Tech stack

The web frontend is built with [Next.js 16](https://nextjs.org/) using the App Router, styled with [Tailwind CSS 4](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/). The Telegram bot runs on [grammY](https://grammy.dev/).

On the backend, everything runs as Next.js API routes. The AI layer uses [Vercel AI SDK v6](https://sdk.vercel.ai/docs) with Mistral AI as the LLM provider.

I intentionally used my personal [Google Sheets](https://developers.google.com/sheets/api) as the database to keep the project completely free-tier and low-maintenance. It eliminates the need for a traditional database and provides a built-in UI for managing data manually when needed. For anyone looking to build a similar system, setting up a dedicated Google Sheet with the correct schema is a core requirement, as the application logic is tightly coupled with the sheet's structure. Location features rely on the Google Maps Geocoding, Places, and Routes APIs, and the entire application is deployed on [Vercel](https://vercel.com/).

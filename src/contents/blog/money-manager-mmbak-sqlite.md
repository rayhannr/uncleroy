---
title: .mmbak is just a SQLite file
image: ./images/money-manager-mmbak-sqlite.webp
imageCaption: An image with the text ".mmbak is just a sqlite file"
imageCredit: PiggyBank
imageLink: https://unsplash.com/photos/a-person-holding-a-cell-phone-with-a-website-on-the-screen-1TYQPnWoj7k
description: The .mmbak backup is just SQLite. Open it, export it, analyze it.
metaDescription: The .mmbak backup file from Money Manager by Realbyte is a plain SQLite database. Open it with DB Browser for SQLite, export to CSV, or analyze it in Claude Desktop.
publishedAt: 2026-07-15T15:23:08.666Z
status: published
---

Ever since I started my first professional job, I've been tracking every transaction in [Money Manager](https://play.google.com/store/apps/details?id=com.realbyteapps.moneymanagerfree) by Realbyte. Found it randomly on Google Play, installed it, and it just clicked. Intuitive, offline by default, no unnecessary friction. I've stuck with it since.

That setup was fine when it was just me. But once I got married, I started thinking about how we'd manage finances together. The app stores everything locally on my device, so there's no shared view. My wife would have to use my phone every time she wanted to see where the money was going. Not ideal.

So I built [a web app](/project/money-tracker) where we can both log in with a shared account and track everything in one place. While figuring out how to seed the initial data, I remembered that Money Manager has a backup feature that uploads a file to Google Drive on a schedule. I tried it, but the file came out with a `.mmbak` extension. I had no idea what that was, so I asked Gemini. It told me `.mmbak` was a Money Manager-specific format with special encryption that could only be read by the app itself.

I just believed it. Didn't Google it, didn't ask another model. My bad.

So instead I used the app's export to Excel feature to seed the web app. That worked. With the data in, my wife and I could both log in from our own devices and track everything together without touching each other's phones.

## The double-logging problem

The problem was I still couldn't shake the habit of logging in Money Manager. It's instant and works offline. But since I thought the backup was unreadable, I had no way to sync that data into the web app automatically. So I was logging every transaction twice. Mobile first, then the web app.

## What .mmbak actually is

Eventually I went back and looked more carefully. Turns out it's just a SQLite database. Just drop it into [DB Browser for SQLite](https://sqlitebrowser.org/) and it opens without any issues. No renaming, no conversion. Browse the tables, export to CSV or JSON, done. I even threw it at my free Claude account and it analyzed the file just fine.

If you're trying to open a `.mmbak` file, that's the whole answer.

## The sync

With that cleared up, the actual solution became straightforward. I enabled automatic daily backup in Money Manager so it uploads to Google Drive automatically. Then I built a scheduled function in the web app that runs daily and handles the sync.

- Downloads the latest `.mmbak` from Drive
- Opens it with [sql.js](https://sql.js.org/) to query the SQLite database directly
- Pulls transactions updated since the last run, with the timestamp stored in [Upstash Redis](https://upstash.com/)
- Cleans up duplicates I'd manually entered in the web app during the double-logging phase, matched by date, amount, type, note, and account
- Upserts the active transactions into Supabase in batches
- Deletes anything that's been removed in the backup

Now my workflow is exactly the same as before. I log in Money Manager like I always have. The sync runs in the background. My wife sees everything from her own device through the web app, without me touching anything twice.

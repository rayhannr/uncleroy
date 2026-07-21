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

Ever since I started working, I've been tracking every transaction in [Money Manager](https://play.google.com/store/apps/details?id=com.realbyteapps.moneymanagerfree) by Realbyte. Completely offline, clean UI, free. Does exactly what I need without asking me to pay for features I'd never use.

That worked fine when it was just me. But once I started thinking about marriage, the workflow fell apart. My wife and I would both need visibility into our finances, and the app stores everything locally on your device. There's a backup feature where you can link a Google account and schedule daily or weekly backups to Google Drive, but that just shifts the problem. I'd have to manually open her Drive, download the backup, and import it into the app every time I wanted to see her logs. Not practical.

So I built [a web app](/project/money-tracker) where we both log in with a shared account. She uses her phone, I use mine, and all the data ends up in one place. That solved the visibility problem.

## The new problem: logging twice

The web app introduced a different annoyance. I still can't shake the habit of logging transactions in the mobile app, since I do it offline, in the moment, wherever I am. But I also can't abandon the web app because my wife relies on it. So I was logging every transaction twice. Once on mobile, once on the web.

That's obviously not sustainable.

## The .mmbak file

My first instinct was to use the mobile app's backup feature to sync data into the web app automatically. But I hesitated when I saw the file extension: `.mmbak`. That looked proprietary. I assumed it was proprietary, something that only works inside Money Manager, or would need a custom script to make sense of it.

Turns out it's just a SQLite database. If you're trying to open a `.mmbak` file, just drag it into [DB Browser for SQLite](https://sqlitebrowser.org/) and it works as-is. No renaming, no conversion. Browse the tables, export to CSV or JSON, done. I also dropped it into Claude Desktop with my free account and it read the schema fine and analyzed the data without any trouble.

## The sync plan

With that sorted, here's what I'm thinking for the sync:

- Enable automatic backup in the mobile app (daily seems fine)
- Build a cron job in the web app that runs on a schedule and does the following:
  - Fetches the latest backup from Google Drive
  - Stores a timestamp in [Upstash Redis](https://upstash.com/) so the next run knows what's already been processed
  - Compares the backup against what's already in the web app under my user ID
  - Deletes anything that's been soft-deleted in the backup
  - Upserts any records that were updated after that stored timestamp

The initial data migration was already done when I seeded the web app using an earlier backup file, so I don't have to worry about handling historical data. The cron job only needs to deal with incremental changes going forward.

Once this is built, I enter my transactions on the mobile app, its backup syncs to Drive, the cron job picks it up, and the web app stays up to date. My wife sees everything from her own device without me having to touch anything twice.

My workflow stays exactly the same as before. I keep logging in Money Manager like I always have. The only difference is my wife can now see everything from her own device through the web app.

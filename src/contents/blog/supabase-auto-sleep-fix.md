---
title: Solve Supabase Auto-Sleep on Unlaunched Projects with GitHub Actions
image: ./images/supabase-auto-sleep-fix.webp
imageCaption: An image with the text "solve supabase auto-sleep on unlaunched projects with gitHub actions"
imageCredit: Annie Spratt
imageLink: https://unsplash.com/photos/white-bed-comforter-set-and-brown-wooden-bed-frame-beside-brown-wooden-nightstand-4Wlp6m8hroE
description: Keep Supabase alive automatically with a simple GitHub Actions setup
metaDescription: Use GitHub Actions to keep your Supabase project active before launch. Avoid auto-sleep and downtime even with zero traffic.
publishedAt: 2025-07-31T15:37:28.252Z
status: published
---

I'm currently building a fullstack side project using [Astro](https://astro.build/) and [Supabase](https://supabase.com/). I plan to launch it sometime next year, so I don't expect any real users or incoming traffic for now.

Everything was running smoothly until I received an email from Supabase. It said that my project had been paused because of inactivity. This caught me off guard. I hadn't touched the site for a few days, and apparently that was enough to trigger Supabase's auto-sleep system.

## Why Supabase?

Supabase is my go-to for side projects. It's free, easy to set up, and the documentation is straightforward. For a solo developer working on a side project, those three things are a huge win. I didn't want to spend hours configuring a backend just to run a few API calls and store data.

Supabase gave me everything I needed out of the box: authentication, a Postgres database, REST and realtime APIs, and a nice dashboard to manage it all. I could focus on building the actual product instead of worrying about infrastructure.

## The Problem with Auto-Sleep

Auto-sleep might save resources, but it's a headache when you're actively developing. Imagine trying to test something quickly and suddenly realizing your backend is paused. You waste time logging in, waiting for things to spin back up, and only then can you continue.

I needed a way to keep my Supabase project alive without relying on real user traffic.

## My Solution: Ping the Project Daily with GitHub Actions

I came up with a simple automation using GitHub Actions workflow that runs every night, pings a public page in my project, and updates a `data.txt` file to log the visit. Then it auto-commits the change, so I also get a bonus daily green square on my GitHub contribution graph.

This keeps my Supabase project awake and helps maintain a clean commit streak. Double win.

## What the GitHub Action Does

The action runs every 24 hours using a scheduled cron job. It:

- Sends a curl request to a live route on my frontend that internally makes a call to Supabase
- Downloads the page to simulate traffic
- Checks for data.txt and creates it if missing
- Reads the last visit count, increments it, and logs the new count
- Commits and pushes the change to the repo

```yml
name: ping

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'

      - name: Ping and update
        id: update
        run: |
          curl -s [your_page_url] -o page.html

          if [ ! -f data.txt ]; then
            echo "Visits: 0" >> data.txt
          fi

          COUNT=$(grep -oP 'Visits: \K\d+' data.txt || echo 0)
          COUNT=$((COUNT + 1))

          echo "Visits: $COUNT" >> data.txt
          echo "visit_number=$COUNT" >> $GITHUB_OUTPUT

      - name: Commit and push
        env:
          GH_PAT: ${{ secrets.GH_PAT }}
        run: |
          git config user.name [your_name]
          git config user.email [your_email]
          git add data.txt
          git commit -m "update visit #${{ steps.update.outputs.visit_number }}" || echo "No changes to commit"
          git push https://x-access-token:${GH_PAT}@github.com/${{ github.repository }} HEAD:${{ github.ref_name }}
```

<b>Note</b>: The `GH_PAT` is a GitHub Personal Access Token stored securely in your repo's secrets. This allows the action to push commits back to the repo without exposing your credentials. You can generate one by following [this guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

After generating the token, go to Settings → Secrets and variables → Actions → New repository secret, and add it using the same name you reference in the workflow script.

## Why This Setup Works So Well

This tiny workflow solves two problems at once:

- Keeps your Supabase project alive by simulating traffic
- Logs visits and keeps your commit streak alive

No need for third-party uptime checkers. No need for manual clicks. And no need to write complex backend scripts.

If you're working on a Supabase project that's not yet live, this is one of the easiest and most effective ways to keep things running.

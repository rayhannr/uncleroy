---
title: Converting Notion Database to Anki Using AI
image: ./images/notion-to-anki-ai.webp
imageCaption: An image with the text "converting notion database to anki using ai"
imageCredit: Varun Goregaonkar
imageLink: https://unsplash.com/photos/a-bunch-of-fish-are-hanging-on-a-wall-gqkOAoFy_CQ
description: Sync Notion databases to Anki with AI-generated example sentences
metaDescription: Automate Notion vocabulary migration to Anki using Notion API, AI context, and Python. A technical workflow for syncing databases into SRS decks.
publishedAt: 2026-01-16T13:58:52.856Z
status: published
---

**Disclaimer**: This is not a step-by-step tutorial. This blog documents my personal workflow and the system I built to solve my own learning bottlenecks. The repository linked at the end contains all the source code, CSV data, and the final [Anki](https://apps.ankiweb.net/) deck. If you want to understand the technical details of the scripts, feel free to download the code and use an AI to explain it to you.

Since I started learning Japanese from scratch last year, I have a habit of recording every new word I encounter into a Notion database. Whether the word comes from a class, Duolingo, a video, or even a pre-made Anki deck I downloaded online, it goes straight into my collection.

While I was already familiar with Anki and used it daily for memorization, I was primarily relying on decks made by others. I realized my own valuable database of words was just sitting in Notion, unused for actual review.

To bridge this gap, I built a pipeline to automate the conversion of my personal Notion database into custom Anki flashcards. This allows me to move away from relying solely on external materials and start studying the specific vocabulary I have personally curated.

## The Limits of Integrated AI Tools

My first attempt used the Model Context Protocol (MCP) through [Antigravity](https://antigravity.google/), an AI-integrated IDE made by Google. While MCP allows AI to interact with external data, it proved unsuitable for bulk processing.

As a free-tier user without any paid subscriptions, I was hit with aggressive rate limits almost immediately. The system struggled with large row counts and was too slow to handle a database of over a thousand entries efficiently.

## Data Extraction and Enrichment

To bypass these constraints, I changed my strategy. Instead of asking the AI to read my Notion database via MCP, I prompted it to write a custom JavaScript script using [@notionhq/client](https://www.npmjs.com/package/@notionhq/client).

Using this script, I could extract my manual entries such as the word in Japanese characters, Romaji, and meaning, much faster and more reliably than using an AI-integrated crawler.

However, an Anki flashcard is significantly more effective with an example sentence. Since I only manually input the words and their meanings, I integrated an AI model to generate usage examples in either Indonesian or English.

## Finding the Right Model

Selecting the right AI model was a trial-and-error process driven by the limitations of being a free-tier user:

- OpenAI: Required a credit card and a minimum spend to access the API via SDK.

- Gemini: While powerful and free, the rate limits were too tight, causing frequent timeouts during bulk processing.

- Mistral: This became the final choice. I initially started with Mistral Small, but eventually moved to Mistral Medium, which offered significantly higher-quality example sentences while remaining accessible within a generous free tier.

## Handling AI Imperfections

It is important to note that the AI-generated content is not 100% perfect. While Mistral Medium is capable, I still encounter occasional typos, especially in the Romaji transcriptions. I treat this system as a collaborative effort: the AI does the heavy lifting of generating context at scale, and I manually fix any errors I find gradually as I encounter them during my daily Anki reviews.

## Building the Anki Deck

For the conversion to a flashcard deck, I initially tried using a JavaScript-based library. However, I ran into persistent errors that I couldn't quite resolve, likely because the library was outdated and no longer maintained. Following a recommendation from Gemini, I switched to [genanki](https://github.com/kerrickstaley/genanki). Since genanki is a Python library, using Python for this part of the process became a necessity. It has proven to be a much more stable and reliable way to generate the .apkg files.

## Automated Workflow

To make this system truly seamless, I implemented a GitHub Workflow in the repository. One of the biggest advantages is that I don't need to worry about manually adding example sentences when I record new words in Notion. I simply input the word and its meaning, and every night, the script runs automatically to generate the examples and update the Anki deck. By the time I wake up, the latest .apkg file is ready for import, ensuring my study material is always up to date without the manual grunt work.

## Resources

The source code for the extraction and the conversion script, along with the resulting CSV data and final .apkg deck, are available in my [Github repo](https://github.com/rayhannr/notion-to-anki).

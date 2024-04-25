---
title: TypeSoFast!
description: A simple 10fastfingers clone to test typing speed in Indonesian
image: /images/project/type-so-fast.webp
imageCaption: TypeSoFast! landing page UI
publishedAt: 2021-02-04T15:40:13.000Z
projectUrl: https://typesofast.vercel.app
status: published
layout: ../../layouts/Project.astro
---

I created `` `TypeSoFast!` `` to clone [10fastfingers](https://10fastfingers.com/) in Indonesian using [CRA](https://create-react-app.dev/). I compiled the dictionary by scraping articles from various news outlets.

Certainly, I didn't scrape manually. I automated the process using Python, leveraging my recent experience in scraping articles for my final research project at university, just before embarking on this project.

Initially, the project didn't function correctly on mobile devices because I relied on the `` `keydown` `` event to track keystrokes and corrections. However, this event wasn't triggered on Android Chrome.

To address this issue, I switched to using the `` `input` `` event instead. I'm unsure if there are still devices where the project doesn't run properly due to event handling issues, but as far as I can tell, it currently functions well on PC and Android Chrome.

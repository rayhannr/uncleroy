---
title: Delete Zone.Identifier files in WSL
image: /images/blog/delete-zone-identifier-files-in-wsl.webp
imageAlt: An image with the text "delete zone.identifier files in wsl"
imageCaption: An image with the text "delete zone.identifier files in wsl"
imageCredit: Kenny Eliason
imageLink: https://unsplash.com/photos/person-surfing-black-laptop-near-microwave-oven-_oKSYD2cSIk
description: Hassle-free copying files to WSL tutorial
publishedAt: 2024-07-23T14:45:20.942Z
status: published
layout: ../../layouts/Blog.astro
---

<b>TL;DR:</b> Run the code snippet below in WSL command line from the directory in which Zone.Identifier files reside

```bash
find . -name "*:Zone.Identifier" -type f -delete
```

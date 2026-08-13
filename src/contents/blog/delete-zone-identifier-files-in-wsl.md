---
title: Delete Zone.Identifier Files in WSL After Moving Files from Windows
image: ./images/delete-zone-identifier-files-in-wsl.webp
imageCaption: An image with the text "delete zone.identifier files in wsl after moving files from windows"
imageCredit: Kenny Eliason
imageLink: https://unsplash.com/photos/person-surfing-black-laptop-near-microwave-oven-_oKSYD2cSIk
description: Make sure WSL stays clean before your next commit
metaDescription: Accidentally pasted files into WSL and saw :Zone.Identifier clutter? Run one find command to wipe them all.
publishedAt: 2024-07-23T15:23:51.405Z
status: published
---

<strong>TL;DR:</strong> To quickly delete all `Zone.Identifier` files in a WSL directory, run this command in your Linux shell:

```bash
find . -name "*:Zone.Identifier" -type f -delete
```

As a software engineer working primarily on a Windows laptop, I often rely on [WSL](https://learn.microsoft.com/en-us/windows/wsl/) (Windows Subsystem for Linux) for development tasks.

Recently, I downloaded design assets from Figma and saved them in my Windows Downloads folder. After moving them into my WSL project directory, I noticed something odd. Extra files with `:Zone.Identifier` suffixes appeared alongside the actual files.

Here's what I expected:

```bash
my-project/
    ├── icon-1.svg
    └── icon-2.png
```

Here's what I got instead:

```bash
my-project/
    ├── icon-1.svg
    ├── icon-1.svg:Zone.Identifier
    ├── icon-2.png
    └── icon-2.png:Zone.Identifier
```

These metadata files are automatically created by Windows to tag files downloaded from the internet. The data inside them is minimal, just a zone ID and sometimes a URL reference, but Windows uses them to decide whether to show a security warning when you open a file. They're harmless on their own, but they can clutter your project directory or confuse tools that glob for files by extension. Git won't track them as long as they stay untracked, but they're still noise you don't want sitting around.

If you're seeing the same issue, follow these steps:

1. Navigate to your WSL project directory where the files are located (or open a Linux shell there directly from your terminal)
2. Run the following command, which will recursively find and delete all files ending in `:Zone.Identifier`:

```bash
find . -name "*:Zone.Identifier" -type f -delete
```

Running it again later won't cause any problems. If there's nothing to delete, it exits silently. Re-run it any time you paste a batch of files from Windows into a WSL project.
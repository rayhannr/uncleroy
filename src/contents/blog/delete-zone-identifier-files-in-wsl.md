---
title: Delete Zone.Identifier Files in WSL After Moving Files from Windows
image: ./images/delete-zone-identifier-files-in-wsl.webp
imageCaption: An image with the text "delete zone.identifier files in wsl after moving files from windows"
imageCredit: Kenny Eliason
imageLink: https://unsplash.com/photos/person-surfing-black-laptop-near-microwave-oven-_oKSYD2cSIk
description: Make sure WSL stays clean before your next commit
metaDescription: Accidentally pasted files into WSL and saw :Zone.Identifier clutter? Here's how to safely delete them using one simple command
publishedAt: 2024-07-23T15:23:51.405Z
status: published
---

<strong>TL;DR:</strong> To quickly delete all `Zone.Identifier` files in a WSL directory, run this command in your Linux shell:

```bash
find . -name "*:Zone.Identifier" -type f -delete
```

As a software engineer working primarily on a Windows laptop, I often rely on [WSL](https://learn.microsoft.com/en-us/windows/wsl/) (Windows Subsystem for Linux) for development tasks.

Recently, I downloaded design assets from Figma and saved them in my Windows Downloads folder. After moving them into my WSL project directory, I noticed something odd. An extra files with `:Zone.Identifier` suffixes appeared alongside the actual files.

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

These metadata files (`Zone.Identifier`) are automatically created by Windows to mark files downloaded from the internet. They're harmless, but can clutter your project or break certain tools in WSL.

If you're seeing the same issue, follow these steps:

1. Navigate to your WSL project directory where the files are located
2. Press `Shift` + right-click and choose `Open Linux shell here`
3. Run the command mentioned right after TL;DR above which will recursively find and delete all files ending in `:Zone.Identifier`.

After running the command, your directory should only contain the actual copied files without the unwanted metadata.

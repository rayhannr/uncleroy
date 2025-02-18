---
title: Delete Zone.Identifier files in WSL
image: ./images/delete-zone-identifier-files-in-wsl.webp
imageCaption: An image with the text "delete zone.identifier files in wsl"
imageCredit: Kenny Eliason
imageLink: https://unsplash.com/photos/person-surfing-black-laptop-near-microwave-oven-_oKSYD2cSIk
description: If you are a software engineer, make sure to do this before pushing your changes
publishedAt: 2024-07-23T15:23:51.405Z
status: published
---

<strong>TL;DR:</strong> Run the following code snippet in the WSL command line from the directory where the Zone.Identifier files are located.

```bash
find . -name "*:Zone.Identifier" -type f -delete
```

I use a Windows laptop and rely on [WSL](https://learn.microsoft.com/en-us/windows/wsl/) (Windows Subsystem for Linux) for my daily work as a software engineer.

One day, I needed to download some design resources from [Figma](https://www.figma.com/). These resources were initially saved in Windows' Downloads directory, so I had to cut and paste them into my project directory in WSL.

However, some unexpected files with the `Zone.Identifier` suffix were also pasted.

```bash
# Expectation
my-project/
    ├── icon-1.svg
    └── icon-2.png

# Reality
my-project/
    ├── icon-1.svg
    ├── icon-1.svg:Zone.Identifier
    ├── icon-2.png
    └── icon-2.png:Zone.Identifier
```

If you encounter the same situation, follow these steps:

1. Open the WSL directory where you pasted the files
2. Press `Shift` + right-click
3. Choose `Open Linux shell here`
4. Run the command mentioned right after TL;DR above

After completing these steps, the `Zone.Identifier` files should be removed from the directory.

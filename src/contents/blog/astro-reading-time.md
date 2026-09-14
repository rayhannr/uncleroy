---
title: Display Estimated Reading Time in Astro Blog Posts
image: ./images/astro-reading-time.webp
imageCaption: An image with the text "display estimated reading time in astro blog posts"
imageCredit: Callum Shaw
imageLink: https://unsplash.com/photos/gray-laptop-beside-white-teacup-and-book-TLxaYmixZ3k
description: Show estimated reading time on your Astro blog using the reading-time package
metaDescription: Learn how to add estimated reading time to your Astro blog posts using the reading-time npm package. A quick, lightweight setup with no extra dependencies.
publishedAt: 2024-11-28T14:55:55.043Z
status: published
---

Medium shows a small "10 min read" label on every post. It's a simple touch that sets expectations before a reader commits. You can add the same thing to your [Astro](https://astro.build/) blog using the `reading-time` package. It takes maybe ten minutes to wire up.

## What you'll need

This tutorial assumes you're already comfortable with:

- Setting up and running an Astro project
- Working with [layouts](https://docs.astro.build/en/basics/layouts/) in Astro

If you're new to Astro, check out their official [getting started guide](https://docs.astro.build/en/getting-started/) before continuing.

## Steps

### Install the reading-time package

Run the following command in your project directory:

```bash
npm install reading-time
```

### Create a utility function

```ts
// src/utils/readingTime.ts
import readingTime from 'reading-time'

export const getReadingTime = (content: string) => {
  const { minutes, text } = readingTime(content)
  return Math.round(minutes) < 1 ? 'Less than 1 min read' : text
}
```

This function returns a string like "3 min read" or "Less than 1 min read" based on content length.

### Use it inside your layout

```astro title="src/layouts/Blog.astro"
---
import type { MarkdownLayoutProps } from 'astro'
import { getReadingTime } from '../utils/readingTime'

interface BlogProps {
  title: string
  author: string
  date: string
}
type Props = MarkdownLayoutProps<BlogProps>
const { rawContent, frontmatter } = Astro.props
const { title, author, date } = frontmatter
---

<article>
  <header>
    <span>{author}</span>
    <span>{date}</span>
    <span>{getReadingTime(rawContent)}</span>
  </header>
  <h1>{title}</h1>
  <slot />
</article>
```

`rawContent` is the Markdown source of the post. The utility reads it to compute the estimate.

## Example

Given this post:

<!-- prettier-ignore -->
```md wrap
<!-- src/pages/blog/reading-time.md -->

title: Reading Time
author: Rayhan NR
date: Nov 28, 2024
layout: ../../layouts/Blog.astro

---

This is a dummy content estimated to take approximately 2 minutes to read
```

The rendered HTML will look like:

```html wrap
<article>
  <header>
    <span>Rayhan NR</span>
    <span>Nov 28, 2024</span>
    <span>2 min read</span>
  </header>
  <h1>Reading Time</h1>
  <p>This is a dummy content estimated to take approximately 2 minutes to read</p>
</article>
```

## Worth adding?

Reading time sets expectations before someone commits to a post, which tends to reduce bounce for longer content. For short posts it's a nice-to-have; for long-form tutorials it actually matters. Either way, the `reading-time` package is lightweight. It runs at build time, so there's no extra cost at runtime.

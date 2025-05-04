---
title: Display Estimated Reading Time in Astro Blog Posts
image: ./images/astro-reading-time.webp
imageCaption: An image with the text "display estimated reading time in astro blog posts"
imageCredit: Callum Shaw
imageLink: https://unsplash.com/photos/gray-laptop-beside-white-teacup-and-book-TLxaYmixZ3k
description: Add clarity to your content by showing how long each post takes to read
metaDescription: Enhance your Astro blog with estimated reading times for each post. A lightweight feature that improves readability and user engagement.
publishedAt: 2024-11-28T14:55:55.043Z
status: published
---

Ever read a blog post on Medium and noticed the small reading time label like "10 min read"? It's a simple feature that enhances the reading experience by setting clear expectations. The good news? You can easily add this functionality to your own [Astro](https://astro.build/)-based blog in just a few steps.

In this blog, we'll walk through how to display an estimated reading time using the `reading-time` package in an Astro project.

## What You'll Need

This tutorial assumes you're already comfortable with:

- Setting up and running an Astro project
- Working with [layouts](https://docs.astro.build/en/basics/layouts/) in Astro

If you're new to Astro, check out their official [getting started guide](https://docs.astro.build/en/getting-started/) before continuing.

## Steps

### Install the Reading Time Package

Run the following command in your project directory:

```bash
npm install reading-time
```

### Create a Utility Function

Create a utility function to calculate reading time from the raw blog content.

```ts
// src/utils/readingTime.ts
import readingTime from 'reading-time'

export const getReadingTime = (content: string) => {
  const { minutes, text } = readingTime(content)
  return Math.round(minutes) < 1 ? 'Less than 1 min read' : text
}
```

This function returns a string like "3 min read" or "Less than 1 min read" based on content length.

### Use It Inside Your Layout

In your blog layout component, call the utility and pass in the raw Markdown content.

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

`rawContent` contains the Markdown source of the blog post and is used here to compute the reading time dynamically.

## Example

Let's say you have the following blog post:

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

## Why Add a Reading Time Estimator?

Adding an estimated reading time:

- Improves UX by setting expectations
- Boosts engagement, especially for mobile readers
- Adds polish to your blog layout with minimal effort

Whether your posts are short updates or long-form tutorials, it's a small feature that creates a more reader-friendly experience.

## Conclusion

By using a simple utility and the `reading-time` package, you can quickly implement a reading time indicator for any Markdown blog post in Astro. It's a lightweight addition that adds real value for your readers.

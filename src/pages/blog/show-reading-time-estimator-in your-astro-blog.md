---
title: Show Reading Time Estimator in Your Astro Blog
image: /images/blog/show-reading-time-estimator-in-your-astro-blog.webp
imageCaption: An image with the text "show reading time estimator in your astro blog"
imageCredit: Callum Shaw
imageLink: https://unsplash.com/photos/gray-laptop-beside-white-teacup-and-book-TLxaYmixZ3k
description: Show a reading time estimator as if you were writing on Medium
publishedAt: 2024-11-28T14:55:55.043Z
status: published
layout: ../../layouts/Blog.astro
---

If you’ve ever read a blog on Medium, you’ve probably noticed the reading time estimator (e.g., "10 min read") displayed next to the author’s avatar. Adding a similar feature to your website is simple! In this post, I’ll show you how to implement it using [Astro](https://astro.build/).

## Prerequisite

To keep this blog concise, I won’t dive deep into Astro concepts. Instead, I’ll assume you’re already familiar with:

- Setting up an Astro project
- Using Astro [layouts](https://docs.astro.build/en/basics/layouts/)

## Steps

- Install the `reading-time` package

  ```make
  npm install reading-time
  ```

- Create a utility function to calculate the reading time from a given text using the package

  ```ts
  // src/utils/readingTime.ts
  import readingTime from 'reading-time'

  export const getReadingTime = (content: string) => {
    const { minutes, text } = readingTime(content)
    return Math.round(minutes) < 1 ? 'Less than 1 min read' : text
  }
  ```

- Use the utility function in your layout component

  ```astro
  <!-- src/layouts/Blog.astro -->
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

  - `rawContent` refers to your blog content, usually written in `Markdown`, and will replace `<slot />` in the generated markup

## Example

Suppose we have a Markdown blog post that utilizes the `Blog` layout defined earlier and will be accessible at `/blog/reading-time` on our website, as illustrated below:

```md
<!-- src/pages/blog/reading-time.md -->
title: Reading Time 
author: Rayhan NR 
date: Nov 28, 2024 
layout: ../../layouts/Blog.astro
---

This is a dummy content estimated to take approximately 2 minutes to read
```

The resulting markup will look like this

```html
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

And that’s how you can add a reading time estimator to your Astro blog, enhancing the user experience by giving readers a quick idea of how long it will take to read your content.

---
title: Optimizing Vite Bundles with rollup-plugin-visualizer
image: ./images/optimizing-vite-bundles-with-rollup-plugin-visualizer.webp
imageCaption: An image with the text "optimizing rollup bundles with rollup-plugin-visualizer"
imageCredit: Luke Chesser
imageLink: https://unsplash.com/photos/graphs-of-performance-analytics-on-a-laptop-screen-JKUTrJ4vK00
description: Using visualizer plugin to analyze module sizes and optimize Vite builds
publishedAt: 2025-04-17T14:50:03.517Z
status: published
---

[Vite](https://vite.dev/) is one of the most popular tools for building modern web apps. It's fast, efficient, and great out of the box. But as your app grows, your bundle might too—and that's when performance starts to slip.

To figure out what's bloating your build, try `rollup-plugin-visualizer`. It gives you a clear, visual breakdown of your bundle—highlighting large dependencies, duplicate modules, and how your code is split. It's basically an x-ray for your build.

Here's how to integrate `rollup-plugin-visualizer` into a Vite project and how to read the output to start trimming unnecessary bytes.

## Prerequisite

This blog assumes you're already familiar with building a web app using Vite, so make sure you have a Vite project set up—I won't be covering how to initialize one.

If you use [Rollup](https://rollupjs.org/) instead of Vite, this guide will more or less works as well.

## Steps

- Install `rollup-plugin-visualizer`

  ```make
  npm install --save-dev rollup-plugin-visualizer
  ```

- Add it in your `vite.config.ts` file

  ```ts
  import { visualizer } from 'rollup-plugin-visualizer'

  export default defineConfig({
    plugins: [
      // put it the last one
      visualizer()
    ]
  })
  ```

- Run the build script, typically with this command

  ```make
  npm run build
  ```

With these three steps, Vite will build your production-ready bundle, and `rollup-plugin-visualizer` will generate a `stats.html` file—located in the same directory as your `vite.config.ts`—that you can open in your browser to start analyzing your bundle.

## Example

![`rollup-plugin-visualizer result of one of my app`](./images/visualizer-result.png)

Here's the bundle visualization of my [Spoticeipt](/project/spoticeipt) app. As shown, `html2canvas` takes up the largest portion. When hovering over it, the report shows a size of 441.22KB.

However, this isn't the actual size used in production—while the visualizer estimates the full bundle at 1.35MB, the actual size after compression is about 660KB. So, we can estimate `html2canvas` to be roughly 215.7KB in the final output.

This is still relatively large for a single dependency. With that insight, I might consider switching to a lighter alternative or implementing just the parts I need manually to reduce the total bundle size.

And that's how you can integrate and use rollup-plugin-visualizer to inspect the contents of your production bundle—pretty straightforward, right?

With a clear visualization of your module composition and size distribution, you'll be able to pinpoint large dependencies, detect duplicated modules, and make smarter performance decisions—whether that's through lazy loading, swapping out libraries, or removing unused code altogether.

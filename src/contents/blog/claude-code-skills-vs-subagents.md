---
title: No More Skill Issues (or Subagent Ones)
image: ./images/claude-code-skills-vs-subagents.webp
imageCaption: A billboard reading "no more skill issues"
imageCredit: Igor Shalyminov
imageLink: https://unsplash.com/photos/billboard-reads-no-more-skills-issues-OEmWOzDUx0g
description: Claude Code skills and subagents, compared
metaDescription: Claude Code skills and subagents differ in context, execution, and invocation. A breakdown of those differences, which one to reach for, and the ones I use to write and review content on this site.
status: published
publishedAt: 2026-07-30T09:58:38Z
---

It hasn't been long since my last post, and here I am writing another one already. A few years back I'd go months, sometimes almost a year, between posts. Lately it's been every week or so, and a lot of that comes down to Claude Code taking over the chores I used to dread, writing included.

That's the pattern behind this post too. When there's a chore you keep repeating with roughly the same input and output, and it takes several steps or is just boring enough that you dread it, you don't want to re-explain the whole thing to an agent every time. You want to hand over the context once and then delegate. Claude Code gives you two ways to do that: skills and subagents. These are the tools we use at my office, so what I know about them comes from work rather than documentation.

They look the same on the surface. Both are a markdown file where you describe a task, lay out the steps, and set some rules. But the way they run is genuinely different, and once the mechanics click, it's obvious why you'd reach for one over the other.

## How skills and subagents differ

### Context

A subagent gets its own context window, separate from the main chat session, and only hands back the final result. A skill has no such separation. It runs inside the main session, so everything it does piles onto the context you're already chatting in.

### Blocking

That separation changes how you work while one is running. Kick off a subagent and you can keep talking in the main session while it works in the background, roughly like calling an async function. A skill blocks you until it finishes or you open a new session.

### Invocation

Both can get summoned automatically, but only a skill gives you an explicit `/{skill-name}` to type yourself. A subagent has no slash-command equivalent, you either let the main agent pick it or name it directly in plain language.

### Configuration

Subagents also give you a knob skills don't: you can restrict which tools they access and which model they run on. A skill just uses whatever the current session already has.

None of this adds up to a rule like "always use a subagent for X." These are mechanics, and you match them against whatever you're building.

## The subagents I built for this site

There are four subagents for maintaining this website: a content auditor and a content writer, each split into a blog version and a project version.

The auditor takes a draft, whatever rough notes I've pushed here, and checks it against the writing rules I've set for this site. It flags what's off and reports back to the main agent. That context then goes to the writer subagent, which composes the real post from it.

The writer isn't paraphrasing my draft. It writes the post from scratch, using the draft as raw material. And the auditor isn't only a first-draft gate. I can point it at something already published and get it checked again, which is what happened to this post.

Blog and project are split because they get graded on completely different things. A project post has to explain itself through situation, task, action, result, so the writer for that shapes everything around STAR. A blog post cares about SEO instead: title, slug, description, all of that. Rather than cram both into one subagent and hope it context-switches correctly, I kept them separate.

## The blog cover generator skill

Before this skill existed, making a cover image for a post was a manual slog. I'd find a background photo on Unsplash, spin up this site's local dev server pointed at an Astro page that overlays text on a background image, swap in the image I downloaded and the post's title, take a screenshot (which auto-saves as a PNG), convert that PNG to webp with an online tool, then set the cover path in the post's frontmatter.

The [skill](https://github.com/rayhannr/uncleroy/blob/master/.claude/skills/blog-cover/SKILL.md) now handles all of that:

1. I give it the Unsplash page link and the slug.
2. It downloads the image and fills in the credit and link in the post's frontmatter.
3. It spins up the dev server and hits the cover route with the background and title as query params.
4. It screenshots the result headlessly.
5. It converts the PNG to webp, stepping quality down until the file's under 100KB.
6. It drops the final image into the blog's images folder and cleans up after itself.

Picking the background photo is the one part I kept manual on purpose. Choosing a photo that suits the post is a judgment call, and I'd rather make it myself than hand it to a model and hope.

## Why not just write a script for all this

A script only does what you explicitly coded it to do. Every variation has to be anticipated up front as a flag or an argument, and anything you didn't think of either breaks loudly or does the wrong thing quietly. With a subagent or a skill, you describe what changed in plain language and it adjusts.

The cover generator shows this well. Hand it an Unsplash link where the og:image tag is missing or the dimensions come back weird, and a plain script would just fail. The skill can work around it, find another way to get the asset, and keep going. Same with the auditor and writer pipeline. A script checking "writing rules" would need every rule spelled out as a regex or a condition, whereas the auditor subagent reads the draft, works out what's wrong with the phrasing or the structure, and explains what it found.

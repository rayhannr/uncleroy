# uncleroy

Personal site of rayhannr: blog, project showcase, book reviews. Astro (static output, Vercel adapter), Tailwind v4, TypeScript, Bun.

## Commands

```
bun run start     # astro dev, port 3000
bun run build     # astro build
bun run preview   # astro preview
```

## Content

Two collections, both defined in `src/content.config.ts` as a discriminated union on `status`, so a `draft` may omit `publishedAt` and a `published` post may not.

| | Blog | Project |
|---|---|---|
| Files | `src/contents/blog/*.md,mdx` | `src/contents/project/*.md` |
| Images | `src/contents/blog/images/` | `src/contents/project/images/` |
| Extra frontmatter | `imageCredit`, `imageLink`, `metaDescription` (optional) | `projectUrl` (nullish) |

Both need `title`, `image`, `imageCaption`, `description`, `status`. Files prefixed with `_` are ignored by the glob loader.

URL slug comes from the filename. Renaming a published post breaks its URL, so add a redirect in `astro.config.mjs` instead, alongside the existing ones.

## Writing

`.claude/rules/writing-style.md` is the authority for anything written for this site. Read it before drafting or editing a post. Two clarifications that aren't obvious from that file alone:

- Frontmatter `title` uses Title Case. The lowercase-particle rule applies only to headers in the body, which are sentence case.
- The ban on question words and colons covers `title` and `description`, but `metaDescription` is exempt because it's for search results.

Helper skills already in this repo: `blog-cover` (builds a post cover from an Unsplash link via the dev-only `/cover` route) and `publish` (flips a draft to published, sets `publishedAt`, commits). Subagents for drafting and auditing posts live in `.claude/agents/`.

## Gotchas

- `human.md` in the repo root is raw source material for a project post, not documentation for this repo.
- `plugins/` holds two local remark/rehype plugins wired into `astro.config.mjs`. They aren't npm packages.

<!-- antislop:start -->
## antislop

For copy, UI, accessibility, mobile layout, or code-comment work, invoke the `antislop` skill (the core filter) and then the skill for the task: `antislop-copywriting`, `antislop-ui`, `antislop-human`, `antislop-layoutmobile`, or `antislop-code`. These are installed as Claude Code skills and invoked by name, not as files in this repo.

For prose specifically, `antislop-copywriting` and `humanizer` overlap but catch different things. Running both on a post finds more than either alone.

Before starting, ask when antislop applies: during the work, or as an audit after it's done.
<!-- antislop:end -->

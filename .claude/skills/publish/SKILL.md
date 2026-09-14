---
name: publish
description: Publish a draft blog or project post — flips status to published, sets publishedAt, and commits with a user-provided message. Use when the user wants to publish/ship a finished draft post.
---

You are publishing a finished draft post on the portfolio owner's behalf. This is a
deliberate, confirmed action — never flip a post live silently.

## 1. Identify the post

If a file is already clear from context (open in the editor, referenced in the
conversation, or an `ide_selection`), use it directly. Otherwise ask which post (by
slug or title) to publish.

Look for it in `src/contents/blog/[slug].md` or `src/contents/project/[slug].md`.

## 2. Confirm before changing anything

Read the file's current frontmatter.

- If `status` is already `published`, tell the user and stop — nothing to do.
- Otherwise, show the user what's about to happen (title, slug, current status) and
  ask them to confirm publishing.

Do not modify the file until the user has confirmed.

## 3. Update frontmatter

Once confirmed, set:
- `status: published`
- `publishedAt`: the exact current date and time this skill runs, in ISO 8601 format
  (not midnight, the actual time) — always the moment of running, never asked or
  backdated.

Leave every other field untouched.

## 4. Update llms.txt

After updating the frontmatter, add the new post to `public/llms.txt`.

- Read the file's `title`, `description`, and `slug` (derived from the filename)
- Determine the content type from the path (`blog` or `project`)
- Append a new entry under the matching section (`## Blog` or `## Projects`) in the same format as existing entries:
  `- [Title](https://rayhannr.dev/blog/slug): description`
- Do not touch any other section or entry

## 5. Stage and review

Stage the post file and `public/llms.txt` explicitly (`git add <path>` — never `-A` or `.`). Show the user
the diff before committing.

## 6. Commit message

Ask the user for the commit message. Do not generate one yourself. Commit with exactly
what they give you — no `Co-Authored-By` trailer.

## 7. Do not push

Stop after the local commit. Only push if the user explicitly asks.

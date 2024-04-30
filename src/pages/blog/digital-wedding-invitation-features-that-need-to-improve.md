---
title: Digital Wedding Invitation Features That Need to Improve
image: /images/blog/digital-wedding-invitation-features-that-need-to-improve.webp
imageAlt: An image with the text "digital wedding invitation features that need to improve"
imageCaption: An image with the text "digital wedding invitation features that need to improve"
imageCredit: Iman soleimany zadeh
imageLink: https://unsplash.com/photos/white-dove-figurine-surrounded-by-string-lights-on-table-2mxwz9uFqcY
description: If someone invites me to their wedding, I hope these features are improved in the invitation.
publishedAt: 2024-04-30T15:01:20.942Z
status: published
layout: ../../layouts/Blog.astro
---

Since last year, I've been receiving wedding invitations from friends my age, all of which were digital invitations in the form of a website. However, there were two features common to all these invitations that annoyed me.

- <b>Autoplay audio</b>

  Upon first load, the invitation is silent. However, as soon as I click the `` `Open Invitation` `` button, background music starts playing without warning. I'm often caught off guard by this automatic audio playback and immediately scramble to find the stop button or lower my device's volume.

  I strongly believe that unless explicitly triggered by a play button, no audio should play. Otherwise, it becomes particularly bothersome, especially when receiving invitations in quiet public settings like a library, where unexpected loud audio can disrupt others and cause embarrassment.

  While autoplay audio isn't inherently negative, it should be calming and not overly loud. [dogstudio.co](https://dogstudio.co/) provides an excellent example of this.

  <br class="hidden" />

- <b>Excessive animation</b>

  Animation can significantly enhance the user interface and isn't necessarily detrimental. [bijakmemilih.id](https://www.bijakmemilih.id/) and [Github](https://github.com/)'s landing and signup pages exemplify this well.

  In the context of the invitations I received, animation becomes bothersome for several reasons:

  - <b>Overly used:</b> Everything is animated with instances of animations nested within others. For example, the parent element may animate from top to bottom while the child element simultaneously animates from left to right.
  - <b>Slow transition:</b> I find animation durations of 500ms or greater to be sluggish and unpleasant, particularly when involving opacity transitions from very low to full.
  - <b>Large transition distance:</b> Large distances, regardless of animation speed, create a peculiar UI, in my opinion. For example, when an element is animated from bottom to top over a distance of 250px.

These two issues motivated me to address them in my own wedding invitation template which you can find the details [here](/project/folklore-invitation). It showcases minimal animation, and the audio will commence only when the visitor clicks the play button located at the bottom right corner of the screen.

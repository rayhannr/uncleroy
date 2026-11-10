---
title: 'Hajj Ticket War Part 3: Requirements'
image: ./images/hajj-ticket-war-part-3.webp
imageCaption: 'An image with the text "hajj ticket war part 3: requirements"'
imageCredit: Hakam Magdea Fardana Ansie
imageLink: https://unsplash.com/photos/people-pray-in-a-beautiful-mosque-oMSPhjE2e4Q
description: Functional needs and hard limits for a hajj registration system
metaDescription: Part 3 of a hypothetical hajj ticket war series. The requirements for the registration system, from what each stage must do to the things it must never do.
status: published
publishedAt: 2026-11-09T14:47:05.000Z
---

Before designing anything, I want to write down what the system has to do and what it can never do.

The rules from part 1 come down to five stages, numbered 0 to 4. They open one after another, and a later stage only opens if the earlier ones leave seats.

## What the system has to do

- Each province has its own quota, and the stages fill it in order. So the system has to know, per province and per season, how many seats exist and how many are left.

- Stage 0 comes off the top. Pilgrims who paid in full and deferred take next year's quota first, and whatever remains goes to the stages after it.

- Stage 1 needs no registration. The system already knows who is scheduled this season, so it only has to open payment for them and for the elderly, oldest first, up to 5% of the quota.

- Stage 2 is where the system has to decide who gets to pay. It invites people by queue number, up to the number of seats left, and each invitation holds a seat for one wave of the window. A seat that isn't paid goes to the next person in line in the next wave.

- Stage 3 and stage 4 are first pay first served. Whoever pays first gets the seat and the system stops taking payments the moment the quota is full.

- Companions of the elderly, disabled pilgrims, and pilgrims who must travel with a close relative need two seats held together. Either both are held or neither is.

- Before anyone can pay, they need to pass a health check at a healthcare facility. In stages 1 and 2, the system has to refuse payment from anyone who hasn't.

  In the wars of stages 3 and 4, it should refuse them earlier and keep them out of the war entirely.

## What it must never do

- Never give out more seats than a province's quota. This is the one that matters most. Every other requirement can be bent a little, this one can't.

  ![One province with a quota of 42,409 seats, filled in order by 2409 deferred pilgrims in stage 0, 28k scheduled this season plus elderly in stage 1, 8k by queue number in stage 2, and 4k first pay in stage 3, with a dashed line at the end marking that no seat 42,410 can be given out and stage 4 never opens](./images/hajj-quota-stages.svg)

- It must not take money for a seat it can't give. If someone pays and the seat is already gone, that payment has to be caught and returned.

  A seat nobody paid for is a small problem. Money taken for a seat that doesn't exist is a bad one.

- Seats can't move between provinces. Quota and queue numbers are per province, and I'm keeping it that way to keep the design simple.

- Speed can't decide a protected stage. In stages 1 and 2 the schedule and the queue number decide who gets a seat, so paying faster changes nothing. Speed only matters in stages 3 and 4.

- Every seat and every payment needs a record of who, when, and for which stage. When someone asks why they didn't get a seat, the system has to be able to answer.

## How it has to behave

Stage 3 is a burst. The queue is millions of people and the seats are a few thousand per province, so the system has to stay up when everyone arrives in the same minute, and it has to answer correctly even when it's slow.

A payment can be retried. People will press the button twice, or the network will drop mid-payment. Paying twice can't take two seats or charge twice.

The windows are short, 7 to 18 days, and the stages run one after another. So the system can't be down for a day without eating into the next stage's time.

## What I'm leaving out

Anything after registration closes is out of scope, as I said in part 1. So are the choice of payment provider and the app's screens. This series is about the part that decides who gets a seat.

The next part puts numbers on all of this, so we can see which requirement is actually the hard one.

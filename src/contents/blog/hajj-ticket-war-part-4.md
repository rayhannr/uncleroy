---
title: 'Hajj Ticket War Part 4: Estimation'
image: ./images/hajj-ticket-war-part-4.webp
imageCaption: 'An image with the text "hajj ticket war part 4: estimation"'
imageCredit: Faqih Abdul
imageLink: https://unsplash.com/photos/a-tall-building-with-a-clock-on-the-top-of-it-UXkhVbM_nB4
description: Rough load numbers for each stage of the war
metaDescription: Part 4 of a hajj ticket war series. Rough numbers for each stage, the burst in stage 3, and how the stage windows fit the Saudi deadline.
status: published
publishedAt: 2026-11-11T15:03:16.000Z
---

Part 3 listed what the system has to do. This part puts numbers on it, to find out which requirement is the hard one.

The real inputs are the queue of about 5.8 million people, the 2026 regular quota of about 203k seats, and East Java's 42k seats from part 1. The rest are the made-up numbers from the part 1 example, plus a few scenarios that I'll label as scenarios.

The example numbers from part 1 are East Java's. To size the whole system, I apply the same split to the national quota of about 203k seats. All provinces follow the same stage calendar. For this estimate, I assume the war stages, 3 and 4, happen on the same day in every province.

Putting every province's war on the same day isn't ideal in practice. It makes overloading the server likely, and some provinces may have no seats left while others still do. People only compete with others from their own province, so nothing forces every province onto one day. Scheduling them per province group comes in a later part.

## Windows follow the deadline

The deadline is fixed and the windows adjust to it. In part 1 I gave each stage a window length, but those were example numbers for one season.

Take the 2026 season. Registration opened on November 24th 2025, and Saudi Arabia's cutoff for pilgrim data was February 8th. That's 76 days. The real payment window in 2026 closed on January 23rd, 16 days before the cutoff, and I'm doing the same here. That leaves 60 days.

The stages don't run back to back. I leave 3 days between stages, so one stage can close cleanly before the next opens. Stage 2 runs in three waves, with 1 day between waves. That's 11 days of breaks, which leaves 49 days of windows.

I split those 49 days in the ratio 14 : 18 : 7 : 5 for stages 1 to 4. That gives roughly 16, 20, 8 and 5 days. When a season is shorter, stage 1 keeps a minimum of 14 days and the other stages shrink, because stage 1 has the most people and they need the most time to prepare the money.

Stage 4 is a war that will be sold out in hours or minutes, so its 5 days are only a maximum for the rare case where it doesn't sell out. The time to prepare the hajj payment and pass the health check moves to before registration opens, through the schedule announced months ahead.

The start date also moves every year, because registration only opens after the cost and the quota are settled. In 2026 that was late October and mid November.

## Stages 0, 1 and 2 are light

Everyone in stages 0 to 3 is already in the queue, so nobody registers again. Only stage 4 takes new registrants.

Stage 0 is 2k people in East Java in the example, so about 10k nationwide. They already paid in full, so no payments happen in this stage. The system only carries the list over.

Stage 1 is about 200k people nationwide scheduled to depart this season, and they pay over a window of about 16 days. That's roughly 12.5k payments a day, or one every 7 seconds. The average hides the peaks, which come right after the window opens and just before it closes.

Say 20% of them pay in the first 10 minutes and another 20% in the last 10. Each of those is 40k payments in 600 seconds, about 67 a second. That's still small, and nobody is competing for a seat.

Reserves add up to 0.5% of the quota, about 1k more payments, which doesn't change the picture.

Stage 2 only invites as many people as there are seats left, which is 10k in East Java in the example, so about 48k nationwide. So the crowd is limited by the system, not by how many people want a seat.

None of these stages is a race. The system decides who is allowed to pay, so the load stays small.

## Stage 3 is the burst

Stage 3 is open to everyone scheduled more than 4 years out. Nationally that's the queue minus this season and the next four, which is 5.8 million minus about 1 million, so roughly 4.8 million people.

In the example East Java has 200 seats in stage 3, which scales to about 1k nationwide. So the pool is about 4.8 million people for 1k seats, which is about 5k people for every seat.

Only people who are ready can enter, meaning the health check is passed and the payment is prepared, so the pool is smaller than 4.8 million. Say one in ten are ready, 480k people. In the first minute that's 480k requests, or 8k a second, nationwide. If everyone were ready, it's 80k a second.

East Java holds about a fifth of the quota. If one in ten are ready, it alone is about 2k a second, the most of any province.

Only 1k of those requests can succeed. If one in ten are ready, about 99.8% of the requests have to be turned away, and if everyone is, about 99.98%. So rejecting has to be the cheapest thing the system does.

## Stage 4 without the old queue

Stage 4 is open to people who never registered, and it typically stays closed because stage 3 uses up the seats first. In practice it only matters once the old queue is gone, which could be about 26 years away. From then on it's the only stage that sells seats, and the whole quota of about 203k seats goes first pay first served.

Nobody in stage 4 is on a list beforehand, and everyone has to pay in full up front, so let's assume there won't be many people. Say the crowd is 1 million. That's about 5 people per seat.

Everyone in every province registers on the same day. That's 1 million requests in the first minute, or about 17k a second.

The load moves from rejecting to completing. Up to 203k reservations and payments are written, roughly 200 times the 1k in stage 3, and every province still has to count its seats exactly.

## Reads and writes

Stage 3 is read heavy by volume. Say each of the 480k people reloads the page every 2 seconds to check whether seats are left, during the first minute. That's 30 reads each, 14 million in a minute, or 240k a second. The payment attempts from above are 8k a second, so reads outnumber attempts 30 to 1.

Almost none of those attempts change anything. There are only 1k seats, so at most 1k reservations and 1k payments are ever written. Every other attempt is rejected, and a rejection doesn't change a seat.

So the system serves a lot of reads, and its few writes all fight over one counter per province, the number of seats left. Reads can be copied and spread out. The counter can't.

## How much data

The queue is 5.8 million records. At roughly 200 bytes each, that's about 1.2 GB, which fits in the memory of one machine. Reservations and payments are bounded by the number of seats, so they're small next to the queue.

## Bandwidth

Say each request and response is about 1 KB. In the first minute, the 480k ready people send 240k reads and 8k payment attempts a second, which add up to 248k requests a second, which is about 248 MB a second, or roughly 2 Gbps. If all 4.8 million were ready, not just one in ten, it's 10 times that, about 20 Gbps.

East Java is about a fifth of either number. Bandwidth is only large if everyone is ready, and it comes from the same burst that already decides the design.

## The number that limits the design

It's the 5k people per seat in stage 3. Payment volume is small, storage is small, and stages 0 to 2 are small. The pressure is on one counter per province during the first minute of the war.

That counter is also the requirement from part 3 that can't be bent, never giving out more seats than the quota. Scheduling provinces on different days would spread the national peak, but it wouldn't ease the pressure on one province's counter. So the next parts build around the counter, starting with the data model.

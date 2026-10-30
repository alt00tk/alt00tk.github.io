---
title: "Is It Acceptable to Change Business Processes Because of Technical Constraints?"
description: "When is it acceptable to change business processes because of technical constraints? I consider the relationship between technology and business processes, starting from business value."
publishedAt: "2026-10-02T22:43:00+09:00"
---

Even when we work out a business process from the business value we want to provide, technical constraints can make it unworkable as designed.
When that happens, is it acceptable to change the business process to fit the technology?

At first, I thought the natural approach was to preserve the existing business process as much as possible and accommodate the constraints through implementation choices or technology selection.
If the characteristics of a database do not fit, for example, I would first look into choosing a different technology.

But I want to pause and ask whether preserving the business process itself has become the goal.

## What we need to preserve is business value, not the business process

Both business processes and technology are means of delivering the business value we want to provide.

Consider selling tickets fairly even under heavy traffic.
If a process of “select a seat → immediately confirm the purchase” is technically unworkable, introducing a queue or a temporary reservation might preserve that value.

It seems better to understand this as discovering, through technical constraints, that the current business process cannot deliver the value, then returning to the higher-level business value to redesign the process, rather than as prioritizing technology over the business.

Even for a new service, the sequence is not necessarily always “business process → technology.”
We might also start with what a new technology makes possible, consider the value it could offer, and create a business process to fit.

## On what basis should we change a business process?

That does not mean technical difficulty alone justifies changing a business process.

A change may come at a cost: longer waits, more steps for users, or a period of uncertainty before confirmation.
At the same time, it may bring stability, fairness, or certainty.

For now, I think it is acceptable to change a business process because of technical constraints when we can explain what the change gains and loses, and have reached agreement with the business side on that trade-off.

There is still the question of who should make that decision.
At the very least, though, I think it matters to recast technical constraints as a question of business value and discuss them in those terms, rather than ending with “we have to change it because of technical limitations.”

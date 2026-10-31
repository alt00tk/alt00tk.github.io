---
title: "Is It Acceptable to Change Business Processes Because of Technical Constraints?"
description: "When is it acceptable to change business processes because of technical constraints? I consider the relationship between technology and business processes, starting from business value."
publishedAt: "2026-10-02T22:43:00+09:00"
---

Even when we work out a business process from the business value we want to provide, technical constraints can make it unworkable as designed.
When that happens, is it acceptable to change the business process to fit the technology?

At first, I thought the natural approach was to preserve the existing business process as much as possible and accommodate the constraints through implementation choices or technology selection.
For example, if a database's characteristics were unsuitable, I would first explore whether another technology would be a better fit.

But I want to pause and ask whether preserving the business process itself has become the goal.

## What we need to preserve is business value, not the business process

Both business processes and technology are means of delivering the business value we want to provide.

Consider how to sell tickets fairly even when large numbers of users access the system at once.
If a process of “select a seat → immediately confirm the purchase” is technically unworkable, introducing a queue or a temporary seat hold might preserve that value.

Rather than seeing this as prioritizing technology over business needs, it seems better to view it as a case where technical constraints reveal that the current process cannot deliver the intended business value. We then return to that higher-level value and redesign the process accordingly.

Even for a new service, the sequence is not necessarily “business process → technology.”
We might also start by considering what a new technology makes possible, identify the value it could provide, and design a business process around that value.

## On what basis should we change a business process?

That does not mean technical difficulty alone justifies changing a business process.

A change may come at a cost: longer waits, more steps for users, or a period of uncertainty before confirmation.
At the same time, it may bring stability, fairness, or certainty.

For now, I think changing a business process because of technical constraints is acceptable when we can explain what we gain and give up through the change, and have reached agreement with the business side on that trade-off.

There is still the question of who should make that decision.
At the very least, though, I think it matters to recast technical constraints as a question of business value and discuss them in those terms, rather than ending with “we have to change it because of technical limitations.”

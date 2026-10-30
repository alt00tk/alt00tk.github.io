---
title: "How Widely Should We Explore Options for a Good Design?"
description: "Exploring a wide range of design options seems likely to yield better solutions, but real projects have deadlines and effort constraints. I consider how to explore and choose within limited resources."
publishedAt: "2026-10-29T21:02:00+09:00"
---

When considering a design, I often start with one straightforward option and compare two or three options that use different approaches.
From there, I have typically arrived at a decision by considering a compromise or improving a promising option.
This is simply what I have come to do through experience; I do not think it is necessarily the best approach.

To arrive at a good design, should we broaden our options or narrow them down?

## What do I want to gain from comparison?

More options increase the chance of finding a better-suited solution.
Comparing different designs can also reveal assumptions I have made without realizing it, or trade-offs that deserve attention.
The evaluation criteria are not necessarily complete at the outset; they can evolve during the comparison.

Does that mean more candidates are always better?
Lining up 10 similar options does not necessarily yield new insights, and even different options may rest on the same mistaken assumption.
I want to focus on what the comparison can establish, rather than on the number of candidates.

## When should we switch between exploration and convergence?

Real projects have milestones, and there is not enough time to investigate every candidate to the same depth.
A practical approach would be to narrow down the candidates using rough estimates of implementation cost and complexity, then investigate the uncertainties that could affect the decision.
But if poorly grounded estimates eliminate unfamiliar approaches, only familiar solutions will remain.
I want to check what can be checked at low cost.

The comparison may substantially change the evaluation criteria.
Ideally, I would then reconsider candidates I had ruled out, but in practice I have often improved the current leading option and moved on.
To decide whether to explore again, it seems useful to first check whether the current option's validity has been called into question.

## “Good enough” and “no need to keep looking”

Finding an option that meets the requirements is not, by itself, enough to make me want to stop exploring.
At a minimum, I want to compare it with an option based on a different way of thinking, and understand its strengths and weaknesses.
If I can then accept the implementation cost, complexity, and remaining risks, I think it is reasonable to decide without a guarantee that the option is the best one.

However, if the decision will be difficult to change and the cost of a mistake is high, there is more reason to devote resources to further exploration or validation.
Conversely, if a decision can be deferred at little cost, leaving it undecided for now is also an option.
I do not want to complicate the current design solely to prepare for future uncertainty.

It is hard to imagine a universal criterion for ending exploration.
It is also difficult to assess its value accurately in advance when we do not know what we will find.
Perhaps that is precisely why it is worth recording in an ADR or similar document not just the chosen option, but also what we compared, why we rejected the alternatives, and which assumptions we accepted without verification.

I have not found a way to guarantee a good design.
For now, what I want to aim for is a decision for which I can explain which exploration and validation efforts I spent limited resources on, and why I decided at that point, rather than simply increasing or reducing the options without a clear reason.

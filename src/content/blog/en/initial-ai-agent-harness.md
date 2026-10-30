---
title: "What Should Go into an AI Agent's Initial Harness?"
description: "How much of an AI agent's harness should be defined upfront? I consider which rules a new project needs at the outset."
publishedAt: "2026-09-28T21:34:00+09:00"
---

For AI coding agents, it seems best to build up a harness by gradually adding judgment criteria based on actual failures and reviews.
But should a new project, where nothing has begun yet, also start from zero?

In an existing project, we can observe judgment criteria in past PRs, reviews, and rules written for humans. A new project has none of that material.
Yet listing general principles such as “keep it simple” and “minimize changes” from the outset does not feel right either.

## What Makes a Harness Thin?

Rules that apply to any project often become abstract.

The problem is not abstraction itself, but that a rule can strongly constrain an agent's behavior despite being open to widely differing interpretations.
For example, “minimize changes” could steer an agent toward local fixes while leaving it unclear what “minimal” means.

Perhaps a thin harness is not simply one with few rules or little text.
It seems better to think of it as one that does not unnecessarily narrow AI's solution space: the approaches it can take and its room to explore.

## Don't Teach It the Right Answers Upfront

What, then, should the initial harness contain?

For now, I think these two things may be enough:

1. Safety boundaries in areas where a single misjudgment could cause a large loss
2. Mechanisms that allow humans to evaluate the agent's results from the outside

Constraints to prevent data loss, protect security boundaries, and address similar concerns should be established in advance.
For conditions that can be checked mechanically, we should rely on deterministic verification through tests, type checking, linting, and builds rather than detailed natural-language instructions.
We should then make it possible for humans to observe what was changed, what was verified, and what remains unverified.

The purpose of an initial harness is not to comprehensively teach AI the “right way to think.”
It is to create a situation where humans can assess AI's results from the outside even when they delegate work to it.

Other judgment criteria can be added after observing actual failures and rework.
Instead of trying to create a complete set of criteria upfront, we can begin with safety boundaries and the assessability of results, then develop the necessary rules from execution results.

At least on paper, this approach seems likely to make it easier to balance room for exploration with stability.
The next step is to bring it into an actual project and observe where it falls short, and where it unnecessarily narrows AI's exploration.

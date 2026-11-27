---
title: "What Do We Learn When We Leave Implementation to AI?"
description: "How does delegating implementation to AI change how individuals learn? I look at research on distributed cognition, transfer of learning, and the assessment of abilities."
publishedAt: "2026-11-22T21:42:08+09:00"
updatedAt: "2026-11-27T20:30:22+09:00"
---

When we leave implementation to AI, we have fewer chances to write code ourselves.
We can spend that time comparing and testing design options.

Does this improve our understanding and abilities?
I’ve been wondering about this for a while. Here, I draw on research in cognitive science and the psychology of learning to think it through.

## Whose ability does a successful solution reflect?

[Hollan et al.’s (2000) account of distributed cognition](https://doi.org/10.1145/353485.353487) treats cognitive activity as something that happens through interactions among people, tools, and their environment, extending beyond what goes on in any individual’s head.
When we develop software using AI, tests, and design documents, we can likewise think of the whole system as solving the problem.

Cognitive offloading means delegating cognitive processes such as remembering or calculating to an external aid.
[Cognitive load theory](https://doi.org/10.1016/0364-0213(88)90023-7) holds that reducing the burden of unnecessary search can sometimes help people learn.
I think we need to distinguish the collaborative system’s ability to produce strong results from what the individual has learned.

[Soderstrom and Bjork (2015)](https://doi.org/10.1177/1745691615569000) also distinguish between performance during a task and lasting learning.
In an experiment involving an unfamiliar Python library, [Shen and Tamkin (2026)](https://arxiv.org/abs/2601.20245) reported that the group using AI scored lower on a skills test given immediately after the implementation task.
The experiment did not show that AI causes skills to decline over the long term.

## Understanding doesn’t guarantee transfer

Transfer of learning means applying what you’ve learned in a different situation.
An explanation can make sense when you hear it. Faced with a new problem, you can still struggle to recall the relevant principles and apply them within the new constraints.
Transfer gave me another way to look at a question I’d had for a while. Is being able to explain something the same as understanding it?

One idea I came across was Preparation for Future Learning (PFL).
In a study on learning statistics, [Schwartz and Martin (2004)](https://doi.org/10.1207/s1532690xci2202_1) found no difference between the groups on a transfer test when no materials on a new solution method were provided. When those materials were provided, the group that had devised solutions beforehand performed better.
What you’ve learned can show up in your ability to get the right answer on the spot. It can also show up in how well prepared you are to learn from new information.

Whether delegating implementation to AI improves PFL remains to be demonstrated.
More chances to compare design options are no guarantee that we’ve developed the ability to question the assumptions behind them and test whether the designs hold up under unfamiliar conditions.

## What should we expect people to be able to do, and what should we measure?

Another concept I learned about was construct validity.
[Messick (1995)](https://eric.ed.gov/?id=EJ517194) argued that we need to examine which interpretations and uses of test results the evidence supports.
Strong results from AI-assisted software development don’t tell us on their own how well someone makes design decisions or handles incidents.
We first need to decide what ability we want to assess, then measure the behaviors or outcomes that provide evidence of it.

This is where my thinking shifted a little.

We cannot assume that people will still need the same level of proficiency in the skills required before generative AI.
Working with and supervising AI may change how much existing skills matter and which combinations of them people need.
Still, being able to delegate a task to AI does not necessarily make the underlying skill unnecessary.
If someone has to intervene during a complex incident, they may still need to understand how the system is put together and investigate the cause.

I want to consider two questions separately. What can we delegate to AI? What abilities should people develop and maintain?
I’d approach the second question by considering people’s future roles and what exceptional situations may require of them. As needed, I’d assess separately how well people can implement independently, make design decisions, handle incidents, and learn unfamiliar technologies.
That seems like a better way to put what I’ve learned to use than trying to judge on a single scale whether our abilities have improved or declined.

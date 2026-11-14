---
title: "How Much Can Causal Inference Tell Us About the Effects of AI Adoption?"
description: "A change in development speed within the same team before and after AI adoption does not necessarily establish an AI effect. This learning log explores counterfactuals, comparison methods, and the limits of causal estimation."
publishedAt: "2026-11-14T17:14:34+09:00"
---

Suppose development lead time falls from 10 days to 7 days after adopting AI.
The observed improvement is 3 days, but can we attribute it to AI?

## How can we compare outcomes we cannot observe?

In the counterfactual framework discussed in [Hernán and Robins's Causal Inference: What If](https://miguelhernan.org/whatifbook), a causal effect is the difference between the outcome with an intervention and the outcome without it.
However, we cannot observe both outcomes for the same subject at the same point in time.

For example, if lead time would have fallen to 8 days as team members developed their skills even without AI, the reduction attributable to AI would be 1 day.
An observed change is different from a causal effect.
Also, even if teams that use AI develop software faster, team maturity might be a confounder that influences both AI use and development speed.

## What if we cannot establish a comparison group?

A randomized controlled trial (RCT) can estimate the average effect in a study population by randomly assigning teams or tasks to use AI or not.
In practice, however, a team's work cannot always be divided this way.

There are also methods that use observational data.
[Difference-in-differences](https://www.jstage.jst.go.jp/article/ace/3/3/3_74/_html/-char/en) relies on the assumption that, without the intervention, the intervention group would have followed a parallel trend to the comparison group.
Interrupted time series analysis (ITS) uses the trend before an intervention to predict what would have happened without it.
Tasks do not have to be perfectly matched in size and difficulty, but changes in the mix of tasks, the rate at which team members develop their skills, or other initiatives introduced around the same time can bias the estimate.
[A methodological explanation of ITS](https://pmc.ncbi.nlm.nih.gov/articles/PMC5407170/) also identifies concurrent changes as a problem.

When all we can observe is the past and present of the same project and team, isolating the effect of AI still seems difficult.

## Can sensitivity analysis work when we cannot estimate the effect?

At this point, I wondered whether sensitivity analysis could work when the effect itself is difficult to quantify.

For example, suppose lead time fell by an additional 2 days relative to the historical trend.
Assuming the effects of AI and a concurrent process improvement are additive, we could examine how many days of that reduction would need to come from the process improvement to overturn the interpretation that AI reduced lead time.
This would not mean we had measured the unknown contribution.
We would only be examining how the conclusion changes as we vary our assumptions; whether those assumptions are realistic requires separate consideration.

What I came to understand is that causal inference is not a method that can always put a number on an effect.
It is a methodology for clarifying what we are comparing and under which assumptions we can interpret a difference as a causal effect.
We can make decisions even when we cannot identify the causal effect, but I want to keep that judgment distinct from having established causality.

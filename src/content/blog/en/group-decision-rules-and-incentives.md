---
title: "What Changes When We Change How Groups Make Decisions?"
description: "Comparing different values alone cannot explain collective decisions. Learning about social choice theory led me to consider how principles of evaluation and decision procedures affect choices and behavior."
publishedAt: "2026-11-15T20:14:54+09:00"
---

When customer convenience conflicts with the maintenance burden on developers, what basis should we use to compare them, and who should decide?
This is a question I have been thinking about for some time.
As I learned about social choice theory, I began to think not only about which values to prioritize, but also about how decisions are made.

## The same conditions can lead to different choices depending on what we consider rational

[Rawls's “veil of ignorance”](https://plato.stanford.edu/entries/original-position/) is a thought experiment for considering fair institutions without knowing what position we will occupy in society.

Taking that idea as a starting point, suppose we had to choose between the following two hypothetical societies without knowing whether we would belong to the wealthy, middle, or disadvantaged group.
Assume the numbers represent the benefits each group receives, measured on a common scale that allows comparisons across people.

| Comparison | Society A | Society B |
| --- | ---: | ---: |
| Benefits for the wealthy group | 100 | 70 |
| Benefits for the middle group | 60 | 55 |
| Benefits for the least advantaged group | 10 | 30 |
| Expected value with a 1/3 chance of belonging to each group | About 56.7 | About 51.7 |

My intuitive choice was B.
Even if I ended up in the least advantaged group, my benefit would still be 30.
But when I compared the expected values assuming an equal chance of ending up in each group, A came out ahead, and I realized that A was also hard to dismiss.

Should we prioritize the welfare of the least advantaged, or the higher expected benefit?
Even under the same conditions, the conclusion can change depending on what we consider rational.
Of course, this simplified choice between two options should not be equated with Rawls's theory of justice, and in reality, benefits across individuals may not be measurable on a common scale.

## Expressing your preferences honestly can leave you worse off

Another thing that surprised me was that the rules for making a collective decision can change the participants' own behavior.

Five people choose among proposals A, B, and C, with one vote per person and the proposal receiving the most votes winning.
Four people's votes are fixed: two for A and two for C.
The remaining person's true preference is “B > C > A,” and the rule gives A priority if it is tied for the most votes.

Should the last person vote for their first choice, B?

| | Vote for B (honestly) | Vote for C (second choice) |
| --- | ---: | ---: |
| Votes for A | 2 | 2 |
| Votes for B | 1 | 0 |
| Votes for C | 2 | 3 |
| Selected proposal | A (least preferred) | C (second choice) |

If they vote for B, A and C tie, and A is selected.
But if they vote for C, they can ensure that C, which they prefer to A, wins.
An honest vote is not always the best choice for the person casting it.

The [Gibbard–Satterthwaite theorem](https://plato.stanford.edu/entries/social-choice/) shows that the possibility of strategic reporting cannot be eliminated entirely in a non-dictatorial voting system that allows any individual preference ranking, always selects one option from three or more alternatives, and allows any candidate to be selected.

## Decision criteria also affect the information used to decide

The first example concerns what we consider a desirable outcome; the second concerns how the procedure for choosing an outcome affects people's behavior.
These are separate questions.

For example, if we prioritize development proposals based on their estimated labor-hour savings, stakeholders may have an incentive to inflate those estimates.
Whether overstatement actually occurs needs to be examined separately, but the information used to make a decision is not necessarily independent of the decision procedure.

Previously, I mainly thought about how to compare different values and who should take responsibility for the final judgment.
I now also consider whose views to gather, how to gather them, and what method to use to decide.
When setting decision criteria in the future, I want to consider what behavior those criteria might encourage among the people involved.

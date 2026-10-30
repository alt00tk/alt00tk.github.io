---
title: "How Much Should We Externalize Judgment Criteria for AI?"
description: "I want AI agents to make more consistent judgments, but too much instruction may constrain their reasoning and exploration. How much of our judgment criteria should we externalize?"
publishedAt: "2026-09-27T22:10:00+09:00"
---

When writing `AGENTS.md` files or skills for AI coding agents, it seems best to make judgment criteria as explicit as possible.
This can turn tacit knowledge into explicit knowledge and make judgments more reproducible.

Yet a question remains: as models become more capable, could detailed rules themselves constrain reasoning and exploration?

## Define the Evaluation Space, Not the Solution Process

It seems useful to distinguish judgment criteria from decision procedures.

What we humans should externalize is what must be preserved, what counts as good, and what counts as evidence when making a judgment. As a rule, we should leave open which design patterns to use, how to order the reasoning process, and which implementation approach to choose.
In other words, we define the evaluation space while leaving AI a broad solution space.

Still, precise wording in natural language does not guarantee precise interpretation.
For conditions where misinterpretation is unacceptable, it would be better not to stop at documenting them as judgment criteria, but also to use deterministic checks such as tests, lint rules, types, and contracts.

## What Should We Externalize?

“Write only the judgment criteria that AI cannot reconstruct on its own” is a clear way to frame this, but it is difficult for us humans to assess that ability accurately in advance.
Rather than trying to define all the criteria upfront, it would be more practical to assess which ones are needed based on actual execution results.

Places where the same kinds of corrections or review comments recur, or where project-specific judgment is needed, are candidates for externalization.
For conditions where even a single mistake could cause a large loss, however, we should move them into a mechanically verifiable form where possible, instead of relying on judgment expressed in natural language.

And if something is already expressed in code, tests, lint rules, ADRs, or another form, there is no need to repeat it in natural language.

## Avoid Generalizing Too Early

A surface-level comment does not necessarily reflect a deeper evaluation principle.
For example, a request to “avoid adding an interface in this case” may not justify replacing it with a general principle to “avoid unnecessary abstraction.” That could broaden its scope too far.

It seems better to start with a narrowly scoped rule, then generalize it into a broader judgment criterion once several similar cases have been observed.

For now, it seems best to leave AI ample room to explore without imposing detailed constraints upfront, and to externalize only those judgment criteria whose necessity has emerged from actual execution results. My tentative conclusion is that conditions where misinterpretation is unacceptable should be verified deterministically, while information already expressed elsewhere should not be duplicated.

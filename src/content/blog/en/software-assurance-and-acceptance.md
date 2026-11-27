---
title: "How Much Verification Is Enough to Accept a System?"
description: "There are limits to what testing and formal verification can assure. I explore metamorphic testing, assurance cases, and the independence of verification."
publishedAt: "2026-11-27T21:54:00+09:00"
---

Suppose I let AI handle the implementation and all the tests pass.
Is that enough to accept what it produced?

## What can verification guarantee?

[NASA’s systems engineering guidance](https://www.nasa.gov/reference/2-4-distinctions-between-product-verification-and-product-validation/) distinguishes between verification and validation.
Verification checks whether the system conforms to its specifications. Validation checks whether the system fulfills its purpose in the intended operating environment.
The specifications may leave out some of the conditions needed to fulfill that purpose.

The test oracle problem, surveyed by [Barr et al. (2015)](https://doi.org/10.1109/TSE.2014.2372785), is the problem of deciding whether the behavior we observe is correct.
If the specification used to derive the expected results is wrong, the tests can pass and still miss an error.
Formal verification can show that a model satisfies a property. Whether the property is appropriate and whether the model corresponds to the implementation still need to be checked separately.

## Finding errors without knowing the correct answers

Even when we cannot specify the expected output for every input, metamorphic testing allows us to check certain properties.
[Chen et al. (2018)](https://doi.org/10.1145/3143561) describe it as a testing technique that uses relationships that should hold across multiple inputs and their outputs.

Take a product search. If the data stays the same and the search returns every product that matches the criteria, adding an AND condition should yield a subset of the original results.
Even without knowing the correct results for either search, we can detect an error if the results violate that relationship.
An implementation that always returns an empty set would still satisfy this necessary condition.

Checking invariants with property-based testing likewise establishes only that the property holds in the cases tested.
How do we bridge the gap between necessary and sufficient conditions?

## How much confidence does the evidence justify?

Assurance cases gave me a way to think about this question.
[SEI’s research](https://www.sei.cmu.edu/library/toward-a-theory-of-assurance-case-confidence/) examines how evidence and arguments support claims about a system’s properties and how to justify confidence in those claims.

- **Claim** — What are we claiming about the system?
- **Argument** — Why does the evidence support the claim?
- **Evidence** — What do we base the claim on?
- **Assumption** — What assumptions does the claim or argument depend on?
- **Defeater** — What could overturn the claim or undermine the argument?

Suppose we claim that resending the same approval request because of a communication failure will not lead to duplicate approval. Results from checking a model that leaves out retries would provide insufficient support for that claim.
[Research on Assurance 2.0](https://arxiv.org/abs/2405.15800) also deals explicitly with defeaters.

Bridging the gap between necessary and sufficient conditions and deciding whether to accept the work after clarifying the limits of the assurance are two distinct problems.
Once we assess whether the evidence and argument justify confidence in the claim, we can decide whether the residual risk is acceptable. I still don’t know how much evidence is enough.

## Is it enough to separate the implementer and the verifier?

While learning about independent verification and validation (IV&V), I also began to look at whether errors are independent.
In an experiment by [Knight and Leveson (1986)](https://doi.org/10.1109/TSE.1986.6312924), failures in multiple programs developed independently from the same specification were not necessarily statistically independent.

The concept of common-cause failure, in which a single cause leads to multiple failures, may also be relevant when AI carries out implementation and verification.
Different models might overlook the same error in a shared specification, and they might share biases from training.
It may also be worth deriving criteria for judging correctness directly from business objectives or primary sources, independently of the specification. The validity of the sources themselves is a separate question.

When I delegate implementation to AI in the future, I’d like it to report the results of tests and other checks, the claims it makes, the evidence it relies on, and why that evidence supports its claims. I’d also like it to report the assumptions behind its reasoning, what its assurance does not cover, and any defeaters.
A human reviewer would then assess whether the report is credible and whether the residual risk is acceptable.
That could shift the focus of review from individual lines of code to evaluating the evidence and arguments supporting the claims.

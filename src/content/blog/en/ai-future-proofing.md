---
title: "How Much Code Should AI Write for Future Needs?"
description: "AI can create abstractions and extension points in anticipation of future changes, but are they really needed now? I consider how to distinguish preparation for the future from design that is needed today."
publishedAt: "2026-10-05T20:57:00+09:00"
---

When I let an AI agent handle implementation, it sometimes gets too far ahead of current needs—for example, abstracting database operations because "we might replace the DBMS in the future."
Preparing for future changes is not bad in itself, but how far should I allow it to go?

## Future Possibilities Alone Are Not Enough Justification

At first, I thought it might be reasonable to anticipate changes that seemed likely to happen.
But along the way, I realized that the possibility of replacing something in the future is not the only reason to introduce an interface.

For example, if persistence and business logic change for different reasons, there is ample reason to separate them.
An interface may also serve to uphold a stable contract, or boundary.
In other words, having only one concrete class does not by itself mean an interface is unnecessary.

Conversely, if the only reason is that "there might be a second implementation in the future," we are merely forcing a hypothesis about a future that does not yet exist into the code.

Ultimately, the criterion that feels most fitting to me is: "Would this structure have value now even if we set aside that future possibility?"

## AI Also Changes the Cost of Unnecessary Structure

If AI can write code quickly, it becomes much easier than before to choose to rework it when the need arises, using the information available then.
Of course, for areas where changes have a wide impact, such as APIs and persistence boundaries, the credits and tokens needed for rewriting cannot be ignored either.

What concerns me more is that AI will keep reading the unnecessary code too.
Once an abstraction or extension point exists, subsequent AI agents interpret it as a design that must be there for some important reason.
We continue paying for that unnecessary context during everyday reasoning, as well as during maintenance.

Furthermore, if people stop reading code in detail, overengineering that no one asked for could accumulate without being recognized as a design change.

## Review Structural Changes, Not Just Code

That is why I think simply telling AI not to create unnecessary abstractions is insufficient.

Checks that can be made deterministically, such as dependency direction, circular dependencies, and boundaries with external systems, can be moved into "architecture tests" or "architectural fitness functions."
Then, decisions that matter architecturally can be reviewed separately from ordinary code changes, with AI explaining why they are necessary now and a human making the judgment.

Neither full automation nor leaving everything to AI's own judgment seems feasible.
For now, I consider enforcing known constraints mechanically and having humans review only newly introduced design decisions a practical way to distinguish speculation about the future from necessary design.

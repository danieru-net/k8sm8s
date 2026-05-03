---
title: 'Staying Sharp Under Pressure: Cognitive Load During Incidents'
author: 'platform-lead'
category: 'Mental'
publishDate: 2025-01-18
readingTime: 6
description: 'How cognitive science explains what happens to your thinking during a production incident, and practical techniques to improve decision quality under stress.'
---

## What Actually Happens to Your Brain During a P1

When a Sev-1 fires, you're not just responding to a technical problem. You're responding to a technical problem while your nervous system is activating a stress response designed for entirely different situations.

Cortisol and adrenaline narrow your attention — useful if you're being chased, less useful when you need to reason about distributed system behavior across five services. Working memory contracts. Pattern recognition degrades. You're more likely to anchor on the first plausible explanation and stop looking.

Knowing this doesn't make incidents easier. But it explains why experienced engineers deliberately use structured processes during incidents rather than relying on intuition, and why those processes help.

## The Role of Working Memory

Working memory is the cognitive workspace where active reasoning happens. Under normal conditions, humans can hold roughly four to seven discrete items in working memory simultaneously. Under acute stress, that number drops.

This is directly relevant to incident management. A complicated stack trace, a Grafana dashboard with twenty panels, three Slack threads, and a bridge call represent more active context than your working memory can reliably track under pressure. Things fall through the gaps. You misread a timestamp. You forget what you already ruled out fifteen minutes ago.

**Implication:** Externalize everything. Write the current hypothesis down. Write down what you've ruled out. Use the incident ticket or a shared doc, not your head.

## Structured Communication as a Cognitive Aid

The most experienced incident commanders I've worked with are often surprisingly quiet during incidents. They're not quiet because they know less — they're quiet because they're managing their own cognitive load deliberately.

Some patterns they use:

### State the current hypothesis explicitly

Before starting any investigation action, say out loud (or write): _"I believe the issue is X because of evidence Y. I'm going to verify by doing Z."_

This forces structured thinking before action and gives the team something to either confirm or challenge. When you're stressed, it's easy to start executing before you've finished thinking. Stating the hypothesis externalizes your mental state and creates space for others to catch errors.

### One thread at a time

Parallel investigation looks efficient and often isn't. Context-switching between two investigation threads under pressure means neither gets your full attention. Assign ownership: "You own the database hypothesis, I'm on the network path. Report back in ten minutes."

This isn't just coordination — it's cognitive load distribution.

### Regular explicit status updates

Every 15-20 minutes during a major incident, pause and state: current status, what's been ruled out, current best hypothesis, next action. This forces a brief metacognitive check — am I still on the right track? — which prevents the tunnel vision that comes from deep focus under stress.

## Recognizing When You're Cognitively Compromised

There's a pattern that experienced engineers describe during serious incidents: a feeling of certainty that isn't justified by the evidence. You've latched onto an explanation and you're executing confidently even though you've stopped genuinely questioning.

Some signals you're in this state:

- You're irritated when others suggest alternative hypotheses
- You've stopped looking at dashboards that would refute your current theory
- You're moving faster than the situation warrants
- You can't articulate clearly why you've ruled out the alternatives you dismissed

If you notice these, the most valuable thing you can do is say: "I'm going to step back for two minutes." Make a cup of tea. Do ten slow breaths. Re-read the alert and the initial symptoms as if seeing them for the first time.

This feels like losing time. It often gains it.

## The Post-Incident Cognitive Recovery Window

Cognitive fatigue after a serious incident is real and has a measurable recovery time. Research on decision fatigue suggests that the quality of complex decisions drops significantly after extended periods of high cognitive load — which is exactly what major incidents impose.

In the 24 hours after a major incident:

- **Avoid major architectural decisions.** The post-incident enthusiasm for "fixing this properly" is real, but decision quality is temporarily lower. Schedule the architectural conversation for 48 hours out.
- **Acknowledge the cognitive cost.** "That was hard" is not weakness. Incidents that span four hours or involve sleep deprivation are cognitively taxing, and treating them as routine doesn't change the biology.
- **Write the post-mortem when you still have context, but review it when you've rested.** The initial draft benefits from recency. The final version benefits from perspective.

## Building Incident Muscle Memory

The best way to improve incident response under pressure is to practice the structured habits when the stakes are low, so they become automatic when they're not.

In blameless post-mortems, review not just what happened to the system, but what happened to the response team's decision-making. Were there moments where cognitive tunnel vision led to delayed diagnosis? Were there communication breakdowns that could be addressed with structure?

The goal is not to make incidents feel calm — they shouldn't necessarily be calm. The goal is to keep thinking clearly anyway.

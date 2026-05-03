---
title: 'Managing On-Call Burnout: Strategies for SREs and Platform Engineers'
author: 'sre-practitioner'
category: 'Burnout'
publishDate: 2025-01-10
readingTime: 8
description: 'Practical, team-level strategies for preventing and recovering from on-call burnout without sacrificing operational excellence.'
---

## The Cost Nobody Talks About

SRE teams spend considerable effort calculating error budgets, MTTD, and MTTR. Far fewer track the quieter metric that predicts team collapse before any of those others do: cumulative on-call fatigue.

Burnout from sustained on-call load looks like slow degradation. Response times creep up. Runbooks go stale because updating them feels optional when you're already exhausted. Engineers who were once enthusiastic start going quiet in incident channels. Then they leave.

This article is about structural changes — things teams and managers can implement — not individual coping strategies. If your on-call rotation is fundamentally broken, no amount of meditation changes that.

## Diagnosing the Problem

Before fixing anything, quantify your baseline. Two weeks of data from your alerting system can answer the questions that matter:

**Alert volume per shift:**
How many pages does an engineer receive during an on-call week? More than 5 actionable alerts per day is a signal something structural is wrong.

**Interrupt recovery time:**
How long after a page does work return to baseline? Studies on software engineering cognitive load suggest 20-30 minutes of re-entry time per interrupt. Ten pages a day means entire shifts lost to context-switching overhead.

**Sleep disruption:**
How many pages happen between 11 PM and 6 AM? This is the leading predictor of post-shift exhaustion and long-term burnout.

```bash
# A quick jq one-liner to count PagerDuty alerts by hour from an export
cat alerts.json | jq '[.[] | .created_at | strptime("%Y-%m-%dT%H:%M:%SZ") | .tm_hour] | group_by(.) | map({hour: .[0], count: length})'
```

## Structural Fixes That Actually Work

### 1. Reduce alert noise first

The most impactful action is almost always cutting the number of pages, not improving how engineers handle them. Aim for a signal-to-noise ratio where 90%+ of pages require human action within 5 minutes. If alerts are informational, route them to Slack. If they're auto-resolving, suppress them or raise the threshold.

Run a weekly alert review meeting with a single agenda item: **"Which alerts from this week should not have paged a human?"** Every alert that gets demoted is time returned to the on-call engineer permanently.

### 2. Make shift handoffs real

Shift handoffs done well transfer context, not just access. A 15-minute synchronous or async handoff document should cover:

- What happened this shift and any ongoing investigation threads
- Systems in a degraded or monitored state
- Work-in-progress runbook changes
- Anything the incoming engineer should watch

This isn't bureaucracy. An engineer who inherits a shift without context will page the person who just went off-call at 2 AM to ask what's going on.

### 3. Rotate at a cadence that prevents fatigue accumulation

Weekly rotations are standard but not universal. Some teams find that shorter rotations (3-4 days) reduce fatigue by preventing a full week of sleep disruption from accumulating. Others find longer rotations (two weeks) allow engineers to develop deeper context before handing off.

The pattern that consistently causes burnout: **chronically short rotations with too few people**, where everyone is on-call every other week or more frequently. If your rotation means someone is primary on-call more than one week in five, you do not have enough on-call-eligible engineers.

### 4. Protect post-incident recovery time

After a major incident, the engineer who handled it has typically had their cognitive load maximized for hours, possibly through the night. Sending them into a full sprint planning or feature review the next morning is a mistake that compounds over time.

Build in explicit recovery time: a half day of no-meetings, no-deliverables space after any Sev-1. For engineers paged multiple times overnight, this is a full day. Make it a written team norm, not a favor managers grant on request.

### 5. Invest in runbook quality as a team — not a solo task

Stale runbooks are both a symptom and a cause of burnout. They're a symptom because teams that are too tired to maintain them clearly have too much operational load. They're a cause because an unclear runbook turns a 10-minute incident into a 90-minute one at 3 AM.

Assign runbook maintenance as a team activity, not individual responsibility. Pair engineers on runbook updates immediately after incidents, while the context is fresh. A runbook that can't be followed by someone who has been paged from sleep is not a runbook — it's a liability.

## Recovery After Burnout Has Already Happened

If an engineer is already experiencing burnout, structural changes help, but they take time to have effect. The most important immediate action is a genuine break from on-call responsibilities — not a weekend, but a meaningful rotation-free period of two to four weeks.

This requires coverage. If you don't have coverage, that's important information: the team is too small for its operational load, and that's a staffing conversation worth having explicitly.

Signs of burnout that shouldn't be dismissed as "just having a rough week":

- Persistent cynicism about systems that were previously areas of ownership and pride
- Cognitive difficulty in tasks that were previously routine
- Hypervigilance about phones and notification sounds outside of on-call shifts
- Dreading shifts well in advance, beyond ordinary pre-shift nerves

These are worth naming directly in 1:1s, not pathologizing but acknowledging as signals that the operational load is genuinely unsustainable.

## What Good Looks Like

A healthy on-call practice isn't the absence of incidents. It's an environment where:

- Engineers can predict roughly how disruptive a shift will be
- Sleep disruptions are genuinely uncommon and acknowledged when they happen
- Runbooks work and are maintained collaboratively
- Improvements from post-incident reviews actually get implemented
- Engineers who've been on-call aren't immediately tasked with feature work the next morning

The goal isn't to make on-call effortless. It's to make it sustainable.

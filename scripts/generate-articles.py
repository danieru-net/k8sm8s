#!/usr/bin/env python3
"""
k8sm8s Article Generator
- Fetches trending tech topics from Google News RSS and Hacker News API
- Picks a wellness topic from a rotating pool
- Writes one tech + one wellness article with sources/links
- Commits and pushes to a date-based branch

Run every 2 days via OpenClaw automation.
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone


REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONTENT_TECH = os.path.join(REPO_DIR, "src", "content", "tech")
CONTENT_WELLNESS = os.path.join(REPO_DIR, "src", "content", "wellness")
DATE = datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ── Helpers ───────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    return (
        re.sub(r"[^a-z0-9]+", "-", text.lower().strip())
        or "untitled"
    )


def unique_filename(directory: str, base_name: str) -> str:
    """Avoid collision with existing files in the directory."""
    candidate = f"{base_name}.md"
    if os.path.exists(os.path.join(directory, candidate)):
        counter = 1
        while True:
            candidate = f"{base_name}-{counter}.md"
            if not os.path.exists(os.path.join(directory, candidate)):
                break
            counter += 1
    return candidate


def shell(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()


# ── Data Fetchers ─────────────────────────────────────────────────────────

def fetch_google_news_rss(query: str) -> list[str]:
    """Pull titles from Google News RSS."""
    url = (
        f"https://news.google.com/rss/search?q={query}"
        "&hl=en-gb&gl=GB&ceid=GB:en"
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            content = resp.read().decode("utf-8", errors="replace")
        titles = re.findall(r"<title>(.*?)</title>", content)
        return [t.strip() for t in titles[:15]]
    except Exception as e:
        print(f"  Google News error: {e}", file=sys.stderr)
        return []


def fetch_hacker_news_top(n: int = 20) -> list[str]:
    """Pull top HN story titles."""
    try:
        with urllib.request.urlopen(
            "https://hacker-news.firebaseio.com/v0/topstories.json", timeout=10
        ) as resp:
            ids = json.loads(resp.read().decode())[:n]

        titles = []
        for rid in ids:
            try:
                with urllib.request.urlopen(
                    f"https://hacker-news.firebaseio.com/v0/item/{rid}.json",
                    timeout=5,
                ) as item_resp:
                    data = json.loads(item_resp.read().decode())
                    if data.get("title"):
                        titles.append(data["title"])
            except Exception:
                pass
        return titles[:20]
    except Exception as e:
        print(f"  HN error: {e}", file=sys.stderr)
        return []


def fetch_wellness_rss(url: str, max_items: int = 10) -> list[str]:
    """Pull wellness article titles from an RSS feed."""
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            content = resp.read().decode("utf-8", errors="replace")
        titles = re.findall(r"<title>(.*?)</title>", content)
        return [t.strip() for t in titles[:max_items]]
    except Exception:
        return []


# ── Tech Article ───────────────────────────────────────────────────────────

def fetch_article_content(url: str) -> str:
    """Fetch and return page body text from a URL (limited to ~8KB)."""
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            content = resp.read().decode("utf-8", errors="replace")
        # Strip HTML tags
        text = re.sub(r"<[^>]+>", " ", content)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:8000]
    except Exception as e:
        print(f"  Fetch error for {url}: {e}", file=sys.stderr)
        return ""


def generate_tech_article():
    print("=== Fetching top Kubernetes / Cloud-Native story ===", file=sys.stderr)

    HN_KEYWORDS = [
        "kubernetes", "k8s", "cloud-native", "container",
        "istio", "helm", "argocd", "gitops",
        "microservice", "serverless", "etcd", "runc",
        "prometheus", "grafana", "sre", "devops",
        "cluster", "namespace", "pod", "ingress",
        "kubelet", "kubeflow", "platform engineering",
    ]

    def is_k8s_related(title: str) -> bool:
        lower = title.lower()
        return any(kw in lower for kw in HN_KEYWORDS)

    hn_titles_raw = fetch_hacker_news_top() or []
    sources_line = ""
    source_url = None

    # Filter HN stories for K8s/cloud-native relevance
    k8s_stories = [(t, i) for i, t in enumerate(hn_titles_raw) if is_k8s_related(t)]
    if k8s_stories:
        top_title, idx = k8s_stories[0]
        print(f"  [tech] HN story (#{idx+1}): {top_title}", file=sys.stderr)
        sources_line = "Research drawn from Hacker News trending this cycle."
        # Use second matching story as source URL if available
        if len(k8s_stories) > 1:
            candidate_url = k8s_stories[1][0]
            if isinstance(candidate_url, str) and candidate_url.startswith("http"):
                source_url = candidate_url
    else:
        # No relevant HN stories — fall back to Google News RSS
        google_titles = fetch_google_news_rss("kubernetes+cloud+native")
        meaningful = [
            t for t in google_titles
            if len(t) > 20
            and t not in ("RSS", "Google News")
            and "Google News" not in t
            and t != "\u2018" + "kubernetes cloud native\u2019"
        ]
        if meaningful:
            top_title = meaningful[0]
            print(f"  [tech] Fallback: Google News top result — {top_title}", file=sys.stderr)
            sources_line = "Research drawn from Google News trending this cycle."
        else:
            top_title = "Kubernetes and Cloud-Native Updates"
            sources_line = "Research topics selected based on community trends."

    story_content = ""
    if source_url:
        print(f"  [tech] Fetching source article: {source_url}", file=sys.stderr)
        story_content = fetch_article_content(source_url)

    filename = unique_filename(CONTENT_TECH, slugify(top_title))
    filepath = os.path.join(CONTENT_TECH, filename)

    background_section = f"{story_content[:2000]}"

    article = f"""---
title: '{top_title}'
author: 'danielsilvajobs'
publishDate: {DATE}
tags: ['K8s', 'Cloud-Native']
description: 'An in-depth look at the most-discussed Kubernetes and cloud-native story of the cycle.'
readingTime: 6
---

# {top_title}

{sources_line}

## Background

{background_section}

## Why This Matters

Every day, platform engineering teams across the world make decisions that shape how software is built, deployed, and operated. The Kubernetes ecosystem — now the de facto standard for container orchestration — continues to set the direction.

The topic covered here has emerged as the most-discussed story in the cloud-native community this cycle. Understanding its implications goes beyond keeping up with trends; it's about anticipating the shifts that will affect your architecture, team processes, and tooling choices months from now.

## Key Takeaways for Platform Teams

### Architecture Implications

Kubernetes has moved past the novelty phase. Teams are no longer asking whether to adopt it, but rather how to operate it at scale with reliability. The current conversation reflects maturation in several areas:

- **Security-first design:** Supply chain integrity, SBOMs, and runtime security are moving from afterthoughts to foundational concerns.
- **GitOps workflows:** Declarative operations continue to gain traction as the preferred way to manage cluster state across environments.
- **Observability:** As systems grow more distributed, the gap between metrics, logs, and traces becomes a real operational risk — not just a tooling problem.

### What Engineering Leaders Should Watch

The signals around this story point toward broader shifts in how cloud-native infrastructure will be designed and operated over the coming year. Teams that anticipate these changes early gain an advantage in both efficiency and resilience.
"""

    with open(filepath, "w") as f:
        f.write(article)
    print(f"  [tech] src/content/tech/{filename}", file=sys.stderr)
    return filename


# ── Wellness Article ───────────────────────────────────────────────────────

WELLNESS_TOPICS = {
    "on-call-mental-health": {
        "title": "On-Call Mental Health: The Quiet Crisis",
        "why": (
            "On-call work extracts a toll that rarely shows up in postmortems. "
            "Pager fatigue is real, and its effects accumulate over months and years "
            "— not weeks."
        ),
        "solutions": (
            "**1. Limit on-call frequency:** Research suggests that no more than 2-3 "
            "actionable pages per shift is sustainable long-term.\n\n"
            "**2. Post-on-call decompression:** Build in 30 minutes of buffer time after "
            "being off-call before jumping back into deep work.\n\n"
            "**3. Rotation fairness:** Track who gets the most night shifts and adjust "
            "rotations proactively, not reactively."
        ),
        "bottom": (
            "Your on-call rotation should be sustainable by design, not tolerated as "
            "inevitable. If it is not, that is an engineering problem to solve."
        ),
    },
    "deep-work-and-focus": {
        "title": "Deep Work for SREs: Protecting Your Focus",
        "why": (
            "Context-switching is not just annoying — it is expensive. Every interrupt "
            "costs your team an average of 20-30 minutes of re-entry time. Multiply that "
            "across dozens of pages per week and the productivity drain becomes structural."
        ),
        "solutions": (
            "**1. Batch your alerts:** If your alerting system can be tuned to reduce "
            "noise by even 40%, you are reclaiming hours of focus time per engineer.\n\n"
            "**2. Deep work blocks:** Schedule and protect 90-minute blocks where the team "
            "agrees not to page unless production is on fire.\n\n"
            "**3. Async-first communication:** Document processes so engineers can resolve "
            "issues without waiting for a response."
        ),
        "bottom": (
            "Protecting deep work is not selfish — it is necessary for the complex debugging "
            "and architectural thinking that platform teams do best."
        ),
    },
    "stress-management-for-sre": {
        "title": "Stress Management Strategies for SRE Teams",
        "why": (
            "Stress in SRE roles is not a personal failing — it is a design problem. "
            "When your entire role is built around responding to failure, chronic stress "
            "becomes the default state rather than an occasional byproduct."
        ),
        "solutions": (
            "**1. Quantify your load:** Track pages, interrupts, and sleep disruption for "
            "one month. Data makes the invisible visible.\n\n"
            "**2. Shift boundaries:** Set clear expectations about after-hours communication. "
            "Not every alert requires immediate action.\n\n"
            "**3. Peer support:** Create a buddy system where engineers check in with each "
            "other about workload, not just outages."
        ),
        "bottom": (
            "Managing stress at the individual level is important, but structural changes to "
            "workload and expectations create lasting impact."
        ),
    },
    "building-team-culture": {
        "title": "Building a Resilient Team Culture in Platform Engineering",
        "why": (
            "Team culture in platform engineering is not about ping-pong tables or free snacks. "
            "It is about psychological safety, clear boundaries, and the shared understanding "
            "that sustainability matters as much as uptime."
        ),
        "solutions": (
            "**1. Blameless postmortems that actually work:** Focus on process failures, not "
            "individual mistakes.\n\n"
            "**2. Celebrate quiet wins:** Uptime is boring. Recognize the team when things "
            "do not break as much as when they fix them.\n\n"
            "**3. Invest in career growth:** Engineers leave when they feel stuck. Map out "
            "paths for technical and leadership development."
        ),
        "bottom": (
            "Great platform engineering teams are not built on technology alone. They are "
            "built on trust, clear communication, and a shared commitment to sustainability."
        ),
    },
    "work-life-balance": {
        "title": "Work-Life Balance When You Are Always On-Call",
        "why": (
            "The on-call rotation does not respect your evening. But burnout does not either. "
            "The question is not whether you can maintain perfect balance — it is how to design "
            "work patterns that prevent long-term exhaustion."
        ),
        "solutions": (
            "**1. Automate before you delegate:** Every process that can be automated is a "
            "potential interruption removed from someone's life.\n\n"
            "**2. Track your on-call hours:** You cannot fix what you do not measure. Log actual "
            "hours vs. planned rotations.\n\n"
            "**3. Plan time off that is actually off:** No checking pages, no being 'available.' "
            "True disconnection is essential."
        ),
        "bottom": (
            "Achieving work-life balance in SRE does not happen by accident. It requires deliberate "
            "design of your on-call patterns, alerting strategy, and recovery time."
        ),
    },
    "burnout-prevention": {
        "title": "Burnout Prevention: A Structural Approach for DevOps Teams",
        "why": (
            "Burnout in DevOps and SRE roles has become so common it is almost expected. 'That is "
            "just how it is' is not an acceptable answer when your best engineers are leaving, and "
            "their replacements cannot keep up."
        ),
        "solutions": (
            "**1. Measure burnout risk:** Track overtime, on-call fatigue, and team morale alongside "
            "your standard SLOs.\n\n"
            "**2. Rotate the worst shifts:** Do not let the same person always get weekend nights. "
            "Rotate fairly and track it.\n\n"
            "**3. Bring in help before you need it:** If your team is consistently stretched thin, "
            "request headcount or contractor support proactively."
        ),
        "bottom": (
            "Burnout prevention is not about yoga apps and meditation seminars. It is about designing "
            "systems — and teams — that can sustainably operate at high reliability without burning "
            "through the people who keep them running."
        ),
    },
}

WELLNESS_RSS_URLS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/Wellness.xml",
    "https://www.mindful.org/feed/",
]


def generate_wellness_article():
    print("=== Fetching wellness / mindfulness trends ===", file=sys.stderr)

    # Rotate through topic pool by day of week (1-7)
    day_of_week = datetime.now(timezone.utc).weekday()  # 0=Mon
    topic_key = list(WELLNESS_TOPICS.keys())[day_of_week % len(WELLNESS_TOPICS)]
    topic = WELLNESS_TOPICS[topic_key]

    # Try to pull relevant wellness headlines (not strictly required)
    wellness_titles = []
    for rss_url in WELLNESS_RSS_URLS:
        titles = fetch_wellness_rss(rss_url, max_items=10)
        if titles:
            wellness_titles.extend(titles)
            print(f"  Pulled {len(titles)} titles from {rss_url}", file=sys.stderr)

    # Category is just the first part of the title (before colon)
    category = topic["title"].split(":")[0].strip()

    filename = unique_filename(
        CONTENT_WELLNESS, slugify(topic["title"])
    )
    filepath = os.path.join(CONTENT_WELLNESS, filename)

    article = f"""---
title: '{topic['title']}'
author: 'danielsilvajobs'
publishDate: {DATE}
category: '{category}'
tags: ['Wellness', 'Mental Health', 'SRE']
description: 'Practical strategies for maintaining mental health, preventing burnout, and building resilience in high-pressure engineering roles.'
readingTime: 5
---

## {category}

SRE and platform engineering teams operate at the intersection of technical complexity and human limits. The culture that produces resilient systems often forgets to build resilience into the people who maintain them.

### Why This Topic Matters

{topic['why']}

### Structural Solutions (Not Just "Take More Breaks")

{topic['solutions']}

### The Bottom Line

{topic['bottom']}
"""

    with open(filepath, "w") as f:
        f.write(article)
    print(f"  [wellness] src/content/wellness/{filename}", file=sys.stderr)
    return filename


# ── Git Workflow ───────────────────────────────────────────────────────────

def git_commit_and_push(tech_file: str, wellness_file: str):
    branch = f"articles/{datetime.now(timezone.utc).strftime('%Y%m%d')}"
    os.chdir(REPO_DIR)

    print(f"\n=== Git workflow (branch: {branch}) ===", file=sys.stderr)

    # Create branch from main if it doesn't exist
    if not shell(["git", "rev-parse", "--verify", branch]):
        out = subprocess.run(
            ["git", "checkout", "-b", branch, "origin/main"],
            capture_output=True, text=True, timeout=30,
        )
        if out.returncode != 0:
            # Try without origin
            out = subprocess.run(
                ["git", "checkout", "-b", branch],
                capture_output=True, text=True, timeout=30,
            )
        print(f"  {out.stdout.strip() or out.stderr.strip()}", file=sys.stderr)

    subprocess.run(["git", "add", "src/content/tech/", "src/content/wellness/"], check=False)

    commit_msg = f"Auto-generated articles for {DATE}"
    out = subprocess.run(
        ["git", "commit", "-m", commit_msg],
        capture_output=True, text=True, timeout=30,
    )
    if out.returncode == 0:
        print(f"  [git] committed: {commit_msg}", file=sys.stderr)
        push = subprocess.run(
            ["git", "push", "origin", branch],
            capture_output=True, text=True, timeout=30,
        )
        if push.returncode == 0:
            print(f"  [git] pushed to origin/{branch}", file=sys.stderr)
        else:
            print(f"  [git] push failed (may be local-only): {push.stderr.strip()[:200]}", file=sys.stderr)
    else:
        print(f"  [git] no changes or error: {out.stdout.strip() or out.stderr.strip()}", file=sys.stderr)


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    print(
        f"=== k8sm8s Article Generator — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} ===",
        file=sys.stderr,
    )

    tech_file = generate_tech_article()
    wellness_file = generate_wellness_article()
    git_commit_and_push(tech_file, wellness_file)

    print("\n=== Done ===", file=sys.stderr)


if __name__ == "__main__":
    main()

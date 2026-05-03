## Article Submission Checklist

Thank you for contributing to k8sm8s! Please complete this checklist before requesting a review.

### Type of Contribution

- [ ] New **Technical** article (`src/content/tech/`)
- [ ] New **Wellness** article (`src/content/wellness/`)
- [ ] Update to an existing article
- [ ] Bug fix / site improvement

---

### Frontmatter Validation

Confirm your Markdown file includes all required frontmatter fields.

**For Technical articles:**

```yaml
---
title: "Your Article Title"
author: "your-github-handle"
publishDate: 2025-01-01
tags: ["K8s", "Networking"]   # at least one tag
description: "A concise description under 200 characters."
---
```

**For Wellness articles:**

```yaml
---
title: "Your Article Title"
author: "your-github-handle"
category: "Mental"            # one of: Mental | Physical | Burnout
publishDate: 2025-01-01
readingTime: 8                # estimated minutes
description: "A concise description under 200 characters."
---
```

- [ ] Frontmatter is present and complete
- [ ] `publishDate` is in `YYYY-MM-DD` format
- [ ] `description` is 200 characters or fewer
- [ ] File is saved as `kebab-case.md` in the correct directory

---

### Content Guidelines

- [ ] Title is specific and descriptive (not clickbait)
- [ ] Content is accurate and technically sound
- [ ] Code blocks specify a language (` ```yaml `, ` ```bash `, etc.)
- [ ] External links open in context and are not behind paywalls
- [ ] No personally identifiable information about others included
- [ ] **Wellness articles only:** Content is empathetic, evidence-informed, and not prescriptive medical advice

---

### File Naming

- [ ] Filename uses `kebab-case` and matches the article topic
- [ ] No spaces or special characters in filename
- [ ] Placed in the correct directory:
  - Technical → `src/content/tech/your-article.md`
  - Wellness → `src/content/wellness/your-article.md`

---

### Self-Review

- [ ] I have previewed this article using `npm run dev`
- [ ] Markdown renders correctly (headings, code blocks, lists)
- [ ] No broken links
- [ ] Spell-checked

---

### Additional Context

<!-- Anything reviewers should know: motivation, sources, related issues, etc. -->

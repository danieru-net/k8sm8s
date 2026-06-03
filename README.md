# k8sm8s

> Kubernetes engineering meets human sustainability.

A community platform for engineers navigating technical excellence alongside mental and physical wellbeing. All content is written by practitioners and contributed via pull request.

**Live site:** [k8sm8s.com](https://k8sm8s.com)

---

## How to Contribute

All content lives as Markdown files in this repository. Contributing is a standard GitHub pull request workflow — no special tools or accounts required beyond a GitHub login.

### Before you start

1. **Fork the repository** and clone your fork locally
2. **Install dependencies:** `npm install`
3. **Start the dev server:** `npm run dev` — the site is live at `http://localhost:4321`

---

### Writing a Technical Article

Technical articles live in `src/content/tech/`. Each article is a single Markdown file.

**Create your file:**

```text
src/content/tech/your-article-title.md
```

Use `kebab-case` for the filename. It becomes the article's URL path.

**Required frontmatter:**

```yaml
---
title: "Your Article Title"
author: "your-github-handle"
publishDate: 2025-06-01
tags: ["K8s", "Networking"]
description: "A concise description under 200 characters."
---

Your article content starts here...
```

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | Specific and descriptive |
| `author` | string | Your GitHub username (no `@`) |
| `publishDate` | `YYYY-MM-DD` | Date of publication |
| `tags` | string array | At least one required. See common tags below |
| `description` | string | ≤ 200 characters. Shown in cards and meta tags |

**Common tags:** `K8s`, `Networking`, `Security`, `RBAC`, `Observability`, `Storage`, `Autoscaling`, `GitOps`, `eBPF`, `Service Mesh`, `CNI`, `Operators`, `CI/CD`, `Compliance`

---

### Writing a Wellness Article

Wellness articles live in `src/content/wellness/`. Same Markdown format with a different schema.

**Required frontmatter:**

```yaml
---
title: "Your Article Title"
author: "your-github-handle"
category: "Burnout"
publishDate: 2025-06-01
readingTime: 7
description: "A concise description under 200 characters."
---
```

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | — |
| `author` | string | Your GitHub username |
| `category` | enum | Must be exactly one of: `Mental`, `Physical`, `Burnout` |
| `publishDate` | `YYYY-MM-DD` | — |
| `readingTime` | number | Estimated minutes to read |
| `description` | string | ≤ 200 characters |

**Content guidelines for Wellness articles:**

- Write from direct experience where possible
- Avoid prescriptive medical or clinical advice — frame as "what worked for me/us" or cite evidence
- Use plain language; assume readers may be exhausted
- WCAG AA readability is a priority: short paragraphs, clear headings, no jargon walls

---

### Submitting your pull request

1. **Create a branch** from `main`: `git checkout -b article/your-topic`
2. **Write your article** following the frontmatter schema above
3. **Preview locally** with `npm run dev` — verify it renders correctly
4. **Push your branch** and open a pull request against `main`
5. **Fill out the PR template** — it guides you through the submission checklist
6. A Netlify Deploy Preview will automatically build your article so reviewers can see the rendered output before merging

---

### Local development commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start local dev server at `http://localhost:4321` |
| `npm run build` | Production build (also validates all frontmatter schemas) |
| `npm run preview` | Preview the production build locally |

**Build as validation:** If your frontmatter is missing required fields or uses wrong types, `npm run build` will fail with a clear Zod error message. Run this before opening a PR.

---

### Pre-commit hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). When you commit, these run automatically on staged files:

- `markdownlint --fix` — fixes common Markdown style issues
- `prettier --write` — formats your Markdown consistently

If a hook fails, fix the reported issues and commit again.

To set up hooks after cloning: `npm install` (the `prepare` script runs `husky` automatically).

---

### Configuring Giscus (maintainers)

Comments are powered by [Giscus](https://giscus.app), which uses GitHub Discussions as a backend.

**One-time setup:**

1. Enable **Discussions** in your repository settings (Settings → Features → Discussions)
2. Install the [Giscus GitHub App](https://github.com/apps/giscus) on the repository
3. Visit [giscus.app](https://giscus.app), configure it for your repo, and copy the generated `data-repo-id` and `data-category-id`
4. Update `src/consts.ts`:

   ```ts
   export const GISCUS_REPO = 'your-org/your-repo';
   export const GISCUS_REPO_ID = 'R_...';
   export const GISCUS_CATEGORY = 'Article Comments';
   export const GISCUS_CATEGORY_ID = 'DIC_...';
   ```

---

### Netlify deployment (maintainers)

The site deploys automatically via Netlify. Configuration is in `netlify.toml`.

- **Main branch** → production deploy at `k8sm8s.com`
- **Pull requests** → Deploy Preview URL posted as a PR status check
- **Rebuild hook** → Netlify rebuilds on every push to `main`

To connect a new Netlify site:

1. Import the repository in the Netlify dashboard
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Node version: `22` (set in `netlify.toml`)

---

### Project structure

```text
k8sm8s/
├── .github/
│   ├── workflows/ci.yml            # Markdown lint + build validation
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── public/
│   ├── images/
│   │   ├── tech/                   # Article images for tech section
│   │   └── wellness/               # Article images for wellness section
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ArticleCard.astro       # Static article card
│   │   ├── FilterSystem.tsx        # React island: tag/category filter
│   │   ├── Footer.astro
│   │   ├── GiscusComments.tsx      # React island: discussion section
│   │   ├── Header.astro            # Includes Search island
│   │   └── Search.tsx              # React island: Fuse.js command palette
│   ├── content/
│   │   ├── tech/                   # Technical articles (.md)
│   │   └── wellness/               # Wellness articles (.md)
│   ├── layouts/
│   │   ├── ArticleLayout.astro     # Article pages (edit button, Giscus)
│   │   └── BaseLayout.astro        # Base HTML shell
│   ├── pages/
│   │   ├── index.astro             # Homepage
│   │   ├── tech/index.astro        # Tech listing
│   │   ├── tech/[...slug].astro
│   │   ├── wellness/index.astro
│   │   └── wellness/[...slug].astro
│   ├── styles/global.css
│   ├── consts.ts                   # Site-wide constants + Giscus config
│   ├── content.config.ts           # Zod schemas for both collections
│   └── env.d.ts
├── astro.config.mjs
├── netlify.toml
├── package.json
└── tsconfig.json
```

---

### Code of conduct

This community exists to support engineers — technically and as human beings. Be direct, be kind, and assume good faith. Contributions that demean, exclude, or harm will not be merged.

---

### License

Content is licensed under [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).  
Code is licensed under the [MIT License](LICENSE).

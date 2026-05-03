import { useEffect, useRef } from 'react';

interface GiscusCommentsProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  theme?: string;
}

export default function GiscusComments({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  theme = 'dark_dimmed',
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up any previous script to prevent duplicates on HMR
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [repo, repoId, category, categoryId, mapping, theme]);

  // Placeholder shown before Giscus JS loads and when IDs aren't configured
  const isConfigured =
    repoId !== 'REPLACE_WITH_REPO_ID' && categoryId !== 'REPLACE_WITH_CATEGORY_ID';

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-[#2D3748] p-8 text-center">
        <p className="text-slate-500 text-sm mb-2">Giscus comments not yet configured.</p>
        <p className="text-slate-600 text-xs">
          Visit{' '}
          <a
            href="https://giscus.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            giscus.app
          </a>{' '}
          to generate your repo ID and category ID, then update{' '}
          <code className="text-cyan-300 font-mono text-xs">src/consts.ts</code>.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="giscus-container" />;
}

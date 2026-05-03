import { useState, useMemo } from 'react';

export interface FilterableArticle {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  type: 'tech' | 'wellness';
  tags?: string[];
  category?: string;
  author: string;
  readingTime?: number;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSystemProps {
  articles: FilterableArticle[];
  filters: FilterOption[];
  type: 'tech' | 'wellness';
}

const categoryClasses: Record<string, string> = {
  Mental:
    'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  Physical:
    'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  Burnout:
    'bg-amber-500/10 text-amber-300 border border-amber-500/20',
};

function ArticleCard({ article }: { article: FilterableArticle }) {
  const href = `/${article.type}/${article.slug}`;
  const date = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <a
      href={href}
      className="group flex flex-col bg-[#1A1D2E] hover:bg-[#242838] border border-[#2D3748] hover:border-slate-600 rounded-xl p-6 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <time className="text-xs text-slate-500">{date}</time>
        {article.category && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
              categoryClasses[article.category] ?? 'bg-slate-700 text-slate-300'
            }`}
          >
            {article.category}
          </span>
        )}
      </div>

      <h2 className="text-base font-semibold text-slate-100 group-hover:text-white leading-snug mb-2 line-clamp-2">
        {article.title}
      </h2>

      <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3 flex-1">
        {article.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2D3748]">
        <div className="flex flex-wrap gap-1.5">
          {article.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
        {article.readingTime && (
          <span className="text-xs text-slate-600 shrink-0 ml-2">{article.readingTime} min</span>
        )}
      </div>
    </a>
  );
}

export default function FilterSystem({ articles, filters, type }: FilterSystemProps) {
  const [active, setActive] = useState<Set<string>>(new Set());

  const toggle = (value: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (active.size === 0) return articles;
    return articles.filter(
      (a) =>
        a.tags?.some((t) => active.has(t)) ||
        (a.category && active.has(a.category))
    );
  }, [articles, active]);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter articles">
        <button
          onClick={() => setActive(new Set())}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active.size === 0
              ? 'bg-[#326CE5] text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#1A1D2E] text-slate-400 border border-[#2D3748] hover:text-slate-200 hover:border-slate-600'
          }`}
          aria-pressed={active.size === 0}
        >
          All
        </button>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => toggle(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              active.has(f.value)
                ? 'bg-[#326CE5] text-white shadow-lg shadow-blue-500/20'
                : 'bg-[#1A1D2E] text-slate-400 border border-[#2D3748] hover:text-slate-200 hover:border-slate-600'
            }`}
            aria-pressed={active.has(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 mb-6">
        {filtered.length} article{filtered.length !== 1 ? 's' : ''}
        {active.size > 0 && ' matching selected filters'}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-slate-500 text-lg mb-2">No articles match your filters.</p>
          <button
            onClick={() => setActive(new Set())}
            className="text-sm text-sky-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

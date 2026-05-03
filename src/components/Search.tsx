import Fuse from 'fuse.js';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

export interface SearchItem {
  title: string;
  description: string;
  slug: string;
  type: 'tech' | 'wellness';
  tags?: string[];
  category?: string;
}

interface SearchProps {
  items: SearchItem[];
}

const TypeBadge = ({ type }: { type: 'tech' | 'wellness' }) =>
  type === 'tech' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
      ⚙ Tech
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
      🌱 Wellness
    </span>
  );

export default function Search({ items }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'description', weight: 1.5 },
          { name: 'tags', weight: 0.8 },
          { name: 'category', weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [items]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query)
      .slice(0, 8)
      .map((r) => r.item);
  }, [query, fuse]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      window.location.href = `/${results[activeIndex].type}/${results[activeIndex].slug}`;
      close();
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#242838] border border-[#2D3748] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-sm"
        aria-label="Search articles (⌘K)"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden sm:block">Search</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-[#1A1D2E] border border-[#2D3748] rounded-xl shadow-2xl overflow-hidden">
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2D3748]">
              <svg
                className="w-5 h-5 text-slate-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tech and wellness articles…"
                className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-base"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={close}
                className="px-2 py-1 rounded text-xs text-slate-600 border border-slate-700 hover:border-slate-600 hover:text-slate-400 transition-colors font-mono"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <ul
                ref={listRef}
                className="py-2 max-h-[28rem] overflow-y-auto"
                role="listbox"
              >
                {results.map((item, idx) => (
                  <li key={`${item.type}-${item.slug}`} role="option" aria-selected={idx === activeIndex}>
                    <a
                      href={`/${item.type}/${item.slug}`}
                      onClick={close}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-start gap-3 mx-2 px-3 py-3 rounded-lg transition-colors ${
                        idx === activeIndex
                          ? 'bg-[#242838]'
                          : 'hover:bg-[#242838]/60'
                      }`}
                    >
                      <TypeBadge type={item.type} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-200 text-sm leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      {idx === activeIndex && (
                        <kbd className="shrink-0 text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5 font-mono self-center">
                          ↵
                        </kbd>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            ) : query.trim() ? (
              <p className="py-10 text-center text-slate-500 text-sm">
                No results for <span className="text-slate-300">"{query}"</span>
              </p>
            ) : (
              <div className="py-8 px-6">
                <p className="text-center text-slate-500 text-sm mb-4">
                  Search across tech and wellness articles
                </p>
                <div className="flex justify-center gap-6 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-slate-700 rounded px-1.5 py-0.5 font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-slate-700 rounded px-1.5 py-0.5 font-mono">↵</kbd>
                    open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-slate-700 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
                    close
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

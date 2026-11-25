import { ChevronDownIcon } from "@/components/ui/icons";
import { pillClass } from "@/lib/styles";
import type { Post } from "@/types";
import type { IdentifierType } from "@/types/api";

import PostCard from "./PostCard";

export type FeedFilter = IdentifierType | "all";
export type FeedOrder = "latest" | "oldest";

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "phone", label: "Phone numbers" },
  { value: "account", label: "Bank accounts" },
  { value: "url", label: "Links" },
];

interface FeedProps {
  posts: Post[];
  filter: FeedFilter;
  order: FeedOrder;
  onFilterChange: (filter: FeedFilter) => void;
  onOrderChange: (order: FeedOrder) => void;
}

export default function Feed({ posts, filter, order, onFilterChange, onOrderChange }: FeedProps) {
  return (
    <section aria-label="Community posts">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filter by type">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => onFilterChange(item.value)}
              className={pillClass(filter === item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <select
            value={order}
            onChange={(e) => onOrderChange(e.target.value as FeedOrder)}
            aria-label="Sort posts"
            className="appearance-none rounded-full border border-slate-200 bg-white py-2.5 pl-5 pr-10 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-300" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} tone={index} />
        ))}
      </div>
    </section>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";

import { getErrorMessage, listFeed } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { IDENTIFIER_TYPE_LABELS, scamTypeLabel } from "@/lib/labels";
import { errorClass, primaryButtonClass, secondaryButtonClass } from "@/lib/styles";
import type { Post } from "@/types";
import type { FeedPost } from "@/types/api";

import Feed from "./Feed";
import type { FeedFilter, FeedOrder } from "./Feed";

const PAGE_SIZE = 20;
const POLL_MS = 15000; // check for new posts every 15 seconds

// What to ask the backend for, given the tab and sort picked above the feed.
function buildOptions(filter: FeedFilter, order: FeedOrder) {
  return {
    identifierType: filter === "all" ? undefined : filter,
    newestFirst: order === "latest",
  };
}

// Turns a report from the API into the shape PostCard already knows how to draw.
function toPost(item: FeedPost): Post {
  const kind = IDENTIFIER_TYPE_LABELS[item.identifier_type].toLowerCase();
  const scam = scamTypeLabel(item.scam_type);
  const isUrl = item.identifier_type === "url";
  return {
    id: item.id,
    username: item.reporter,
    timeAgo: timeAgo(item.created_at),
    content: isUrl ? `Reported this ${kind} as ${scam}.` : `Reported ${kind} ${item.identifier_value} as ${scam}.`,
    link: isUrl ? item.identifier_value : undefined, // shown as plain text, never a clickable link
    risk: item.risk_level,
  };
}

export default function LiveFeed() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [order, setOrder] = useState<FeedOrder>("latest");

  const [items, setItems] = useState<FeedPost[]>([]);
  const [incoming, setIncoming] = useState<FeedPost[]>([]); // new posts waiting behind the button
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every post id fetched so far. Used to tell new posts from ones already on screen.
  const known = useRef<Set<number>>(new Set<number>());
  // Goes up every time the tab or sort changes, so an old "Load more" can't add to the new list.
  const listVersion = useRef(0);

  // First page. Runs again whenever the tab or the sort changes.
  useEffect(() => {
    let cancelled = false;
    listVersion.current += 1;
    known.current = new Set<number>();
    setItems([]);
    setIncoming([]);
    setHasMore(false);
    setError(null);
    setLoading(true);

    listFeed(0, PAGE_SIZE, buildOptions(filter, order))
      .then((first) => {
        if (cancelled) return;
        first.forEach((item) => known.current.add(item.id));
        setItems(first);
        setHasMore(first.length === PAGE_SIZE);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, order]);

  // Live updates: ask for the newest page on a timer. Anything unseen waits behind the button,
  // so the page never jumps under the reader. Only makes sense when newest posts come first.
  useEffect(() => {
    if (loading || order !== "latest") return;
    let cancelled = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return; // skip while the tab is in the background
      try {
        const latest = await listFeed(0, PAGE_SIZE, buildOptions(filter, order));
        if (cancelled) return;
        const fresh = latest.filter((item) => !known.current.has(item.id));
        if (fresh.length > 0) {
          fresh.forEach((item) => known.current.add(item.id));
          setIncoming((current) => [...fresh, ...current]);
        }
      } catch {
        // A failed check is ignored. The next one tries again.
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [loading, filter, order]);

  function showIncoming() {
    setItems((current) => [...incoming, ...current]);
    setIncoming([]);
  }

  async function loadMore() {
    const version = listVersion.current;
    setLoadingMore(true);
    try {
      const older = await listFeed(known.current.size, PAGE_SIZE, buildOptions(filter, order));
      if (version !== listVersion.current) return; // the tab or sort changed meanwhile
      const fresh = older.filter((item) => !known.current.has(item.id));
      fresh.forEach((item) => known.current.add(item.id));
      setItems((current) => [...current, ...fresh]);
      setHasMore(older.length === PAGE_SIZE);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-4">
      {incoming.length > 0 ? (
        <button type="button" onClick={showIncoming} className={`${primaryButtonClass} w-full`}>
          Show {incoming.length} new {incoming.length === 1 ? "post" : "posts"}
        </button>
      ) : null}

      <Feed
        posts={items.map(toPost)}
        filter={filter}
        order={order}
        onFilterChange={setFilter}
        onOrderChange={setOrder}
      />

      {loading ? <p className="text-slate-600 dark:text-slate-300">Loading posts...</p> : null}
      {error ? <p className={errorClass}>{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-300">No reports yet.</p>
      ) : null}

      {hasMore ? (
        <button type="button" onClick={loadMore} disabled={loadingMore} className={`${secondaryButtonClass} w-full`}>
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
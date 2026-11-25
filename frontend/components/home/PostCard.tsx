import type { ReactNode } from "react";

import Avatar from "@/components/ui/Avatar";
import { CommentIcon, HeartIcon, MoreIcon, RepeatIcon } from "@/components/ui/icons";
import RiskBadge from "@/components/ui/RiskBadge";
import type { Post } from "@/types";

function CallScreenshot() {
  return (
    <div
      role="img"
      aria-label="Screenshot of an incoming call"
      className="flex h-[100px] w-[132px] flex-col justify-between rounded-lg bg-slate-900 p-2.5 text-white"
    >
      <div>
        <p className="text-[8px] text-slate-400">Incoming Call</p>
        <p className="text-[11px] font-semibold">080123455678</p>
      </div>
      <div className="flex justify-between px-2">
        <span className="h-6 w-6 rounded-full bg-red-500" />
        <span className="h-6 w-6 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}

function PhotoPlaceholder() {
  return <div role="img" aria-label="Attached photo" className="h-[100px] w-[140px] rounded-lg bg-slate-200 dark:bg-slate-700" />;
}

function Action({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${count}`}
      className="flex items-center gap-2 rounded-full py-1 pr-2 text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:text-white"
    >
      {children}
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

export default function PostCard({ post, tone }: { post: Post; tone: number }) {
  const attachment =
    post.attachment === "call-screenshot" ? <CallScreenshot /> : post.attachment === "photo" ? <PhotoPlaceholder /> : null;

  return (
    <article className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:gap-4 sm:p-5">
      <Avatar name={post.username} tone={tone} />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="break-all font-bold text-slate-900 dark:text-white">{post.username}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{post.timeAgo}</span>
        </p>

        {/* Phones: the badge sits under the name. From sm up it moves to the right-hand column. */}
        <div className="mt-2 sm:hidden">
          <RiskBadge level={post.risk} />
        </div>

        <p className="mt-1.5 text-slate-800 dark:text-slate-200">{post.content}</p>
        {post.link ? (
          // Scam links are shown as plain text on purpose. Never render them as clickable anchors.
          <p className="mt-1 break-all text-blue-600 dark:text-blue-400">{post.link}</p>
        ) : null}

        {attachment ? <div className="mt-3 sm:hidden">{attachment}</div> : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-5">
          <Action label="Likes" count={post.likes}>
            <HeartIcon className="h-5 w-5" />
          </Action>
          <Action label="Comments" count={post.comments}>
            <CommentIcon className="h-5 w-5" />
          </Action>
          <Action label="Reposts" count={post.reposts}>
            <RepeatIcon className="h-5 w-5" />
          </Action>
          <button
            type="button"
            aria-label="More options"
            className="rounded-full p-1 text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-300 dark:hover:text-white"
          >
            <MoreIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-3 sm:flex">
        <RiskBadge level={post.risk} />
        {attachment}
      </div>
    </article>
  );
}
import { Link } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  relativeTime,
  type PostWithProfile,
} from "@/lib/domain";
import { StatusBadge, TypeBadge } from "./badges";

export function PostCard({ post }: { post: PostWithProfile }) {
  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      className="block bg-surface rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] hover:border-primary/40 hover:-translate-y-0.5 transition"
    >
      <div className="flex gap-3 p-3">
        <div
          className="size-20 shrink-0 rounded-xl flex items-center justify-center text-4xl overflow-hidden"
          style={{ background: `oklch(0.94 0.05 ${post.image_hue})` }}
          aria-hidden
        >
          {post.image_url ? (
            <img src={post.image_url} alt="" className="size-full object-cover" />
          ) : (
            post.image_emoji
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
          </div>
          <h3 className="mt-1.5 font-semibold text-[15px] leading-snug line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground truncate">
            {CATEGORY_EMOJI[post.category]} {CATEGORY_LABEL[post.category]}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0" /> {post.location_text || "ไม่ระบุ"}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="size-3" /> {relativeTime(post.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

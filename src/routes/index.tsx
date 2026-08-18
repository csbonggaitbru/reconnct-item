import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Sparkles, Filter, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type Category,
} from "@/lib/domain";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reunite — ฟีดของหาย / พบของรอบตัวคุณ" },
      {
        name: "description",
        content:
          "เรียกดูประกาศของหายและของที่พบใกล้คุณ พร้อมระบบยืนยันตัวตนและสถานะเคสที่โปร่งใส",
      },
      { property: "og:title", content: "Reunite — ฟีดของหาย / พบของรอบตัวคุณ" },
      {
        property: "og:description",
        content: "ประกาศของหายและพบของในชุมชนที่ตรวจสอบได้",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeedPage,
});

const FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "lost", label: "ของหาย" },
  { id: "found", label: "พบของ" },
] as const;

function FeedPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const { profile, session } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", filter, category],
    queryFn: async () => {
      let q = supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (filter !== "all") q = q.eq("type", filter);
      if (category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppShell
      topBar={
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> ประกาศล่าสุดในชุมชน
              </p>
              <h1 className="text-[22px] font-bold leading-tight">
                {profile ? `สวัสดี, ${profile.display_name} 👋` : "Reunite 🤝"}
              </h1>
            </div>
            {!session && (
              <Link
                to="/auth"
                className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-[13px] font-medium flex items-center gap-1.5"
              >
                <LogIn className="size-4" /> เข้าสู่ระบบ
              </Link>
            )}
          </div>

          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition ${
                  filter === f.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-surface text-muted-foreground border-border"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 px-3 rounded-full bg-surface border border-border text-[12px] text-muted-foreground">
              <Filter className="size-3" /> ตัวกรอง
            </div>
          </div>
        </header>
      }
    >
      <section className="px-4 pt-4">
        <Link
          to="/new"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.12_205)] text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">เริ่มประกาศใหม่</p>
            <p className="text-[12.5px] opacity-90">แจ้งของหาย หรือของที่คุณพบในไม่กี่ขั้นตอน</p>
          </div>
          <span aria-hidden className="text-xl">→</span>
        </Link>
      </section>

      <section className="px-4 pt-5">
        <h2 className="font-semibold text-foreground mb-2">หมวดหมู่</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
          <CategoryPill
            label="ทั้งหมด"
            emoji="✨"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {CATEGORIES.map((c) => (
            <CategoryPill
              key={c}
              label={CATEGORY_LABEL[c]}
              emoji={CATEGORY_EMOJI[c]}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </section>

      <section className="px-4 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">ประกาศ ({posts.length})</h2>
          <span className="text-[12px] text-muted-foreground">ใหม่ล่าสุด</span>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            ยังไม่มีประกาศในหมวดที่เลือก — ลองเป็นคนแรกที่ประกาศดูสิ
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </section>
    </AppShell>
  );
}

function CategoryPill({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex flex-col items-center justify-center gap-1 w-[72px] h-[78px] rounded-2xl border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-pop)]"
          : "bg-surface text-foreground border-border"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[11px] font-medium leading-tight text-center px-1 line-clamp-2">
        {label}
      </span>
    </button>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MapPin, Sparkles, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CURRENT_USER,
  POSTS,
  type Category,
} from "@/lib/mock-data";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reunite — ฟีดของหาย / พบของรอบตัวคุณ" },
      {
        name: "description",
        content:
          "เรียกดูประกาศของหายและของที่พบใกล้คุณ พร้อมระบบยืนยันตัวตนและสถานะเคสที่โปร่งใส",
      },
    ],
  }),
  component: FeedPage,
});

const FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "lost", label: "ของหาย" },
  { id: "found", label: "พบของ" },
] as const;

const CATEGORIES: Category[] = [
  "electronics",
  "wallet",
  "keys",
  "documents",
  "bag",
  "jewelry",
  "pet",
  "clothing",
];

function FeedPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const posts = useMemo(() => {
    return POSTS.filter((p) => (filter === "all" ? true : p.type === filter)).filter(
      (p) => (category === "all" ? true : p.category === category),
    );
  }, [filter, category]);

  return (
    <AppShell
      topBar={
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> กรุงเทพ · 5 กม.
              </p>
              <h1 className="text-[22px] font-bold leading-tight">
                สวัสดี, {CURRENT_USER.name.split(" ")[0]} 👋
              </h1>
            </div>
            <button
              className="size-10 rounded-full bg-surface border border-border flex items-center justify-center text-foreground relative"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full" />
            </button>
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">หมวดหมู่ยอดนิยม</h2>
          <button className="text-[12.5px] text-primary font-medium">ดูทั้งหมด</button>
        </div>
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
          <h2 className="font-semibold text-foreground">รอบ ๆ คุณ ({posts.length})</h2>
          <span className="text-[12px] text-muted-foreground">ใหม่ล่าสุด</span>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            ยังไม่มีโพสต์ในหมวดที่เลือก ลองเปลี่ยนตัวกรองดูนะ
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

import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "ค้นหาประกาศ — Reunite" },
      { name: "description", content: "ค้นหาประกาศของหายและพบของด้วยคำสำคัญ" },
      { property: "og:title", content: "ค้นหาประกาศ — Reunite" },
      { property: "og:description", content: "ค้นหาของหายและของที่พบด้วยคำสำคัญ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const term = q.trim();
      let query = supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (term) {
        const like = `%${term}%`;
        query = query.or(
          `title.ilike.${like},description.ilike.${like},location_text.ilike.${like}`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const popular = ["AirPods", "กระเป๋าสตางค์", "กุญแจ", "แมว", "บัตร"];

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 space-y-3 bg-background border-b border-border">
          <h1 className="text-[20px] font-bold">ค้นหา</h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-xl bg-surface border border-border focus-within:border-primary">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="คำสำคัญ เช่น AirPods, กระเป๋า"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
              />
            </div>
          </div>
        </header>
      }
    >
      <section className="px-4 pt-5">
        <p className="text-[12.5px] text-muted-foreground mb-2">ค้นหายอดนิยม</p>
        <div className="flex flex-wrap gap-2">
          {popular.map((tag) => (
            <button
              key={tag}
              onClick={() => setQ(tag)}
              className="chip bg-surface border border-border text-foreground"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6 space-y-3">
        <h2 className="font-semibold">ผลลัพธ์ ({results.length})</h2>
        {isLoading ? (
          <div className="h-28 rounded-2xl bg-muted animate-pulse" />
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            ไม่พบประกาศที่ตรงกับคำค้น "{q}"
          </div>
        ) : (
          results.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </section>
    </AppShell>
  );
}

import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type Category,
  type PostType,
} from "@/lib/domain";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "สร้างประกาศใหม่ — Reunite" },
      { name: "description", content: "แจ้งของหายหรือพบของบน Reunite ในไม่กี่ขั้นตอน" },
      { property: "og:title", content: "สร้างประกาศใหม่ — Reunite" },
      { property: "og:description", content: "แจ้งของหายหรือพบของในไม่กี่ขั้นตอน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewPostPage,
});

const HUES: Record<Category, number> = {
  electronics: 195,
  wallet: 30,
  keys: 340,
  documents: 210,
  bag: 145,
  jewelry: 50,
  pet: 25,
  clothing: 280,
  other: 200,
};

function NewPostPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { userId, loading } = useAuth();
  const [type, setType] = useState<PostType>("lost");
  const [category, setCategory] = useState<Category>("electronics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [location, setLocation] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !userId) void navigate({ to: "/auth" });
  }, [loading, userId, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          type,
          category,
          title,
          description,
          marks,
          location_text: location,
          happened_at: happenedAt ? new Date(happenedAt).toISOString() : new Date().toISOString(),
          image_emoji: CATEGORY_EMOJI[category],
          image_hue: HUES[category],
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("เผยแพร่ประกาศเรียบร้อย");
      void navigate({ to: "/post/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.history.back()}
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-[17px] font-semibold flex-1">สร้างประกาศใหม่</h1>
      </header>

      <form onSubmit={onSubmit} className="px-4 py-5 space-y-5">
        <section>
          <Label>ประเภทประกาศ</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <TypeTile
              active={type === "lost"}
              onClick={() => setType("lost")}
              emoji="🔎"
              title="แจ้งของหาย"
              desc="ฉันทำของหายและกำลังตามหา"
            />
            <TypeTile
              active={type === "found"}
              onClick={() => setType("found")}
              emoji="🤝"
              title="แจ้งพบของ"
              desc="ฉันพบของและอยากส่งคืน"
            />
          </div>
        </section>

        <section>
          <Label>หมวดหมู่</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition ${
                  category === c
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                <span className="text-xl">{CATEGORY_EMOJI[c]}</span>
                <span className="text-[11.5px] font-medium text-center leading-tight px-1">
                  {CATEGORY_LABEL[c]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <Label htmlFor="title">หัวข้อ</Label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น พบ AirPods Pro สีขาว"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary"
          />
        </section>

        <section>
          <Label htmlFor="desc">รายละเอียด</Label>
          <textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="บอกบริบทเพิ่มเติม เช่น สถานการณ์ที่พบ/หาย"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary resize-none"
          />
        </section>

        <section>
          <Label htmlFor="marks">ตำหนิ / จุดสังเกต *</Label>
          <textarea
            id="marks"
            rows={2}
            required
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="รายละเอียดที่เจ้าของของจริงเท่านั้นที่ตอบได้"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-accent/10 border border-accent/40 text-[14px] focus:outline-none focus:border-accent resize-none"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            ระบบจะใช้ข้อมูลนี้เพื่อยืนยันตัวเจ้าของจริง
          </p>
        </section>

        <section>
          <Label>สถานที่</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <MapPin className="size-4 text-primary" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
              placeholder="เช่น BTS อโศก, กรุงเทพ"
            />
          </div>
        </section>

        <section>
          <Label>วันเวลาที่เกิดเหตุ</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <Calendar className="size-4 text-primary" />
            <input
              type="datetime-local"
              value={happenedAt}
              onChange={(e) => setHappenedAt(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
            />
          </div>
        </section>

        <div className="pt-2 flex gap-2">
          <Link
            to="/"
            className="flex-1 h-12 rounded-xl border border-border bg-surface flex items-center justify-center font-medium"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            เผยแพร่ประกาศ
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
      {children}
    </label>
  );
}

function TypeTile({
  active,
  onClick,
  emoji,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-3 border transition ${
        active ? "border-primary bg-primary-soft" : "border-border bg-surface"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className={`mt-1 font-semibold text-[13.5px] ${active ? "text-primary" : ""}`}>
        {title}
      </p>
      <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </button>
  );
}

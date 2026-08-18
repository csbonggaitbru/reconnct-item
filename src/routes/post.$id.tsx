import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Send,
  Lock,
  Flag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  STATUS_LABEL,
  initialsOf,
  relativeTime,
  type CommentRow,
  type PostRow,
  type PostStatus,
  type ProfileRow,
} from "@/lib/domain";

export const Route = createFileRoute("/post/$id")({
  head: () => ({
    meta: [
      { title: "รายละเอียดประกาศ — Reunite" },
      { name: "description", content: "ดูรายละเอียดประกาศของหาย / พบของ และประสานงานกับผู้โพสต์" },
      { property: "og:title", content: "รายละเอียดประกาศ — Reunite" },
      { property: "og:description", content: "ดูรายละเอียดประกาศและประสานงานส่งคืนของ" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">ไม่พบโพสต์</div>,
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!post) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", post.user_id)
        .maybeSingle();
      return { post: post as PostRow, profile: (profile ?? null) as ProfileRow | null };
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at");
      if (error) throw error;
      const ids = [...new Set(rows.map((r) => r.user_id))];
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("*").in("id", ids)
        : { data: [] as ProfileRow[] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null })) as Array<
        CommentRow & { profile: ProfileRow | null }
      >;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: id, user_id: userId, message: message.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      void qc.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: async (status: PostStatus) => {
      const { error } = await supabase.from("posts").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("อัปเดตสถานะแล้ว");
      void qc.invalidateQueries({ queryKey: ["post", id] });
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อนรายงาน");
      const reason = window.prompt("เหตุผลในการรายงานประกาศนี้");
      if (!reason) return;
      const { error } = await supabase
        .from("reports")
        .insert({ post_id: id, reporter_id: userId, reason });
      if (error) throw error;
      toast.success("ส่งรายงานให้แอดมินแล้ว");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AppShell hideTabs>
        <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>
      </AppShell>
    );
  }
  if (!data) {
    return (
      <AppShell hideTabs>
        <div className="p-8 text-center text-muted-foreground">ไม่พบประกาศนี้</div>
      </AppShell>
    );
  }

  const { post, profile } = data;
  const isOwner = userId === post.user_id;
  const happened = new Date(post.happened_at).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AppShell hideTabs>
      <div
        className="relative h-64 flex items-center justify-center text-8xl"
        style={{ background: `oklch(0.9 0.06 ${post.image_hue})` }}
      >
        <span aria-hidden>{post.image_emoji}</span>
        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)]"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={() => report.mutate()}
          className="absolute top-4 right-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)]"
          aria-label="รายงานโพสต์"
        >
          <Flag className="size-5" />
        </button>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span className="chip">
              {CATEGORY_EMOJI[post.category]} {CATEGORY_LABEL[post.category]}
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-bold leading-snug text-foreground">{post.title}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            โพสต์เมื่อ {relativeTime(post.created_at)}
          </p>
        </div>

        {(isOwner || isAdmin) && (
          <div className="rounded-2xl bg-surface border border-border p-4">
            <p className="text-[13px] font-semibold mb-2">จัดการสถานะเคส</p>
            <div className="flex gap-2">
              {(["searching", "arranging", "closed"] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus.mutate(s)}
                  disabled={post.status === s}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium border transition ${
                    post.status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-surface border border-border p-4 space-y-3">
          <Row
            icon={<MapPin className="size-4" />}
            label="สถานที่"
            value={post.location_text || "ไม่ระบุ"}
          />
          <Row
            icon={<Calendar className="size-4" />}
            label={post.type === "lost" ? "เวลาที่หาย" : "เวลาที่พบ"}
            value={happened}
          />
        </div>

        <section>
          <h2 className="font-semibold mb-2">รายละเอียด</h2>
          <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-line">
            {post.description || "—"}
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">ตำหนิ / จุดสังเกต</h2>
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-4 text-[14px] text-foreground/90 leading-relaxed">
            {isOwner || isAdmin ? (
              post.marks
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Lock className="size-4" /> ซ่อนไว้เพื่อยืนยันเจ้าของตัวจริง
              </span>
            )}
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4">
          <div className="size-11 rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center">
            {profile ? initialsOf(profile.display_name) : "??"}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[14px] flex items-center gap-1">
              {profile?.display_name ?? "ผู้ใช้งาน"}
              {profile?.verified && (
                <ShieldCheck className="size-4 text-primary" aria-label="ยืนยันตัวตนแล้ว" />
              )}
            </p>
            <p className="text-[12px] text-muted-foreground">
              ความน่าเชื่อถือ ★ {Number(profile?.reputation ?? 5).toFixed(1)}
            </p>
          </div>
          <Link
            to="/profile"
            className="text-[12.5px] font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-full"
          >
            โปรไฟล์
          </Link>
        </section>

        <section>
          <h2 className="font-semibold mb-2">พื้นที่ประสานงาน ({comments.length})</h2>
          <div className="space-y-2">
            {comments.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                ยังไม่มีข้อความ — เริ่มพูดคุยเพื่อยืนยันและนัดรับของได้เลย
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl bg-surface border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold">
                    {c.profile?.display_name ?? "ผู้ใช้งาน"}
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="text-[13.5px] mt-1 text-foreground/90">{c.message}</p>
                {(c.user_id === userId || isAdmin) && (
                  <button
                    onClick={async () => {
                      await supabase.from("comments").delete().eq("id", c.id);
                      void qc.invalidateQueries({ queryKey: ["comments", id] });
                    }}
                    className="mt-1 text-[11.5px] text-destructive flex items-center gap-1"
                  >
                    <Trash2 className="size-3" /> ลบ
                  </button>
                )}
              </div>
            ))}
          </div>

          {userId ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) addComment.mutate();
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-4 h-11 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
                aria-label="ส่งข้อความ"
              >
                <Send className="size-5" />
              </button>
            </form>
          ) : (
            <Link
              to="/auth"
              className="mt-3 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center"
            >
              เข้าสู่ระบบเพื่อพูดคุย
            </Link>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-primary">{icon}</span>
      <span className="text-[13px] text-muted-foreground w-24">{label}</span>
      <span className="text-[13.5px] font-medium flex-1 text-right">{value}</span>
    </div>
  );
}

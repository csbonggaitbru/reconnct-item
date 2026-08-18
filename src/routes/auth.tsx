import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Search, Handshake, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — Reunite" },
      {
        name: "description",
        content: "เข้าสู่ระบบหรือสมัครสมาชิก Reunite เพื่อเริ่มประกาศแจ้งของหายและพบของ",
      },
      { property: "og:title", content: "เข้าสู่ระบบ — Reunite" },
      { property: "og:description", content: "สมัครสมาชิกเพื่อประกาศของหายและพบของ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/", replace: true });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("สมัครสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าใช้งาน");
          return;
        }
        toast.success("ยินดีต้อนรับสู่ Reunite 🤝");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("เข้าสู่ระบบสำเร็จ");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft via-background to-background flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-[420px] flex-1">
        <div className="text-center">
          <div className="inline-flex size-16 rounded-3xl bg-primary text-primary-foreground items-center justify-center shadow-[var(--shadow-pop)] mb-5 text-3xl">
            🤝
          </div>
          <h1 className="text-[26px] font-bold leading-tight">
            ตามหาของที่หาย<br />
            <span className="text-primary">ส่งคืนของที่พบ</span>
          </h1>
          <p className="mt-3 text-[13.5px] text-muted-foreground leading-relaxed">
            พื้นที่ปลอดภัยสำหรับประสานงานระหว่างเจ้าของและผู้พบของ
          </p>
        </div>

        <div className="mt-6 flex gap-2 p-1 bg-muted rounded-xl">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition ${
                mode === m
                  ? "bg-surface text-foreground shadow-[var(--shadow-card)]"
                  : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === "signup" && (
            <Field
              label="ชื่อที่แสดง"
              value={displayName}
              onChange={setDisplayName}
              placeholder="เช่น ภูริช ใจดี"
            />
          )}
          <Field
            label="อีเมล"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={onGoogle}
          disabled={busy}
          className="w-full h-12 rounded-xl bg-surface border border-border flex items-center justify-center gap-3 font-medium disabled:opacity-60"
        >
          <GoogleMark />
          ดำเนินการต่อด้วย Google
        </button>

        <ul className="mt-8 space-y-3">
          <Feature
            icon={<Search className="size-5" />}
            title="ค้นหารอบตัวคุณ"
            desc="ดูประกาศใกล้คุณ ใช้ตัวกรองหมวดหมู่และคำค้น"
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title="ยืนยันก่อนติดต่อ"
            desc="ข้อมูลติดต่อส่วนตัวถูกปกปิดจนกว่าจะตกลงนัดรับ"
          />
          <Feature
            icon={<Handshake className="size-5" />}
            title="ปิดเคสร่วมกัน"
            desc="ทุกการเปลี่ยนสถานะถูกบันทึกไว้ตรวจสอบได้"
          />
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary"
      />
    </label>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3 items-start rounded-2xl bg-surface border border-border p-3.5">
      <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-[14.5px]">{title}</p>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41.4 35.5 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Search, Handshake } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — Reunite" },
      {
        name: "description",
        content: "เข้าสู่ระบบ Reunite ด้วยบัญชี Google เพื่อเริ่มประกาศแจ้งของหายและพบของ",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft via-background to-background flex flex-col items-center justify-between px-6 py-10">
      <div className="w-full max-w-[420px] flex-1 flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-flex size-16 rounded-3xl bg-primary text-primary-foreground items-center justify-center shadow-[var(--shadow-pop)] mb-5 text-3xl">
            🤝
          </div>
          <h1 className="text-[28px] font-bold leading-tight">
            ตามหาของที่หาย<br />
            <span className="text-primary">ส่งคืนของที่พบ</span>
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
            Reunite เป็นพื้นที่ปลอดภัยที่ให้คุณประสานงานกับเจ้าของและผู้พบของ
            พร้อมการยืนยันตัวตนและสถานะเคสที่โปร่งใส
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          <Feature
            icon={<Search className="size-5" />}
            title="ค้นหารอบตัวคุณ"
            desc="ดูประกาศใกล้คุณ ใช้ตัวกรองหมวดหมู่และระยะทาง"
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title="ยืนยันก่อนติดต่อ"
            desc="ระบบปกปิดข้อมูลส่วนตัวจนกว่าจะตกลงนัดรับ"
          />
          <Feature
            icon={<Handshake className="size-5" />}
            title="ปิดเคสร่วมกัน"
            desc="ทั้งสองฝ่ายและแอดมินยืนยันการรับของคืน"
          />
        </ul>
      </div>

      <div className="w-full max-w-[420px] space-y-3">
        <Link
          to="/"
          className="w-full h-12 rounded-xl bg-foreground text-background flex items-center justify-center gap-3 font-medium shadow-[var(--shadow-card)]"
        >
          <GoogleMark />
          เข้าสู่ระบบด้วย Google
        </Link>
        <p className="text-[11.5px] text-center text-muted-foreground px-4">
          เมื่อดำเนินการต่อ คุณยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ Reunite
        </p>
      </div>
    </div>
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

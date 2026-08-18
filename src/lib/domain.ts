// Shared domain labels + row types for Reunite (backed by Lovable Cloud).
import type { Database } from "@/integrations/supabase/types";

export type PostRow = Database["public"]["Tables"]["posts"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export type PostType = Database["public"]["Enums"]["post_type"];
export type PostStatus = Database["public"]["Enums"]["post_status"];
export type Category = Database["public"]["Enums"]["item_category"];

export type PostWithProfile = PostRow & { profiles: ProfileRow | null };

export const CATEGORY_LABEL: Record<Category, string> = {
  electronics: "อุปกรณ์อิเล็กทรอนิกส์",
  wallet: "กระเป๋าสตางค์",
  keys: "กุญแจ",
  documents: "เอกสาร / บัตร",
  bag: "กระเป๋า",
  jewelry: "เครื่องประดับ",
  pet: "สัตว์เลี้ยง",
  clothing: "เสื้อผ้า",
  other: "อื่น ๆ",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  electronics: "📱",
  wallet: "👛",
  keys: "🔑",
  documents: "🪪",
  bag: "🎒",
  jewelry: "💍",
  pet: "🐾",
  clothing: "🧥",
  other: "📦",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  searching: "กำลังตามหา",
  arranging: "อยู่ระหว่างนัดรับ",
  closed: "ปิดเคสแล้ว",
};

export const CATEGORIES: Category[] = [
  "electronics",
  "wallet",
  "keys",
  "documents",
  "bag",
  "jewelry",
  "pet",
  "clothing",
  "other",
];

export function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function initialsOf(name: string): string {
  const t = name.trim();
  if (!t) return "??";
  return t.slice(0, 2);
}

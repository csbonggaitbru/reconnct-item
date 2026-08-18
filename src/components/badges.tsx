import { STATUS_LABEL, type PostStatus, type PostType } from "@/lib/domain";

export function TypeBadge({ type }: { type: PostType }) {
  return (
    <span
      className={`chip ${
        type === "lost"
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-primary-soft text-primary border border-primary/20"
      }`}
    >
      {type === "lost" ? "🔎 ของหาย" : "🤝 พบของ"}
    </span>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  const tone =
    status === "closed"
      ? "bg-muted text-muted-foreground border border-border"
      : status === "arranging"
        ? "bg-accent/20 text-foreground border border-accent/40"
        : "bg-surface text-foreground border border-border";
  return <span className={`chip ${tone}`}>{STATUS_LABEL[status]}</span>;
}

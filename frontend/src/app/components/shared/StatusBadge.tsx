type Status = "new" | "in_progress" | "answered" | "published" | "closed" | "urgent";

const statusConfig: Record<Status, { label: string; className: string }> = {
  new: { label: "New", className: "bg-emerald-50 text-emerald-700" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700" },
  answered: { label: "Answered", className: "bg-blue-50 text-blue-700" },
  published: { label: "Published", className: "bg-green-50 text-green-700" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-500" },
  urgent: { label: "Urgent", className: "bg-red-50 text-red-600" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] ${config.className}`}>
      {config.label}
    </span>
  );
}
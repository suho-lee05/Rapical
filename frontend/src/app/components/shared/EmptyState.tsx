import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground/30" />
      </div>
      <p className="text-[15px] text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-[13px] text-muted-foreground/60 max-w-[260px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-[14px] hover:bg-green-700 active:scale-[0.98] transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

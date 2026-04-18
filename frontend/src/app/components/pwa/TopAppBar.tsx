import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router";

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
}

export function TopAppBar({ title, showBack, showSearch, onSearchClick }: TopAppBarProps) {
  const navigate = useNavigate();

  return (
    <header className="surface-header">
      <div className="app-screen flex items-center justify-between h-[52px]">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 text-foreground rounded-lg hover:bg-muted/70 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-[17px] tracking-tight">{title}</h1>
        </div>
        {showSearch && (
          <button
            onClick={onSearchClick}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/70 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
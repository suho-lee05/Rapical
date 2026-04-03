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
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-40 border-b border-border">
      <div className="flex items-center justify-between h-12 px-4 max-w-[500px] mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-[17px]">{title}</h1>
        </div>
        {showSearch && (
          <button onClick={onSearchClick} className="p-1.5 text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
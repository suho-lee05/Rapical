import { useState } from "react";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { api } from "../../lib/api";
import { setAdminSession } from "../../lib/admin-session";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const session = await api.loginAdmin(email, password);
      setAdminSession(session);
      toast.success(`${session.AdminName}님 환영합니다.`);
      navigate("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "로그인 실패";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[32px] tracking-tight text-primary">Rapicial</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Admin Console</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-6">
          <div className="space-y-4">
            <div>
              <label className="text-[12px] text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rapicial.com"
                className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-primary text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground/50 mt-4">Admin only</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-[12px] text-muted-foreground hover:text-foreground transition mx-auto block"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
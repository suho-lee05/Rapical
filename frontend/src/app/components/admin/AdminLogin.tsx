import { useState } from "react";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { api } from "../../lib/api";
import { setAdminSession } from "../../lib/admin-session";

export function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    if (mode === "register" && !adminName.trim()) {
      toast.error("관리자 이름을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "register") {
        await api.registerAdmin({
          email,
          password,
          adminName: adminName.trim(),
          role: "admin",
        });
        toast.success("관리자 계정이 생성되었습니다. 로그인해 주세요.");
        setMode("login");
        setPassword("");
        return;
      }

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
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-primary text-[11px] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Admin Console
          </div>
          <h1 className="text-[34px] tracking-tight text-primary">Rapicial</h1>
          <p className="text-[13px] text-muted-foreground mt-1">운영 대시보드 로그인</p>
        </div>

        <div className="surface-card p-6">
          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-[12px] text-muted-foreground mb-1.5 block">Admin name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full h-11 px-3.5 rounded-xl bg-input-background border border-border text-[14px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            )}
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
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-11 bg-primary text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition mt-2 shadow-[0_8px_18px_rgba(22,163,74,0.28)]"
            >
              {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create admin"}
            </button>
          </div>
          <button
            onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
            className="mt-3 text-[12px] text-primary hover:text-green-700 transition block mx-auto"
          >
            {mode === "login" ? "관리자 계정 만들기" : "이미 계정이 있어요"}
          </button>
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
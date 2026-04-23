import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

function Field({ label, type = "text", value, onChange, placeholder, error }) {
  return (
    <div className="mb-[18px]">
      <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-[0.06em]">
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full py-[11px] px-[14px] rounded-xl border-[1.5px] bg-slate-100/70 text-[14px] text-slate-900 outline-none transition-colors duration-150 focus:border-blue-500 ${error ? 'border-red-500' : 'border-blue-600/15'}`}
      />
      {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
  );
}

export default function Login({ onAuth }) {
  const [lUser, setLUser] = useState("");
  const [lPass, setLPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setLoading(true);
    try {
      const data = await login({ username: lUser, password: lPass });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("displayName", data.displayName);
      localStorage.setItem("avatarColor", data.avatarColor);
      onAuth(data);
      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#f0f6ff] to-[#e8f0fe]">
      <div className="w-[420px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(37,99,235,0.12),0_4px_16px_rgba(0,0,0,0.05)] px-10 pt-10 pb-8 animate-fade-slide">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.35)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 tracking-[-0.03em]">PulseChat</span>
        </div>

        <div className="flex bg-blue-600/5 rounded-xl p-1 mb-7">
          <button className="flex-1 py-[9px] rounded-[10px] bg-white text-blue-700 font-bold text-[14px] shadow-[0_2px_8px_rgba(37,99,235,0.12)] transition-all duration-200">
            Sign In
          </button>
          <Link to="/signup" className="flex-1 py-[9px] rounded-[10px] bg-transparent text-slate-500 font-medium text-center text-[14px] transition-all duration-200">
            Create Account
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Username" value={lUser} onChange={(e) => setLUser(e.target.value)} placeholder="your_username" />
          <Field label="Password" type="password" value={lPass} onChange={(e) => setLPass(e.target.value)} placeholder="••••••••" />

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-[10px] py-2.5 px-3.5 mb-4 text-red-600 text-[13px]">
              {apiError}
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full py-[13px] rounded-xl text-white font-bold text-[15px] transition-all duration-200 ${loading ? 'bg-blue-600/50 cursor-wait' : 'bg-gradient-to-br from-blue-700 to-blue-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)]'}`}>
            {loading ? "Please wait…" : "Sign In →"}
          </button>
        </form>

        <p className="text-center mt-5 text-[12px] text-slate-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@smartchip.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nuk u lidh me serverin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-center p-12 lg:flex">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-400">Apartment access</p>
        <h1 className="mt-3 max-w-md text-4xl font-extrabold leading-tight">
          SmartChip
          <span className="mt-2 block text-lg font-medium text-slate-400">
            Çipi hap çdo kat — pagesa e mban gjallë. EchoFloor njofton ndërtesën kur dikush ngec.
          </span>
        </h1>
      </section>
      <section className="flex items-center justify-center p-6">
        <form className="card w-full max-w-md space-y-4" onSubmit={onSubmit}>
          <div>
            <h2 className="text-2xl font-bold">Hyr</h2>
            <p className="text-sm text-slate-400">Admin ose banor — i njëjti hyrje, dy panele.</p>
          </div>
          <label className="block text-sm text-slate-400">
            Email
            <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm text-slate-400">
            Fjalëkalimi
            <input
              className="input mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Duke hyrë…" : "Hyr në SmartChip"}
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setEmail("arben@smartchip.local");
                setPassword("banor123");
              }}
            >
              Hyr si banor
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setEmail("elira@smartchip.local");
                setPassword("banor123");
              }}
            >
              Banor me pagesë vonuar
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={() => {
                setEmail("admin@smartchip.local");
                setPassword("admin123");
              }}
            >
              Admin
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChipHelix from "../components/ChipHelix";
import { chipGenesisName, chipHelixSeed, chipHue } from "../lib/chipDna";
import { api, Chip, getRole } from "../api/client";

export default function ChipsPage() {
  const admin = getRole() === "admin";
  const [chips, setChips] = useState<Chip[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ uid: "", label: "", monthly_fee: "8" });

  function load() {
    api<Chip[]>("/api/chips")
      .then(setChips)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/chips", {
        method: "POST",
        body: JSON.stringify({
          uid: form.uid.trim().toUpperCase(),
          label: form.label,
          monthly_fee: Number(form.monthly_fee),
        }),
      });
      setForm({ uid: "", label: "", monthly_fee: "8" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    }
  }

  async function setStatus(id: number, status: string) {
    setError("");
    try {
      await api(`/api/chips/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
    }
  }

  async function lost(id: number) {
    setError("");
    try {
      await api(`/api/chips/${id}/lost`, { method: "POST" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{admin ? "Menaxhimi i çipave" : "Çipat e mi"}</h1>
      {error && <p className="text-red-400">{error}</p>}
      {admin && (
        <form className="card grid gap-3 md:grid-cols-4" onSubmit={create}>
          <input className="input font-mono" placeholder="UID" value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} required />
          <input className="input" placeholder="Emërtim" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="input" type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
          <button type="submit" className="btn btn-primary">Regjistro çip</button>
        </form>
      )}
      <div className="space-y-2">
        {chips.map((c) => (
          <div key={c.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ChipHelix seed={chipHelixSeed(c.uid)} hue={chipHue(c.uid)} size={56} />
              <div>
              <p className="font-mono">{c.uid}</p>
              <p className="font-mono text-[10px] tracking-wider text-orange-300/80">{chipGenesisName(c.uid)}</p>
              <p className="text-sm text-slate-400">
                {c.label} · {c.owner_name || "pa banor"} · banesa {c.apartment_number || "—"} · {c.monthly_fee}€/muaj
              </p>
              {c.paid_until && c.status === "active" && (
                <p className="text-xs text-emerald-300">
                  Paguar deri më {new Date(c.paid_until).toLocaleDateString("sq-AL")}
                </p>
              )}
              {c.due_amount != null && (
                <p className="text-xs text-amber-300">
                  Për aktivizim: {c.due_amount}€ deri {c.due_date ? new Date(c.due_date).toLocaleDateString("sq-AL") : ""}
                </p>
              )}
            </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-white/10">{c.status}</span>
              {admin && (
                <>
                  <button type="button" className="btn btn-primary text-xs" onClick={() => setStatus(c.id, "active")}>
                    Aktivizo
                  </button>
                  <button type="button" className="btn btn-ghost text-xs" onClick={() => setStatus(c.id, "inactive")}>
                    Çaktivizo
                  </button>
                </>
              )}
              {!admin && c.status !== "active" && c.status !== "lost" && (
                <Link to="/payments" className="btn btn-primary text-xs">
                  Paguaj online
                </Link>
              )}
              {c.status !== "lost" && (
                <button type="button" className="btn btn-danger text-xs" onClick={() => lost(c.id)}>
                  Raporto të humbur
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

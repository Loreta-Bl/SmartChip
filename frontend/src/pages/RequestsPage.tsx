import { FormEvent, useEffect, useState } from "react";
import { api, ChipRequest, getRole } from "../api/client";

const kinds: Record<string, string> = {
  extra: "Çip shtesë",
  lost: "Zëvendësim (i humbur)",
  new: "Çip i ri",
  complaint: "Ankesë",
};

export default function RequestsPage() {
  const admin = getRole() === "admin";
  const [rows, setRows] = useState<ChipRequest[]>([]);
  const [kind, setKind] = useState("new");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    api<ChipRequest[]>("/api/requests")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await api("/api/requests", { method: "POST", body: JSON.stringify({ kind, note }) });
      setNote("");
      setMsg("Kërkesa u dërgua te administratori. Të vjen njoftim kur aprovohet.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    }
  }

  async function resolve(id: number, approve: boolean) {
    setError("");
    try {
      await api(`/api/requests/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ approve, admin_note: approve ? "Aprovuar" : "Refuzuar" }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{admin ? "Kërkesat e banorëve" : "Kërkesë / ankesë"}</h1>
      <p className="text-slate-400">
        Çip i ri, i humbur, ose ankesë — pa shkuar në zyre. Pas aprovimit paguan online dhe çipi ndizet.
      </p>
      {error && <p className="text-red-400">{error}</p>}
      {msg && <p className="text-emerald-300">{msg}</p>}
      {!admin && (
        <form className="card space-y-3" onSubmit={send}>
          <label className="text-sm text-slate-400">
            Lloji
            <select className="input mt-1" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="new">Çip i ri</option>
              <option value="extra">Çip shtesë</option>
              <option value="lost">Zëvendësim (i humbur)</option>
              <option value="complaint">Ankesë (lift, hyrje, tjetër)</option>
            </select>
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="P.sh. më duhet çip i dytë për familjen, ose lifti bën zhurmë…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Dërgo te administratori
          </button>
        </form>
      )}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {r.user_name} · {kinds[r.kind] || r.kind}
              </p>
              <p className="text-sm text-slate-400">{r.note || "—"}</p>
              <p className="text-xs text-slate-500">
                {r.status === "pending" ? "Në pritje" : r.status === "approved" ? "Aprovuar" : "Refuzuar"}
                {r.admin_note ? ` · ${r.admin_note}` : ""}
              </p>
            </div>
            {admin && r.status === "pending" && (
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary text-xs" onClick={() => resolve(r.id, true)}>
                  Aprovo
                </button>
                <button type="button" className="btn btn-ghost text-xs" onClick={() => resolve(r.id, false)}>
                  Refuzo
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

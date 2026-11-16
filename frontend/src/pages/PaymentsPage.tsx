import { FormEvent, useEffect, useState } from "react";
import { api, getRole, Payment } from "../api/client";

export default function PaymentsPage() {
  const admin = getRole() === "admin";
  const [rows, setRows] = useState<Payment[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [checkout, setCheckout] = useState<Payment | null>(null);
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", name: "", exp: "12/28", cvc: "123" });
  const [paying, setPaying] = useState(false);

  function load() {
    api<Payment[]>("/api/payments")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmPay(e: FormEvent) {
    e.preventDefault();
    if (!checkout) return;
    setPaying(true);
    setError("");
    try {
      await api(`/api/payments/${checkout.id}/pay`, { method: "POST" });
      setMsg(`Pagesa ${checkout.amount}€ u pranua. Çipi ${checkout.chip_uid} u aktivizua online.`);
      setCheckout(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    } finally {
      setPaying(false);
    }
  }

  async function remind() {
    setError("");
    try {
      const r = await api<{ sent: number }>("/api/payments/remind-overdue", { method: "POST" });
      setMsg(`U dërguan ${r.sent} njoftime (app + email).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
    }
  }

  const labels: Record<string, string> = {
    paid: "E paguar",
    due: "Për t’u paguar",
    overdue: "E vonuar",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Pagesat e çipit</h1>
          <p className="text-slate-400">
            Paguaj online me kartë — çipi aktivizohet menjëherë, pa shkuar në zyre.
          </p>
        </div>
        {admin && (
          <button type="button" className="btn btn-primary" onClick={remind}>
            Njofto banorët për afatin
          </button>
        )}
      </div>
      {error && <p className="text-red-400">{error}</p>}
      {msg && <p className="text-emerald-300">{msg}</p>}

      {checkout && (
        <form className="card space-y-3 border-orange-400/30" onSubmit={confirmPay}>
          <p className="font-semibold">Pagesë online · {checkout.amount}€ · {checkout.chip_uid}</p>
          <p className="text-xs text-slate-500">Demo: çdo kartë pranohet. Në prodhim këtu lidhet Stripe/PayPal.</p>
          <label className="text-sm text-slate-400">
            Emri në kartë
            <input className="input mt-1" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
          </label>
          <label className="text-sm text-slate-400">
            Numri i kartës
            <input className="input mt-1 font-mono" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-slate-400">
              Skadimi
              <input className="input mt-1" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} required />
            </label>
            <label className="text-sm text-slate-400">
              CVC
              <input className="input mt-1" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} required />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={paying}>
              {paying ? "Duke procesuar…" : `Paguaj ${checkout.amount}€ dhe aktivizo`}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCheckout(null)}>
              Anulo
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto card p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Banori</th>
              <th className="px-4 py-3">Çipi</th>
              <th className="px-4 py-3">Shuma</th>
              <th className="px-4 py-3">Afati / paguar deri</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-4 py-3">{p.user_name}</td>
                <td className="px-4 py-3 font-mono">{p.chip_uid}</td>
                <td className="px-4 py-3">{p.amount}€</td>
                <td className="px-4 py-3">{new Date(p.due_date).toLocaleDateString("sq-AL")}</td>
                <td className="px-4 py-3">{labels[p.status] || p.status}</td>
                <td className="px-4 py-3">
                  {p.status !== "paid" && (
                    <button type="button" className="btn btn-primary text-xs" onClick={() => setCheckout(p)}>
                      Paguaj online
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

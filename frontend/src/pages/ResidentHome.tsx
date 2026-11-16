import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Chip, Me, Notification, Payment } from "../api/client";

export default function ResidentHome() {
  const [me, setMe] = useState<Me | null>(null);
  const [chips, setChips] = useState<Chip[]>([]);
  const [pays, setPays] = useState<Payment[]>([]);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Me>("/api/auth/me"),
      api<Chip[]>("/api/chips"),
      api<Payment[]>("/api/payments"),
      api<Notification[]>("/api/notifications"),
    ])
      .then(([m, c, p, n]) => {
        setMe(m);
        setChips(c);
        setPays(p);
        setNotes(n.filter((x) => x.channel === "in_app"));
      })
      .catch((e) => setError(e.message));
  }, []);

  const openPays = pays.filter((x) => x.status !== "paid");
  const outages = notes.filter((n) => (n.kind === "outage" || n.kind === "sos") && !n.is_read);
  const active = chips.filter((c) => c.status === "active");
  const inactive = chips.filter((c) => c.status !== "active");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">Mirë se erdhe{me ? `, ${me.full_name.split(" ")[0]}` : ""}</h1>
        <p className="text-slate-400">
          {me?.building_name} · Hyrja {me?.entrance} · Banesa {me?.apartment_number} · Kati {me?.floor}
        </p>
      </header>
      {error && <p className="text-red-400">{error}</p>}

      {outages.map((n) => (
        <Link
          key={n.id}
          to="/inbox"
          className="block rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 hover:bg-amber-500/15"
        >
          <p className="text-xs uppercase tracking-widest text-amber-200">Mesazh nga ndërtesa</p>
          <p className="text-lg font-bold text-amber-100">{n.title}</p>
          <p className="text-sm text-slate-300">{n.body}</p>
        </Link>
      ))}

      <div className="grid gap-3 sm:grid-cols-2">
        {active.map((c) => (
          <div key={c.id} className="card border-emerald-500/20">
            <p className="text-xs uppercase tracking-wider text-slate-500">Paguar deri më</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-300">
              {c.paid_until ? new Date(c.paid_until).toLocaleDateString("sq-AL") : "—"}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              {c.uid} · aktiv · të gjitha katet
            </p>
          </div>
        ))}
        {inactive.map((c) => (
          <div key={c.id} className="card border-orange-500/20">
            <p className="text-xs uppercase tracking-wider text-slate-500">Çip i fikur</p>
            <p className="mt-1 text-lg font-bold">{c.uid}</p>
            <p className="text-sm text-orange-300">
              {c.due_amount != null
                ? `Paguaj ${c.due_amount}€ online — aktivizohet menjëherë, pa zyrë.`
                : "Dërgo kërkesë për çip ose paguaj tarifën."}
            </p>
            <Link to="/payments" className="mt-3 inline-flex btn btn-primary text-xs">
              Paguaj online
            </Link>
          </div>
        ))}
        {!chips.length && (
          <div className="card sm:col-span-2">
            <p className="font-semibold">Nuk ke ende çip</p>
            <p className="text-sm text-slate-400">Kërko çip të ri nga aplikacioni — administratori e aprovon, pastaj paguan online.</p>
            <Link to="/requests" className="mt-3 inline-flex btn btn-primary text-xs">
              Kërko çip të ri
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link to="/payments" className="card hover:bg-white/[0.06]">
          <p className="font-semibold">Pagesë online</p>
          <p className="text-sm text-slate-400">
            {openPays.length
              ? `${openPays.length} faturë e hapur — paguaj dhe çipi ndizet pa shkuar në zyre.`
              : "Nuk ke faturë të hapur."}
          </p>
        </Link>
        <Link to="/requests" className="card hover:bg-white/[0.06]">
          <p className="font-semibold">Kërkesë / ankesë</p>
          <p className="text-sm text-slate-400">Çip i ri, i humbur, ose çip shtesë — mesazh te administratori.</p>
        </Link>
        <Link to="/inbox" className="card hover:bg-white/[0.06]">
          <p className="font-semibold">Njoftime</p>
          <p className="text-sm text-slate-400">Kur prishet lifti, SOS, ose skadon pagesa — të vjen këtu.</p>
        </Link>
      </div>

      <Link
        to="/elevators"
        className="block rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-center hover:bg-red-500/15"
      >
        <p className="text-xs uppercase tracking-widest text-red-300">EchoFloor</p>
        <p className="text-2xl font-extrabold">Ngeca në lift — SOS</p>
      </Link>
    </div>
  );
}

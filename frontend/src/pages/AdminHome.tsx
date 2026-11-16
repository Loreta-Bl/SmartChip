import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, DashboardStats } from "../api/client";

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardStats>("/api/dashboard/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const cards = stats
    ? [
        ["Banesa", stats.total_apartments],
        ["Banorë", stats.total_residents],
        ["Çipa aktivë", stats.chips_active],
        ["Të çaktivizuar", stats.chips_inactive],
        ["Të humbur", stats.chips_lost],
        ["Kërkesa të reja", stats.pending_requests],
        ["Pagesa të hapura", stats.overdue_payments],
        ["SOS hapur", stats.open_sos],
        ["Lifta jashtë pune", stats.elevators_down],
      ]
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Paneli i administratorit</h1>
        <p className="text-slate-400">Banesat, çipat, pagesat dhe EchoFloor në një vend.</p>
      </header>
      {error && <p className="text-red-400">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="card">
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/echo" className="btn btn-primary">
          Hap EchoFloor
        </Link>
        <Link to="/elevators" className="btn btn-ghost">
          Lifti nuk punon
        </Link>
        <Link to="/payments" className="btn btn-ghost">
          Dërgo afatet e pagesës
        </Link>
      </div>
    </div>
  );
}

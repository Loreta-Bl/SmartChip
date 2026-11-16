import { FormEvent, useEffect, useState } from "react";
import { api, Apartment } from "../api/client";

export default function ApartmentsPage() {
  const [rows, setRows] = useState<Apartment[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ number: "", entrance: "A", floor: "1" });

  function load() {
    api<Apartment[]>("/api/apartments")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const buildings = await api<{ id: number }[]>("/api/buildings");
      if (!buildings[0]) {
        setError("Nuk ka ndërtesë");
        return;
      }
      await api("/api/apartments", {
        method: "POST",
        body: JSON.stringify({
          building_id: buildings[0].id,
          number: form.number,
          entrance: form.entrance,
          floor: Number(form.floor),
        }),
      });
      setForm({ number: "", entrance: "A", floor: "1" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Banesat</h1>
      {error && <p className="text-red-400">{error}</p>}
      <form className="card grid gap-3 md:grid-cols-4" onSubmit={create}>
        <input className="input" placeholder="Nr. banesës" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
        <input className="input" placeholder="Hyrja" value={form.entrance} onChange={(e) => setForm({ ...form, entrance: e.target.value })} />
        <input className="input" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
        <button type="submit" className="btn btn-primary">Shto banesë</button>
      </form>
      <div className="overflow-x-auto card p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ndërtesa</th>
              <th className="px-4 py-3">Hyrja</th>
              <th className="px-4 py-3">Banesa</th>
              <th className="px-4 py-3">Kati</th>
              <th className="px-4 py-3">Banorë</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-white/5">
                <td className="px-4 py-3">{a.building_name}</td>
                <td className="px-4 py-3">{a.entrance}</td>
                <td className="px-4 py-3">{a.number}</td>
                <td className="px-4 py-3">{a.floor}</td>
                <td className="px-4 py-3">{a.resident_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

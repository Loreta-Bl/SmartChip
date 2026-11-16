import { useEffect, useState } from "react";
import { api, Elevator, getRole } from "../api/client";

export default function ElevatorsPage() {
  const admin = getRole() === "admin";
  const [rows, setRows] = useState<Elevator[]>([]);
  const [floor, setFloor] = useState("4");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    return api<Elevator[]>("/api/elevators")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function act(key: string, path: string, body?: object) {
    setBusy(key);
    setError("");
    try {
      await api(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">{admin ? "Liftat" : "SOS në lift"}</h1>
      <p className="text-slate-400">
        Ngecje: SOS te të gjithë banorët. Lifti nuk punon: njoftim + email. Fqinjët mund të thonë «Po vij».
      </p>
      {error && <p className="text-red-400">{error}</p>}
      {rows.map((e) => (
        <div key={e.id} className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-lg font-bold">{e.name}</p>
              <p className="text-sm capitalize text-slate-400">{e.status}</p>
              {e.status === "sos" && (
                <p className="text-red-300">
                  {e.sos_user_name} ngeci në katin {e.sos_floor}. Po vijnë: {e.coming_names.join(", ") || "—"}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {admin && e.status !== "down" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy !== null}
                  onClick={() => act(`outage-${e.id}`, `/api/elevators/${e.id}/outage`, { note: "Lifti nuk punon" })}
                >
                  Shëno jashtë pune
                </button>
              )}
              {admin && e.status === "down" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy !== null}
                  onClick={() => act(`restore-${e.id}`, `/api/elevators/${e.id}/restore`)}
                >
                  Kthe në punë
                </button>
              )}
              {e.status === "sos" && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy !== null}
                    onClick={() => act(`coming-${e.id}`, `/api/elevators/${e.id}/coming`)}
                  >
                    Po vij
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy !== null}
                    onClick={() => act(`resolve-${e.id}`, `/api/elevators/${e.id}/resolve`)}
                  >
                    SOS u mbyll
                  </button>
                </>
              )}
            </div>
          </div>
          {e.status !== "sos" && e.status !== "down" && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-slate-400">
                Kati ku je ngecur
                <input className="input mt-1 w-28" type="number" value={floor} onChange={(ev) => setFloor(ev.target.value)} />
              </label>
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy !== null}
                onClick={() =>
                  act(`sos-${e.id}`, `/api/elevators/${e.id}/sos`, {
                    floor: Number(floor),
                    note: "Ngecja në kabinë",
                  })
                }
              >
                Dërgo SOS
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

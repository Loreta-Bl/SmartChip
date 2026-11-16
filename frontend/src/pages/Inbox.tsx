import { useEffect, useState } from "react";
import { api, Notification } from "../api/client";

export default function Inbox() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  function load() {
    api<Notification[]>("/api/notifications")
      .then(setItems)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Njoftime</h1>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            api("/api/notifications/read-all", { method: "POST" })
              .then(load)
              .catch((e) => setError(e.message))
          }
        >
          Shëno të lexuara
        </button>
      </div>
      <p className="text-slate-400">SOS, lift jashtë pune, afate pagese — në app dhe si email i simuluar.</p>
      {error && <p className="text-red-400">{error}</p>}
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`card ${n.is_read ? "opacity-60" : "border-orange-400/20"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-slate-400">{n.body}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {n.channel} · {n.kind} · {new Date(n.created_at).toLocaleString("sq-AL")}
                </p>
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  className="btn btn-ghost text-xs"
                  onClick={() =>
                    api(`/api/notifications/${n.id}/read`, { method: "POST" })
                      .then(load)
                      .catch((e) => setError(e.message))
                  }
                >
                  Lexuar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

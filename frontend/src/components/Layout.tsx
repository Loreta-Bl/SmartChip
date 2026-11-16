import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, getRole, setSession } from "../api/client";

const adminNav = [
  { to: "/", label: "Paneli", end: true },
  { to: "/echo", label: "EchoFloor" },
  { to: "/apartments", label: "Banesat" },
  { to: "/chips", label: "Çipat" },
  { to: "/requests", label: "Kërkesat" },
  { to: "/payments", label: "Pagesat" },
  { to: "/elevators", label: "Liftat" },
  { to: "/inbox", label: "Njoftime" },
];

const residentNav = [
  { to: "/", label: "Shtëpia ime", end: true },
  { to: "/echo", label: "EchoFloor" },
  { to: "/chips", label: "Çipat e mi" },
  { to: "/payments", label: "Pagesat" },
  { to: "/requests", label: "Kërkesat" },
  { to: "/elevators", label: "SOS / Lift" },
  { to: "/inbox", label: "Njoftime" },
];

export default function Layout() {
  const navigate = useNavigate();
  const role = getRole();
  const nav = role === "admin" ? adminNav : residentNav;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ count: number }>("/api/notifications/unread-count")
      .then((r) => setUnread(r.count))
      .catch(() => setUnread(0));
    const id = setInterval(() => {
      api<{ count: number }>("/api/notifications/unread-count")
        .then((r) => setUnread(r.count))
        .catch(() => undefined);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-4 border-b border-white/10 bg-black/30 p-4 lg:border-b-0 lg:border-r">
        <div>
          <p className="text-lg font-bold tracking-tight">
            Smart<span className="text-orange-400">Chip</span>
          </p>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            {role === "admin" ? "Admin panel" : "Banor"}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative z-10 flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-orange-500/15 text-orange-200" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span>{item.label}</span>
              {item.to === "/inbox" && unread > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setSession(null);
            navigate("/login", { replace: true });
          }}
        >
          Dil
        </button>
      </aside>
      <main className="mx-auto w-full max-w-6xl p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

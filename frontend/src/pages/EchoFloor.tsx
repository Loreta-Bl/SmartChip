import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import BuildingPulseCanvas from "../components/BuildingPulseCanvas";
import ChipHelix from "../components/ChipHelix";
import { playPulseTick } from "../lib/liftSound";
import {
  api,
  ChipAura,
  EchoSnapshot,
  PulseSnapshot,
  getRole,
} from "../api/client";

export default function EchoFloor() {
  const admin = getRole() === "admin";
  const [echo, setEcho] = useState<EchoSnapshot | null>(null);
  const [pulse, setPulse] = useState<PulseSnapshot | null>(null);
  const [error, setError] = useState("");
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<ChipAura | null>(null);
  const [scan, setScan] = useState({ uid: "A1B2C3D4", elevator_id: 1, floor: 4 });
  const lastCount = useRef(0);

  function load() {
    Promise.all([
      api<EchoSnapshot>("/api/elevators/echo"),
      api<PulseSnapshot>("/api/access/pulse"),
    ])
      .then(([e, p]) => {
        setEcho(e);
        if (p.events.length > lastCount.current && lastCount.current > 0) playPulseTick();
        lastCount.current = p.events.length;
        setPulse(p);
        if (p.elevator_ids[0] && scan.elevator_id === 1) {
          setScan((s) => ({ ...s, elevator_id: p.elevator_ids[0] }));
        }
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!playing || !pulse) return;
    const id = window.setInterval(() => {
      setReplayIndex((i) => {
        const next = (i ?? -1) + 1;
        if (next >= pulse.events.length) {
          setPlaying(false);
          return pulse.events.length - 1;
        }
        playPulseTick();
        return next;
      });
    }, 420);
    return () => clearInterval(id);
  }, [playing, pulse]);

  const heat = useMemo(() => {
    const m = new Map<number, number>();
    pulse?.floor_heat.forEach((h) => m.set(h.floor, h.count));
    return m;
  }, [pulse]);

  const sosFloors = (echo?.elevators || [])
    .filter((e) => e.status === "sos" && e.sos_floor != null)
    .map((e) => e.sos_floor as number);
  const down = (echo?.elevators || []).some((e) => e.status === "down");

  async function firePulse(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/access/check", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          chip_uid: scan.uid,
          elevator_id: scan.elevator_id,
          requested_floor: scan.floor,
        }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim");
    }
  }

  const events = pulse?.events ?? [];
  const visibleEvents = replayIndex === null ? events : events.slice(0, replayIndex + 1);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Veçori unike</p>
          <h1 className="text-3xl font-extrabold">EchoFloor · Ritmi i qarkut</h1>
          <p className="max-w-xl text-slate-400">
            Ndërtesa ka zemër: çdo skanim RFID ngjitet si valë ngjyrë-ADN. SOS e ndez katin e kuq. Askush tjetër
            nuk e sheh ndërtesën kështu.
          </p>
        </div>
        {pulse && (
          <div className="card py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">Rrahje / orë</p>
            <p className="text-3xl font-extrabold text-orange-300">{pulse.heart_rate_per_hour}</p>
          </div>
        )}
      </header>

      {error && <p className="text-red-400">{error}</p>}
      {down && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
          Të paktën një lift është jashtë pune — njoftimi u dërgua te banorët.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_320px]">
        <div className="card overflow-hidden p-3">
          <BuildingPulseCanvas
            floorCount={pulse?.floor_count ?? echo?.floor_count ?? 12}
            elevatorIds={pulse?.elevator_ids?.length ? pulse.elevator_ids : [1, 2]}
            floorHeat={heat}
            events={visibleEvents}
            replayIndex={replayIndex}
            selectedUid={selected?.uid ?? null}
            selectedFloors={selected?.home_floor != null ? [selected.home_floor] : null}
            sosFloors={sosFloors}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 px-2 pb-1">
            <button
              type="button"
              className="btn btn-primary text-xs"
              onClick={(ev) => {
                ev.preventDefault();
                setReplayIndex(0);
                setPlaying(true);
              }}
            >
              Replay i ditës
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={(ev) => {
                ev.preventDefault();
                setPlaying(false);
                setReplayIndex(null);
              }}
            >
              Live
            </button>
            {replayIndex !== null && pulse && (
              <input
                type="range"
                className="flex-1 accent-orange-400"
                min={0}
                max={Math.max(events.length - 1, 0)}
                value={replayIndex}
                onChange={(ev) => {
                  setPlaying(false);
                  setReplayIndex(Number(ev.target.value));
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          {(pulse?.anomalies || []).map((a) => (
            <div
              key={a.code + a.detail}
              className={`rounded-xl border px-4 py-3 text-sm ${
                a.severity === "high"
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              <p className="font-semibold">{a.title}</p>
              <p className="text-xs opacity-80">{a.detail}</p>
            </div>
          ))}
          {(echo?.elevators || []).map((e) => (
            <div key={e.id} className="card text-sm">
              <p className="font-semibold">{e.name}</p>
              <p className="capitalize text-slate-400">{e.status}</p>
              {e.status === "sos" && (
                <p className="mt-2 text-red-300">
                  {e.sos_user_name} · kati {e.sos_floor} · po vijnë: {e.coming_names.join(", ") || "ende askush"}
                </p>
              )}
            </div>
          ))}
          {admin && (
            <form className="card space-y-2" onSubmit={firePulse}>
              <p className="text-xs uppercase tracking-wider text-slate-500">Dërgo pulsin (test RFID)</p>
              <input
                className="input font-mono"
                value={scan.uid}
                onChange={(e) => setScan({ ...scan, uid: e.target.value })}
              />
              <input
                className="input"
                type="number"
                value={scan.floor}
                onChange={(e) => setScan({ ...scan, floor: Number(e.target.value) })}
              />
              <button type="submit" className="btn btn-primary w-full">
                Skano çipin
              </button>
            </form>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">ADN e çipave</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(pulse?.chip_auras || []).map((a) => (
            <button
              type="button"
              key={a.uid}
              onClick={() => setSelected(a)}
              className={`card flex items-center gap-3 text-left transition ${
                selected?.uid === a.uid ? "ring-1 ring-orange-400/60" : ""
              }`}
            >
              <ChipHelix seed={a.helix_seed} hue={a.hue} />
              <div className="min-w-0">
                <p className="font-mono text-xs text-orange-200">{a.genesis}</p>
                <p className="truncate text-sm">{a.owner_name || a.label || a.uid}</p>
                <p className="text-xs text-slate-500">
                  trust {a.trust_score}% · {a.pulses_today} rrahje
                  {a.home_floor != null ? ` · kati ${a.home_floor}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

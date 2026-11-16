import { useEffect, useRef } from "react";
import { chipHue } from "../lib/chipDna";
import type { PulseEvent } from "../api/client";

type PulseWave = {
  id: number;
  floor: number;
  shaft: number;
  hue: number;
  granted: boolean;
  t: number;
};

type Props = {
  floorCount: number;
  elevatorIds: number[];
  floorHeat: Map<number, number>;
  events: PulseEvent[];
  replayIndex: number | null;
  selectedUid: string | null;
  selectedFloors: number[] | null;
  sosFloors: number[];
};

export default function BuildingPulseCanvas({
  floorCount,
  elevatorIds,
  floorHeat,
  events,
  replayIndex,
  selectedUid,
  selectedFloors,
  sosFloors,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<PulseWave[]>([]);
  const lastEventIdRef = useRef(0);
  const heatRef = useRef(floorHeat);
  const sosRef = useRef(sosFloors);
  const animRef = useRef(0);

  heatRef.current = floorHeat;
  sosRef.current = sosFloors;

  useEffect(() => {
    if (replayIndex === null) {
      for (const ev of events) {
        if (ev.id <= lastEventIdRef.current) continue;
        lastEventIdRef.current = ev.id;
        const shaft = elevatorIds.indexOf(ev.elevator_id);
        wavesRef.current.push({
          id: ev.id,
          floor: ev.requested_floor,
          shaft: shaft >= 0 ? shaft : 0,
          hue: chipHue(ev.chip_uid),
          granted: ev.granted,
          t: 0,
        });
      }
      return;
    }
    wavesRef.current = [];
    const last = events[replayIndex];
    if (last) {
      const shaft = elevatorIds.indexOf(last.elevator_id);
      wavesRef.current.push({
        id: last.id,
        floor: last.requested_floor,
        shaft: shaft >= 0 ? shaft : 0,
        hue: chipHue(last.chip_uid),
        granted: last.granted,
        t: 0.2,
      });
    }
  }, [events, elevatorIds, replayIndex]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const g = canvasEl.getContext("2d");
    if (!g) return;
    const canvas = canvasEl;
    const ctx = g;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const pad = 28;
      const shaftCount = Math.max(elevatorIds.length, 1);
      const buildingW = w - pad * 2;
      const buildingH = h - pad * 2 - 28;
      const shaftGap = buildingW / (shaftCount + 1);
      const floorH = buildingH / (floorCount + 1);

      ctx.fillStyle = "rgba(8, 12, 22, 0.92)";
      ctx.strokeStyle = "rgba(249, 115, 22, 0.28)";
      ctx.lineWidth = 2;
      roundRect(ctx, pad, pad, buildingW, buildingH, 14);
      ctx.fill();
      ctx.stroke();

      for (let f = 0; f <= floorCount; f++) {
        const y = pad + buildingH - f * floorH;
        const heat = heatRef.current.get(f) ?? 0;
        const glow = Math.min(heat / 8, 1);
        if (glow > 0) {
          ctx.fillStyle = `rgba(249, 115, 22, ${0.04 + glow * 0.14})`;
          ctx.fillRect(pad + 4, y - floorH + 2, buildingW - 8, floorH - 2);
        }
        if (sosRef.current.includes(f)) {
          const pulse = 0.18 + Math.sin(now / 280) * 0.1;
          ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
          ctx.fillRect(pad + 4, y - floorH + 2, buildingW - 8, floorH - 2);
        }
        if (selectedFloors?.includes(f)) {
          ctx.fillStyle = `hsla(${chipHue(selectedUid ?? "")}, 70%, 55%, 0.16)`;
          ctx.fillRect(pad + 4, y - floorH + 2, buildingW - 8, floorH - 2);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(pad + buildingW, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(148,163,184,0.55)";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(String(f), pad - 18, y - floorH / 2 + 3);
      }

      for (let s = 0; s < shaftCount; s++) {
        const x = pad + shaftGap * (s + 1);
        ctx.strokeStyle = "rgba(148,163,184,0.16)";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(x, pad + 8);
        ctx.lineTo(x, pad + buildingH - 8);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      wavesRef.current = wavesRef.current.filter((wave) => {
        wave.t += dt * (replayIndex !== null ? 0.45 : 0.55);
        if (wave.t > 1.2) return false;
        const x = pad + shaftGap * (wave.shaft + 1);
        const yBase = pad + buildingH;
        const yTop = pad + buildingH - wave.floor * floorH - floorH / 2;
        const y = yBase - (yBase - yTop) * Math.min(wave.t, 1);
        const alpha = (wave.granted ? 0.9 : 0.7) * (1 - Math.max(0, wave.t - 0.85));
        ctx.beginPath();
        ctx.arc(x, y, 7 + wave.t * 5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${wave.hue}, ${wave.granted ? 78 : 50}%, ${wave.granted ? 58 : 48}%, ${alpha})`;
        ctx.fill();
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 36 + wave.t * 50);
        grad.addColorStop(0, `hsla(${wave.hue}, 80%, 60%, ${0.28 * (1 - wave.t)})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(x - 80, y - 80, 160, 160);
        if (wave.t >= 0.92 && wave.t < 1.08) {
          ctx.strokeStyle = wave.granted
            ? `hsla(${wave.hue}, 80%, 65%, 0.85)`
            : "rgba(239, 68, 68, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pad + 8, yTop);
          ctx.lineTo(pad + buildingW - 8, yTop);
          ctx.stroke();
        }
        return true;
      });

      ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
      ctx.font = "600 11px DM Sans, sans-serif";
      ctx.fillText("Ritmi i qarkut · çdo skanim është një valë", pad, h - 10);
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [floorCount, elevatorIds, replayIndex, selectedFloors, selectedUid]);

  return <canvas ref={canvasRef} className="pointer-events-none relative z-0 h-[520px] w-full" />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

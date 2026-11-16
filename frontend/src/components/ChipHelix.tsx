import { useEffect, useRef } from "react";

type Props = {
  seed: number;
  hue: number;
  size?: number;
};

export default function ChipHelix({ seed, hue, size = 72 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let frame = 0;
    let id = 0;
    const draw = () => {
      frame += 1;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      for (let i = 0; i < 28; i++) {
        const t = i / 28;
        const angle = t * Math.PI * 4 + (seed % 360) / 40 + frame / 40;
        const r = 8 + t * 18;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle * 1.3) * r * 0.55 + (t - 0.5) * 8;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(hue + i * 4) % 360}, 80%, ${55 + (i % 5) * 4}%, 0.9)`;
        ctx.fill();
        const x2 = cx + Math.cos(angle + Math.PI) * r;
        ctx.beginPath();
        ctx.arc(x2, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(hue + 40) % 360}, 70%, 62%, 0.55)`;
        ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [seed, hue, size]);

  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} />;
}

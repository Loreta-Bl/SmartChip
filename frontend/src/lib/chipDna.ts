export function uidHash(uid: string): number {
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = (Math.imul(h, 31) + uid.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function chipHue(uid: string): number {
  return uidHash(uid) % 360;
}

export function chipHelixSeed(uid: string): number {
  return (uidHash(uid) >>> 8) % 10_000;
}

/** Emër unik i gjeneruar — "gjeneza" vizuale e çipit */
export function chipGenesisName(uid: string): string {
  const h = uidHash(uid);
  const syllables = ["KRA", "LUM", "VEL", "NEX", "ORI", "PUL", "ARC", "SYN"];
  const a = syllables[h % syllables.length];
  const b = syllables[(h >> 4) % syllables.length];
  return `${a}-${b}-${(h % 9999).toString().padStart(4, "0")}`;
}

export function hsl(hue: number, s = 72, l = 58): string {
  return `hsl(${hue} ${s}% ${l}%)`;
}

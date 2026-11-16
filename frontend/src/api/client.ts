const TOKEN_KEY = "smartchip_token";
const ROLE_KEY = "smartchip_role";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}
export function setSession(token: string | null, role?: string) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (role) localStorage.setItem(ROLE_KEY, role);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    /* ignore */
  }
  return res.statusText || "Gabim";
}

export async function api<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = true, ...init } = options;
  const headers = new Headers(init.headers);
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new Error("Serveri nuk u lidh. Nis backend-in (port 8000) dhe rifresko.");
  }
  if (res.status === 401) {
    setSession(null);
    if (!path.includes("/auth/login")) window.location.assign("/login");
    throw new Error("Sesioni skadoi — hyr përsëri");
  }
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    throw new Error("Serveri nuk u lidh. Nis uvicorn në portin 8000.");
  }
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { access_token: string; role: string; full_name: string };
  setSession(data.access_token, data.role);
  return data;
}

export type Me = {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  apartment_id: number | null;
  apartment_number: string | null;
  building_name: string | null;
  entrance: string | null;
  floor: number | null;
};

export type DashboardStats = {
  total_apartments: number;
  total_residents: number;
  chips_active: number;
  chips_inactive: number;
  chips_lost: number;
  pending_requests: number;
  overdue_payments: number;
  elevators_down: number;
  open_sos: number;
};

export type Apartment = {
  id: number;
  building_id: number;
  number: string;
  entrance: string;
  floor: number;
  building_name: string | null;
  resident_count: number;
};

export type Chip = {
  id: number;
  uid: string;
  label: string;
  status: string;
  owner_id: number | null;
  owner_name: string | null;
  apartment_id: number | null;
  apartment_number: string | null;
  monthly_fee: number;
  payment_status: string | null;
  due_date: string | null;
  due_amount: number | null;
  paid_until: string | null;
};

export type ChipRequest = {
  id: number;
  user_id: number;
  user_name: string | null;
  kind: string;
  note: string;
  status: string;
  created_at: string;
  admin_note: string;
};

export type Payment = {
  id: number;
  user_id: number;
  user_name: string | null;
  chip_id: number;
  chip_uid: string | null;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: string;
};

export type Notification = {
  id: number;
  title: string;
  body: string;
  kind: string;
  channel: string;
  is_read: boolean;
  created_at: string;
};

export type Elevator = {
  id: number;
  building_id: number;
  name: string;
  status: string;
  sos_floor: number | null;
  sos_user_id: number | null;
  sos_user_name: string | null;
  sos_at: string | null;
  note: string;
  coming_count: number;
  coming_names: string[];
};

export type EchoSnapshot = {
  building_name: string;
  floor_count: number;
  elevators: Elevator[];
  last_scans: { chip_uid: string; floor: number; granted: boolean; at: string }[];
};

export type PulseEvent = {
  id: number;
  chip_uid: string;
  elevator_id: number;
  requested_floor: number;
  granted: boolean;
  created_at: string;
};

export type ChipAura = {
  uid: string;
  label: string;
  owner_name: string | null;
  hue: number;
  helix_seed: number;
  trust_score: number;
  home_floor: number | null;
  pulses_today: number;
  genesis: string;
};

export type PulseAnomaly = {
  code: string;
  title: string;
  detail: string;
  severity: string;
};

export type PulseSnapshot = {
  building_name: string;
  floor_count: number;
  elevator_ids: number[];
  events: PulseEvent[];
  floor_heat: { floor: number; count: number }[];
  chip_auras: ChipAura[];
  anomalies: PulseAnomaly[];
  heart_rate_per_hour: number;
};

import { useEffect, useMemo, useRef, useState } from "react";

type Item = { id: string; label: string };
type ThingyKey = "BINGO" | "SOUND" | "DRIVEBY" | "TRIVIA";

const THINGY_LABEL: Record<ThingyKey, string> = {
  BINGO: "Bingo Thingy",
  SOUND: "Sound Thingy",
  DRIVEBY: "DriveBy Thingy",
  TRIVIA: "Trivia Thingy",
};

const THINGY_BUTTONS: Record<ThingyKey, Item[]> = {
  BINGO: [
    { id: "BINGO_NEW", label: "New Card" },
    { id: "BINGO_CALL", label: "Call Number" },
    { id: "BINGO_CLEAR", label: "Clear Board" },
  ],
  SOUND: [
    { id: "BONK", label: "BONK" },
    { id: "SEXY_SAX", label: "Sexy Sax" },
    { id: "HOW_RUDE", label: "How Rude!" },
    { id: "DUNDUN", label: "Dun Dun Duuun" },
    { id: "CANTINA", label: "Cantina Band" },
    { id: "RIMSHOT", label: "Joke Drum" },
  ],
  DRIVEBY: [
    { id: "SIREN", label: "Siren" },
    { id: "HONK", label: "Honk" },
    { id: "ZOOM", label: "Zoom Past" },
  ],
  TRIVIA: [
    { id: "TRIVIA_START", label: "Start Trivia" },
    { id: "TRIVIA_HINT", label: "Hint" },
    { id: "TRIVIA_REVEAL", label: "Reveal Answer" },
  ],
};

const TWITCH_AUTHORIZE = "https://id.twitch.tv/oauth2/authorize";
const TWITCH_VALIDATE = "https://id.twitch.tv/oauth2/validate";

// raw gist URL for your current.json (no-cache fetch)
const GIST_RAW =
  "https://gist.githubusercontent.com/acidjurassic/4492e7b11e49293078f5e9ad25658d2f/raw/current.json";

// secret used to authenticate websocket messages to Streamer.bot
const WS_SECRET =
  (import.meta as any).env?.VITE_WS_SECRET || "rAnD0m-ALPHA-1234567890";

export default function AcidJurassicClicker() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // One toggle only: Enable/Disable Controls
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState("Bot Offline");
  const [active, setActive] = useState<ThingyKey | null>(null);
  const [busy, setBusy] = useState(false);

  const actionsDisabled = useMemo(() => !authed || !armed, [authed, armed]);

  // ---- WebSocket state ----
  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);

  // Validate token
  useEffect(() => {
    async function validate(tok: string) {
      try {
        const r = await fetch(TWITCH_VALIDATE, {
          headers: { Authorization: `OAuth ${tok}` },
        });
        if (!r.ok) throw new Error("bad token");
        const data = await r.json();
        setUsername(data.login ?? null);
        setAuthed(true);
        localStorage.setItem("twitch_token", tok);
        if (location.hash)
          history.replaceState(null, "", location.pathname + location.search);
      } catch {
        localStorage.removeItem("twitch_token");
        setAuthed(false);
        setUsername(null);
      }
    }

    if (location.hash.includes("access_token=")) {
      const q = new URLSearchParams(location.hash.slice(1));
      const tok = q.get("access_token");
      if (tok) validate(tok);
      return;
    }
    const existing = localStorage.getItem("twitch_token");
    if (existing) validate(existing);
  }, []);

  useEffect(() => {
    if (!authed) setStatus("Bot Offline");
    else if (!armed) setStatus("Safe Mode");
    else setStatus("Online");
  }, [authed, armed]);

  function loginWithTwitch() {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    if (!clientId) {
      alert("Missing VITE_TWITCH_CLIENT_ID in Vercel env vars.");
      return;
    }
    const u = new URL(TWITCH_AUTHORIZE);
    u.searchParams.set("client_id", clientId);
    u.searchParams.set("redirect_uri", window.location.origin);
    u.searchParams.set("response_type", "token");
    u.searchParams.set("scope", "user:read:email");
    window.location.href = u.toString();
  }

  function logout() {
    localStorage.removeItem("twitch_token");
    setAuthed(false);
    setUsername(null);
    setArmed(false);
    setActive(null);
  }

  // ---------- WS connect effect ----------
  useEffect(() => {
    let mounted = true;
    let backoff = 1000;
    let reconnectTimer: number | null = null;
    const pollInterval = 30_000; // 30s
    let lastRelay = "";

    async function fetchRelay(): Promise<string> {
      try {
        const r = await fetch(GIST_RAW, { cache: "no-store" });
        if (!r.ok) throw new Error("gist fetch failed");
        const j = await r.json();
        return (j?.url ?? "").trim();
      } catch (e) {
        console.debug("fetchRelay failed:", e);
        return "";
      }
    }

    async function connectLoop() {
      if (!mounted) return;
      const relay = await fetchRelay();
      if (!mounted) return;

      if (relay && relay === lastRelay && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // already connected to this relay
        return;
      }

      lastRelay = relay || lastRelay;

      let wsUrl = lastRelay;
      if (wsUrl.startsWith("https://")) wsUrl = wsUrl.replace(/^https:/, "wss");
      if (wsUrl.startsWith("http://")) wsUrl = wsUrl.replace(/^http:/, "ws");
      if (!wsUrl) wsUrl = "ws://127.0.0.1:18080/"; // local dev fallback

      try {
        try { wsRef.current?.close(); } catch {}
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setWsReady(true);
          backoff = 1000;
          console.debug("WS open", wsUrl);
        };
     // replace existing ws.onmessage = (ev) => { ... } with this:
ws.onmessage = (ev: MessageEvent) => {
  const raw = ev.data;
  try {
    // try parse JSON payload
    const parsed = JSON.parse(raw as string);
    console.debug("WS msg", parsed);
  } catch {
    // not JSON — print raw
    console.debug("WS msg raw", raw);
  }
        };
        ws.onclose = (ev) => {
          if (!mounted) return;
          setWsReady(false);
          console.debug("WS closed, will reconnect in", backoff);
          reconnectTimer = window.setTimeout(connectLoop, backoff);
          backoff = Math.min(backoff * 2, 30_000);
        };
        ws.onerror = (e) => {
          console.debug("WS error", e);
        };
      } catch (err) {
        console.warn("WS connect failed, scheduling retry", err);
        reconnectTimer = window.setTimeout(connectLoop, backoff);
        backoff = Math.min(backoff * 2, 30_000);
      }
    }

    connectLoop();
    const pollId = window.setInterval(() => connectLoop(), pollInterval);

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollId);
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
      setWsReady(false);
    };
  }, []);

  // helper: send via WS if possible
  function trySendWs(payload: any) {
    try {
      if (wsRef.current && wsReady && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
        console.debug("Sent via WS:", payload);
        return true;
      }
    } catch (e) {
      console.debug("WS send failed:", e);
    }
    return false;
  }

  // trigger: prefer WS, fallback to API POST
  async function trigger(item: Item) {
    if (actionsDisabled) {
      setStatus(!authed ? "Login required" : "Safe Mode: controls disabled");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        actionId: item.id,
        user: username ?? "viewer",
        userId: "",
        platform: "twitch",
        secret: WS_SECRET,
      };

      if (trySendWs(payload)) {
        setStatus(`Triggered: ${item.label} (via WS)`);
        return;
      }

      const tok = localStorage.getItem("twitch_token") || "";
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `OAuth ${tok}`,
        },
        body: JSON.stringify({ actionId: item.id }),
      });

      if (!res.ok) {
        if (res.status === 401) setStatus("Blocked: login expired — please login again");
        else if (res.status === 429) setStatus("Blocked: Cooldown (anti-spam)");
        else {
          const msg = await res.text().catch(() => "");
          setStatus(`Blocked: ${msg || `HTTP ${res.status}`}`);
        }
        return;
      }

      const { user } = await res.json().catch(() => ({ user: "viewer" }));
      setStatus(`Triggered: ${item.label} (by ${user})`);
    } catch (err) {
      console.error("trigger error:", err);
      setStatus("Network error");
    } finally {
      setTimeout(() => setBusy(false), 300);
    }
  }

  // ---------- UI ----------
  if (!authed) {
    return (
      <section className="rounded-2xl border border-toxic-500/60 bg-neutral-900/95 shadow-[0_0_35px_rgba(0,255,153,0.45),inset_0_0_12px_rgba(0,0,0,0.6)] backdrop-blur-md p-8 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-toxic-400 mb-4 drop-shadow-[0_0_12px_rgba(0,255,153,.6)]">
          WELCOME!
        </h1>
        <p className="text-gray-300 mb-8">
          Log in with Twitch to continue. We don’t store personal data — Twitch only confirms your identity.
        </p>
        <button
          onClick={loginWithTwitch}
          className="inline-flex items-center justify-center rounded-xl bg-toxic-500 text-black font-semibold py-3 px-6 hover:bg-toxic-400 shadow-[0_0_15px_rgba(0,255,153,0.5)] hover:shadow-[0_0_25px_rgba(0,255,153,0.8)] transition-all duration-300"
        >
          Login with Twitch
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-toxic-500/60 bg-neutral-900/95 shadow-[0_0_35px_rgba(0,255,153,0.45),inset_0_0_12px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden max-w-3xl mx-auto transition-all duration-500">
      <div className="bg-toxic-500/90 text-black px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">The Isla Tóxica Clicker</h2>
          <p className="text-black/80 font-medium">
            Connected as: {username ?? "…"}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-full bg-black/10 border border-black/20 px-4 py-1.5 font-semibold hover:bg-black/20"
        >
          Log out
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {(Object.keys(THINGY_LABEL) as ThingyKey[]).map((key) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`rounded-full px-5 py-2 text-lg font-semibold transition border-2 ${
                  isActive
                    ? "bg-toxic-500 text-black border-toxic-400 shadow-[0_0_18px_rgba(0,255,153,0.6)]"
                    : "bg-transparent text-toxic-300 border-toxic-400 hover:bg-toxic-500/15 hover:shadow-[0_0_12px_rgba(0,255,153,0.3)]"
                }`}
              >
                {THINGY_LABEL[key]}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-toxic-500/40 bg-neutral-800/70 p-6 sm:p-8 shadow-inner mb-6">
          {!active ? (
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-toxic-400 mb-3">
                WELCOME!
              </h3>
              <p className="text-gray-300">
                Pick a Thingy above to open its controls. Buttons only work
                when you’ve enabled controls.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-toxic-400 mb-4 text-center">
                {THINGY_LABEL[active]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THINGY_BUTTONS[active].map((i) => (
                  <button
                    key={i.id}
                    onClick={() => trigger(i)}
                    disabled={actionsDisabled || busy}
                    className="bg-toxic-500 text-black font-semibold rounded-xl py-3
                               shadow-[0_0_10px_rgba(0,255,153,0.4)] 
                               hover:shadow-[0_0_20px_rgba(0,255,153,0.8)]
                               hover:bg-toxic-400 transition-all duration-300
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setArmed((a) => !a)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              armed
                ? "bg-toxic-500 text-black hover:bg-toxic-400 shadow-[0_0_25px_rgba(0,255,153,0.6)] animate-pulse"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            {armed ? "Disable Controls" : "Enable Controls"}
          </button>

          <div
            className={`px-5 py-2 rounded-full font-semibold ${
              armed ? "bg-green-600" : "bg-red-600"
            } text-white`}
          >
            {status}
          </div>
        </div>

        <div className="h-px bg-white/10 my-6" />
        <div className="text-sm text-gray-300">{status}</div>
      </div>
    </section>
  );
}


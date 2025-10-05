import { useState } from "react";

type Item = { id: string; label: string };

const TOP_BUTTONS: Item[] = [
  { id: "BINGO", label: "Bingo Thingy" },
  { id: "SOUND", label: "Sound Thingy" },
  { id: "DRIVEBY", label: "DriveBy Thingy" },
  { id: "TRIVIA", label: "Trivia Thingy" },
];

const PANEL_BUTTONS: Item[] = [
  { id: "BONK", label: "BONK" },
  { id: "SEXY_SAX", label: "Sexy Sax" },
  { id: "HOW_RUDE", label: "How Rude!" },
  { id: "DUNDUN", label: "Dun Dun Duuun" },
  { id: "CANTINA", label: "Cantina Band" },
  { id: "RIMSHOT", label: "Joke Drum" },
];

function Btn({
  children,
  onClick,
  disabled,
  outline = false,
  pill = false,
  size = "xl",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  outline?: boolean;
  pill?: boolean;
  size?: "lg" | "xl";
}) {
  const base =
    "inline-flex items-center justify-center font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const shape = pill ? "rounded-full" : size === "xl" ? "rounded-2xl" : "rounded-xl";
  const pad = size === "xl" ? "py-3.5 px-6 text-lg" : "py-3 px-5 text-base";
  const palette = outline
    ? "border-2 border-emerald-400/80 text-emerald-200 hover:bg-emerald-500/10"
    : "bg-emerald-600 text-white hover:bg-emerald-500";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${shape} ${pad} ${palette}`}>
      {children}
    </button>
  );
}

export default function AcidJurassicClicker() {
  const [authed, setAuthed] = useState(true); // set to false to show login card
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Bot Offline");
  const allDisabled = !connected || !enabled;

  const trigger = (item: Item) => {
    if (allDisabled) return;
    setStatus(`Triggered: ${item.label}`);
    // TODO: call your backend / Streamer.bot here
  };

  // Login card (simple)
  if (!authed) {
    return (
      <section className="rounded-2xl border-2 border-emerald-500/50 bg-neutral-800 shadow-2xl p-8 sm:p-10">
        <h1 className="text-center text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-8">
          Welcome to Isla Tóxica’s Clicker
        </h1>
        <p className="text-center text-gray-200 max-w-xl mx-auto mb-10">
          Experience real-time interaction. Log in to start using the clicker!
        </p>
        <div className="flex justify-center">
          <Btn size="xl" onClick={() => setAuthed(true)}>Login with Twitch</Btn>
        </div>
      </section>
    );
  }

  // Main panel
  return (
    <section className="rounded-2xl border-2 border-emerald-500/50 bg-neutral-800 shadow-2xl overflow-hidden">
      {/* Header bar */}
      <div className="bg-emerald-600/90 text-black px-6 py-5">
        <h2 className="text-2xl font-bold">The Isla Tóxica Clicker</h2>
        <p className="text-black/80 font-medium">Connected as: AcidJurassic</p>
      </div>

      <div className="p-6 sm:p-8">
        {/* Top row “Thingy” buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          {TOP_BUTTONS.map((b) => (
            <Btn key={b.id} outline pill size="xl" disabled={allDisabled} onClick={() => trigger(b)}>
              {b.label}
            </Btn>
          ))}
        </div>

        {/* Content card */}
        <div className="rounded-xl border border-emerald-400/40 bg-neutral-900 p-6 sm:p-8 shadow-inner mb-6">
          <h3 className="text-3xl font-extrabold text-emerald-400 text-center mb-3">WELCOME!</h3>
          <div className="h-px w-24 bg-emerald-400/60 mx-auto mb-5" />
          <p className="text-center text-gray-200 max-w-2xl mx-auto">
            Select a “Thingy” to interact. Buttons work only when <span className="font-semibold">Connected</span> and{" "}
            <span className="font-semibold">Enabled</span>.
          </p>

          {/* Larger inner buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {PANEL_BUTTONS.map((i) => (
              <Btn key={i.id} size="xl" disabled={allDisabled} onClick={() => trigger(i)}>
                {i.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Controls + status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Btn
              size="lg"
              onClick={() => {
                const next = !connected;
                setConnected(next);
                setStatus(next ? "Bot Online" : "Bot Offline");
              }}
            >
              {connected ? "Connected" : "Connect"}
            </Btn>

            <Btn size="lg" outline={!enabled} onClick={() => setEnabled((e) => !e)}>
              {enabled ? "Enabled" : "Enable"}
            </Btn>
          </div>

          <div className={`px-5 py-2 rounded-full font-semibold ${connected ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {connected ? "Online" : "Bot Offline"}
          </div>
        </div>

        <div className="h-px bg-white/10 my-6" />
        <div className="text-sm text-gray-300">{status}</div>
      </div>
    </section>
  );
}


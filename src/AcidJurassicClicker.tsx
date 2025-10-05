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

function ThingyButton({
  children, onClick, disabled, variant = "outline", size = "xl", pill = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  size?: "lg" | "xl";
  pill?: boolean;
}) {
  const s = size === "xl" ? "btn btn-xl" : "btn btn-lg";
  const v = variant === "solid" ? "btn-solid" : "btn-outline";
  const r = pill ? "btn-pill" : "";
  return (
    <button type="button" className={`${s} ${v} ${r}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default function Panel() {
  // Design: theme toggle (toxic default, botgoid = orange)
  const [theme, setTheme] = useState<"toxic" | "botgoid">("toxic");
  const [authed, setAuthed] = useState(true);      // flip to false to see login card
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Bot Offline");

  const allDisabled = !connected || !enabled;

  const trigger = (item: Item) => {
    if (allDisabled) return;
    setStatus(`Triggered: ${item.label}`);
    // TODO: call /api/trigger here
  };

  const barCls =
    theme === "botgoid"
      ? "bg-botgoid-500/90 text-black"
      : "bg-toxic-500/90 text-black";

  const outlineSwap = theme === "botgoid" ? "border-botgoid-500 text-botgoid-100 hover:bg-botgoid-500/10"
                                          : "border-toxic-500 text-toxic-200 hover:bg-toxic-500/10";

  // ---------- Login card ----------
  if (!authed) {
    return (
      <div className="panel-card p-8 sm:p-10">
        <h1 className={`text-4xl sm:text-5xl font-extrabold text-center mb-8 ${theme === "botgoid" ? "text-botgoid-500" : "text-toxic-500 acid-glow"}`}>
          Welcome to Isla Tóxica’s Clicker
        </h1>
        <p className="text-center text-gray-200 max-w-xl mx-auto mb-10">
          Experience real-time interaction. Log in to start using the clicker!
        </p>
        <div className="flex justify-center">
          <ThingyButton variant="solid" size="xl" onClick={() => setAuthed(true)}>
            Login with Twitch
          </ThingyButton>
        </div>
      </div>
    );
  }

  // ---------- Main panel ----------
  return (
    <section className="panel-card overflow-hidden">
      {/* Header bar */}
      <div className={`${barCls} px-6 py-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">The Isla Tóxica Clicker</h2>
            <p className="text-black/80 font-medium">Connected as: AcidJurassic</p>
          </div>

          {/* Theme toggle */}
          <div className="flex gap-2">
            <button onClick={() => setTheme("toxic")} className="btn btn-lg btn-outline">
              Toxic
            </button>
            <button
              onClick={() => setTheme("botgoid")}
              className={`btn btn-lg ${theme === "botgoid" ? "btn-solid" : "btn-outline"}`}
            >
              Botgoid
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Top row buttons (outline, pill) */}
        <div className="flex flex-wrap gap-4 mb-6">
          {TOP_BUTTONS.map((b) => (
            <button
              key={b.id}
              onClick={() => trigger(b)}
              disabled={allDisabled}
              className={`btn btn-xl btn-pill border-2 ${outlineSwap} shadow-neonSoft`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Welcome / content area */}
        <div className="panel-inner border-2 border-white/5 p-6 sm:p-8 mb-6">
          <h3 className={`text-3xl font-extrabold text-center mb-2 ${theme === "botgoid" ? "text-botgoid-500" : "text-toxic-500 acid-glow"}`}>
            WELCOME!
          </h3>
          <div className={`${theme === "botgoid" ? "bg-botgoid-500/40" : "bg-toxic-500/40"} h-px w-24 mx-auto mb-5`} />
          <p className="text-center text-gray-200 max-w-2xl mx-auto">
            Select a “Thingy” to interact. Buttons work only when{" "}
            <span className="font-semibold">Connected</span> and{" "}
            <span className="font-semibold">Enabled</span>.
          </p>

          {/* Inner action grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {PANEL_BUTTONS.map((i) => (
              <ThingyButton
                key={i.id}
                size="xl"
                variant="solid"
                disabled={allDisabled}
                onClick={() => trigger(i)}
              >
                {i.label}
              </ThingyButton>
            ))}
          </div>
        </div>

        {/* Controls + status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ThingyButton
              size="lg"
              variant="solid"
              onClick={() => {
                const next = !connected;
                setConnected(next);
                setStatus(next ? "Bot Online" : "Bot Offline");
              }}
            >
              {connected ? "Connected" : "Connect"}
            </ThingyButton>

            <ThingyButton
              size="lg"
              variant={enabled ? "solid" : "outline"}
              onClick={() => setEnabled((e) => !e)}
            >
              {enabled ? "Enabled" : "Enable"}
            </ThingyButton>
          </div>

          <div
            className={`px-5 py-2 rounded-full font-semibold ${
              connected ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {connected ? "Online" : "Bot Offline"}
          </div>
        </div>

        {/* Status line */}
        <div className="h-px bg-white/10 my-6" />
        <div className="text-sm text-gray-300">{status}</div>
      </div>
    </section>
  );
}


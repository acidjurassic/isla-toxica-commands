import { useEffect, useState } from "react";

type ButtonItem = { id: string; label: string };
type Category = { key: string; name: string; icon: string; items: ButtonItem[] };

const CATEGORIES: Category[] = [
  {
    key: "audio",
    name: "Audio Triggers",
    icon: "🎧",
    items: [
      { id: "BONK", label: "BONK" },
      { id: "SEXY_SAX", label: "Sexy Sax" },
      { id: "HOW_RUDE", label: "How Rude!" },
      { id: "DUNDUN", label: "Dun Dun Duuun" },
      { id: "CANTINA", label: "Cantina Band" },
      { id: "RIMSHOT", label: "Joke Drum" },
    ],
  },
  {
    key: "combat",
    name: "Combat Events",
    icon: "💀",
    items: [
      { id: "THARGOID_ALERT", label: "Thargoid Alert" },
      { id: "SHIP_DESTROYED", label: "Ship Destroyed" },
      { id: "METEOR_STRIKE", label: "Meteor Strike" },
      { id: "NUKE", label: "Containment Breach" },
      { id: "ALERT_RED", label: "Red Alert" },
    ],
  },
  {
    key: "squad",
    name: "Glowspike Squad",
    icon: "🧬",
    items: [
      { id: "GLOW_ROAR", label: "Glow Roar" },
      { id: "EGG_HATCH", label: "Egg Hatch" },
      { id: "SQUAD_PING", label: "Squad Ping" },
      { id: "HYPE_SURGE", label: "Hype Surge" },
    ],
  },
  {
    key: "utility",
    name: "Utility Tools",
    icon: "⚙️",
    items: [
      { id: "CLEAR_OVERLAYS", label: "Clear Overlays" },
      { id: "RANDOMIZER", label: "Randomizer" },
      { id: "CHAT_PING", label: "Chat Ping" },
    ],
  },
];

export default function AcidJurassicClicker() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Bot Offline");
  const [selected, setSelected] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  function handleClick(label: string) {
    if (!connected) {
      setStatus("Connect first!");
      return;
    }
    setSelected(label);
    setStatus(`Triggered → ${label}`);
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,255,153,.15)] p-8 max-w-5xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold acid-glow text-center sm:text-left mb-4 sm:mb-0">
          ☣ Isla Tóxica Commands
        </h1>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-300 flex items-center gap-1 select-none">
            <input
              type="checkbox"
              className="accent-emerald-500"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
            />
            Debug
          </label>

          <button
            onClick={() => setConnected((c) => !c)}
            className="appearance-none bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-base font-medium border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {/* Status (debug only) */}
      {showDebug && (
        <div className="mb-4 text-sm text-gray-300 space-y-1">
          <div>Status: {status}</div>
          {selected && (
            <div>
              Last Triggered: <span className="font-semibold">{selected}</span>
            </div>
          )}
        </div>
      )}

      {/* Category Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className="p-5 rounded-xl bg-gray-900/80 border border-emerald-700/40 shadow-[0_0_20px_rgba(0,255,153,.1)]"
          >
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-400">
              <span>{cat.icon}</span> {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.label)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg text-base border border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition transform hover:scale-105"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


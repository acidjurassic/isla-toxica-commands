import { useEffect, useState } from "react";

type Thingy = { id: string; label: string; hint?: string };
type Category = { key: string; name: string; icon: string; items: Thingy[] };

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
    ],
  },
  {
    key: "combat",
    name: "Combat Events",
    icon: "💀",
    items: [
      { id: "THARGOID_ALERT", label: "Thargoid Alert" },
      { id: "SHIP_DESTROYED", label: "Ship Destroyed" },
    ],
  },
  {
    key: "squad",
    name: "Glowspike Squad",
    icon: "🧬",
    items: [
      { id: "GLOW_ROAR", label: "Glow Roar" },
      { id: "EGG_HATCH", label: "Egg Hatch" },
    ],
  },
];

const randomSessionId = () =>
  Math.random().toString(36).slice(2, 9).toUpperCase();

export default function AcidJurassicClicker() {
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    audio: true,
  });
  const [sessionId] = useState(randomSessionId());
  const [status, setStatus] = useState("Bot Offline");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  function handleClick(label: string) {
    if (!connected) return setStatus("Connect first!");
    setSelected(label);
    setStatus(`Triggered → ${label}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-800 rounded-2xl shadow-2xl border border-emerald-700/40">
      <header className="flex justify-between mb-4">
        <h1 className="text-xl font-bold acid-glow">☣ Isla Tóxica Commands</h1>
        <button
          onClick={() => setConnected((c) => !c)}
          className="button-glow px-3 py-1 bg-gray-700 rounded-md"
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </header>

      <div className="mb-4 text-sm">
        <div>
          Session ID: <span className="font-mono">{sessionId}</span>
        </div>
        <div>Status: {status}</div>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat.key} className="mb-4">
          <button
            onClick={() =>
              setExpanded((p) => ({ ...p, [cat.key]: !p[cat.key] }))
            }
            className="w-full flex justify-between items-center bg-gray-700 p-2 rounded-md"
          >
            <span>
              {cat.icon} {cat.name}
            </span>
            <span>{expanded[cat.key] ? "–" : "+"}</span>
          </button>

          {expanded[cat.key] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.label)}
                  className="button-glow px-3 py-2 bg-emerald-700 rounded text-sm hover:scale-105 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {selected && (
        <div className="mt-6 text-center text-sm">
          <p>
            Last Triggered: <span className="font-semibold">{selected}</span>
          </p>
        </div>
      )}
    </div>
  );
}


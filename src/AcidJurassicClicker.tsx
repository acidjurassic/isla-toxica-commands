import { useEffect, useState } from "react";

type Thingy = { id: string; label: string; hint?: string };
type Category = { key: string; name: string; icon: string; items: Thingy[] };

const CATEGORIES: Category[] = [
  // 1) AUDIO
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
      { id: "RIMSHOT", label: "Joke Drum Hit" },
    ],
  },
  // 2) COMBAT
  {
    key: "combat",
    name: "Combat Events",
    icon: "💀",
    items: [
      { id: "THARGOID_ALERT", label: "Thargoid Alert" },
      { id: "SHIP_DESTROYED", label: "Ship Destroyed" },
      { id: "METEOR_STRIKE", label: "Meteor Strike" },
      { id: "WING_JOIN", label: "Wing Join" },
      { id: "ALERT_RED", label: "Red Alert" },
      { id: "NUKE", label: "Containment Breach" },
    ],
  },
  // 3) GLOWSPIKE
  {
    key: "squad",
    name: "Glowspike Squad",
    icon: "🧬",
    items: [
      { id: "GLOW_ROAR", label: "Glow Roar" },
      { id: "CONTAINMENT_UNLOCK", label: "Containment Unlock" },
      { id: "EGG_HATCH", label: "Egg Hatch" },
      { id: "SQUAD_PING", label: "Squad Ping" },
      { id: "EMOTE_STORM", label: "Emote Storm" },
      { id: "HYPE", label: "Hype Surge" },
    ],
  },
  // 4) UTILITY
  {
    key: "utility",
    name: "Utility Tools",
    icon: "🎮",
    items: [
      { id: "BINGO_NEW", label: "Bingo: New Card" },
      { id: "RANDOMIZER", label: "Randomizer" },
      { id: "CHAT_PING", label: "Chat Ping" },
      { id: "CLEAR_OVERLAYS", label: "Clear Overlays" },
      { id: "MUTE_SFX", label: "Mute SFX" },
      { id: "UNMUTE_SFX", label: "Unmute SFX" },
    ],
  },
];

const randomSessionId = () =>
  Math.random().toString(36).slice(2, 9).toUpperCase();

export default function AcidJurassicClicker() {
  const [connected, setConnected] = useState(false);
  // 👇 default ALL categories expanded so you can see the buttons
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    audio: true,
    combat: true,
    squad: true,
    utility: true,
  });
  const [sessionId] = useState(randomSessionId());
  const [status, setStatus] = useState("Bot Offline");
  const [selected, setSelected] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  function handleClick(label: string) {
    if (!connected) return setStatus("Connect first!");
    setSelected(label);
    setStatus(`Triggered → ${label}`);
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur rounded-2xl border border-emerald-600/30 shadow-[0_0_40px_rgba(0,255,153,.08)] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold acid-glow">☣ Isla Tóxica Commands</h1>

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
            type="button"
            onClick={() => setConnected((c) => !c)}
            className="appearance-none bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>

      {/* Status (hidden unless Debug on) */}
      {showDebug && (
        <div className="mb-4 text-sm text-gray-300 space-y-1">
          <div>Session ID: <span className="font-mono">{sessionId}</span></div>
          <div>Status: {status}</div>
          {selected && (
            <div>Last Triggered: <span className="font-semibold">{selected}</span></div>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="rounded-lg overflow-hidden border border-gray-700/60">
            <button
              type="button"
              onClick={() => setExpanded((p) => ({ ...p, [cat.key]: !p[cat.key] }))}
              className="appearance-none w-full text-left px-3 py-2 bg-gray-700/70 hover:bg-gray-700 text-sm flex items-center justify-between focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span className="font-semibold">{cat.name}</span>
              </span>
              <span className="text-gray-300">{expanded[cat.key] ? "–" : "+"}</span>
            </button>

            {expanded[cat.key] && (
              <div className="p-3 bg-gray-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cat.items.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleClick(item.label)}
                      className="appearance-none bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-md text-sm border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


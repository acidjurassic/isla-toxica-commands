import { useEffect, useMemo, useState } from "react";

// ---- Mock data per Thingy (each tab gets its own buttons) ----
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
const TWITCH_VALIDATE  = "https://id.twitch.tv/oauth2/validate";

export default function AcidJurassicClicker() {
  // ---- Auth (Twitch implicit flow) ----
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ---- Panel gating ----
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Bot Offline");

  // ---- Tabs ----
  const [active, setActive] = useState<ThingyKey | null>(null); // null = welcome

  const buttonsDisabled = useMemo(
    () => !authed || !connected || !enabled,
    [authed, connected, enabled]
  );

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  // Parse token from hash or localStorage, then vali


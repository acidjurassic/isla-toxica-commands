import "./index.css";
import Panel from "./AcidJurassicClicker"; // or "./components/AcidJurassicClicker"

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-3xl">
        <Panel />
      </main>
    </div>
  );
}




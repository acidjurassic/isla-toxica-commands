import "./index.css";
import AcidJurassicClicker from "./AcidJurassicClicker"; // or "./components/AcidJurassicClicker"

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 flex items-center justify-center p-6">
      <main className="w-full max-w-3xl">
        <AcidJurassicClicker />
      </main>
    </div>
  );
}




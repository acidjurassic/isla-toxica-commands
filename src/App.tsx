import "./index.css";
import AcidJurassicClicker from "./AcidJurassicClicker"; // or "./components/AcidJurassicClicker"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <main className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <AcidJurassicClicker />
      </main>
    </div>
  );
}




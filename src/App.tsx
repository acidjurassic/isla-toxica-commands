import "./index.css";
import AcidJurassicClicker from "./AcidJurassicClicker"; // or "./components/AcidJurassicClicker"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-start justify-center">
      {/* top spacing so header isn’t glued to the top */}
      <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <AcidJurassicClicker />
      </main>
    </div>
  );
}




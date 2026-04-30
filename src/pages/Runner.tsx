import { Link } from "react-router-dom";
import RunnerGame from "@/components/RunnerGame";

export default function Runner() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 flex-shrink-0">
        <Link to="/" className="text-white font-black text-lg uppercase tracking-wide hover:text-orange-400 transition-colors">
          NitroForce
        </Link>
        <span className="text-yellow-400 font-bold uppercase tracking-widest text-sm">Neon Runner</span>
        <Link to="/" className="text-neutral-400 hover:text-white transition-colors text-sm uppercase tracking-wide">
          ← Главная
        </Link>
      </header>
      <div className="flex-1 min-h-0">
        <RunnerGame />
      </div>
    </div>
  );
}

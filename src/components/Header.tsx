import { useNavigate } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <div
          className="text-white text-sm uppercase tracking-wide font-bold cursor-pointer hover:text-orange-400 transition-colors duration-300"
          onClick={() => navigate("/")}
        >
          NitroForce
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="#features"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm hidden sm:block"
          >
            Игра
          </a>
          <button
            onClick={() => navigate("/runner")}
            className="border border-yellow-400 hover:bg-yellow-400 hover:text-black text-yellow-400 px-4 py-2 uppercase tracking-widest text-xs font-black transition-all duration-300 cursor-pointer hidden sm:block"
          >
            Runner
          </button>
          <button
            onClick={() => navigate("/play")}
            className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 uppercase tracking-widest text-xs font-black transition-all duration-300 cursor-pointer"
          >
            Гонка
          </button>
        </nav>
      </div>
    </header>
  );
}
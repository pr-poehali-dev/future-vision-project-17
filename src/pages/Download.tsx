import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const platforms = [
  {
    icon: "Monitor",
    name: "Windows",
    version: "Windows 10 / 11",
    size: "15.2 GB",
    badge: "Рекомендуется",
  },
  {
    icon: "Apple",
    name: "macOS",
    version: "macOS 12+",
    size: "14.8 GB",
    badge: null,
  },
  {
    icon: "Smartphone",
    name: "Android",
    version: "Android 10+",
    size: "3.4 GB",
    badge: "Популярно",
  },
];

const requirements = [
  { label: "ОС", min: "Windows 10 64-bit", rec: "Windows 11 64-bit" },
  { label: "Процессор", min: "Intel i5-8400", rec: "Intel i7-10700K" },
  { label: "Видеокарта", min: "GTX 1060 6GB", rec: "RTX 3070" },
  { label: "ОЗУ", min: "8 GB", rec: "16 GB" },
  { label: "Место на диске", min: "15 GB", rec: "20 GB" },
];

export default function Download() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="p-6 flex items-center justify-between border-b border-neutral-800">
        <Link to="/" className="text-white font-black text-xl uppercase tracking-wide hover:text-orange-400 transition-colors">
          NitroForce
        </Link>
        <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm uppercase tracking-wide">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-orange-400 uppercase tracking-[0.3em] text-sm mb-4 text-center font-semibold">
          Скачать игру
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-center mb-4 leading-tight">
          ИГРАЙ<br />БЕСПЛАТНО
        </h1>
        <p className="text-neutral-400 text-center text-lg mb-16 max-w-xl mx-auto">
          Выбери платформу и начни гонку прямо сейчас. Регистрация не требуется.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800 mb-20">
          {platforms.map((p) => (
            <div key={p.name} className="bg-neutral-950 p-8 flex flex-col items-center text-center hover:bg-neutral-900 transition-colors group relative">
              {p.badge && (
                <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-2 py-1 uppercase tracking-wide font-bold">
                  {p.badge}
                </span>
              )}
              <Icon name={p.icon} size={40} className="text-orange-500 mb-5 group-hover:text-orange-400 transition-colors" />
              <h3 className="text-2xl font-black mb-1 uppercase">{p.name}</h3>
              <p className="text-neutral-500 text-sm mb-1">{p.version}</p>
              <p className="text-neutral-600 text-xs mb-6">{p.size}</p>
              <button className="w-full bg-orange-500 hover:bg-orange-400 text-white py-3 uppercase tracking-widest text-sm font-bold transition-all duration-300 cursor-pointer">
                Скачать
              </button>
            </div>
          ))}
        </div>

        <div className="border border-neutral-800 p-8">
          <h2 className="text-xl font-black uppercase tracking-wide mb-6 text-center">
            Системные требования
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 text-neutral-500 font-normal uppercase tracking-wide w-1/3">Компонент</th>
                  <th className="text-left py-3 text-neutral-500 font-normal uppercase tracking-wide w-1/3">Минимум</th>
                  <th className="text-left py-3 text-orange-500 font-normal uppercase tracking-wide w-1/3">Рекомендуется</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((r) => (
                  <tr key={r.label} className="border-b border-neutral-900">
                    <td className="py-3 text-neutral-400">{r.label}</td>
                    <td className="py-3 text-neutral-300">{r.min}</td>
                    <td className="py-3 text-white">{r.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import Icon from "@/components/ui/icon";

const features = [
  {
    icon: "Gauge",
    title: "Реальная физика",
    desc: "Каждый автомобиль ведёт себя уникально — чувствуй разницу между мышечным масклом и японским спорткаром.",
  },
  {
    icon: "Wrench",
    title: "Глубокий тюнинг",
    desc: "Двигатель, подвеска, тормоза, аэродинамика — сотни деталей для создания идеальной машины.",
  },
  {
    icon: "Trophy",
    title: "Онлайн-чемпионат",
    desc: "Соревнуйся с игроками со всего мира. Поднимайся в рейтинге и стань легендой улиц.",
  },
  {
    icon: "Map",
    title: "Открытый мир",
    desc: "Огромный живой мегаполис с десятками трасс, секретных маршрутов и ночных гонок.",
  },
  {
    icon: "Zap",
    title: "Нитро & дрифт",
    desc: "Мастерски используй нитро и дрифт, чтобы проходить повороты быстрее соперников.",
  },
  {
    icon: "Shield",
    title: "Полиция в погоне",
    desc: "Уйди от погони или устрой ловушку — полиция не даст расслабиться ни на секунду.",
  },
];

export default function Features() {
  return (
    <div id="features" className="bg-neutral-950 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-orange-400 uppercase tracking-[0.3em] text-sm mb-4 text-center font-semibold">
          Возможности
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white text-center mb-16 leading-tight">
          ГОНКА. ТЮНИНГ.<br />ПОБЕДА.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-neutral-950 p-8 hover:bg-neutral-900 transition-colors duration-300 group"
            >
              <div className="mb-5">
                <Icon
                  name={f.icon}
                  size={32}
                  className="text-orange-500 group-hover:text-orange-400 transition-colors"
                />
              </div>
              <h3 className="text-white font-bold text-lg mb-3 uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

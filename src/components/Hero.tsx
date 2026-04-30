import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);

  return (
    <div
      ref={container}
      className="relative flex items-center justify-center h-screen overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="https://cdn.poehali.dev/projects/5331a76e-fcb1-4ead-a56d-a81ae8d56851/files/12a36b28-efe2-4172-a45f-84dea4cc11ad.jpg"
          alt="Street racing at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative z-10 text-center text-white">
        <p className="text-orange-400 uppercase tracking-[0.3em] text-sm mb-4 font-semibold">Уличные гонки нового уровня</p>
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight mb-6 leading-none">
          NITRO<br/>FORCE
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto px-6 opacity-90 mb-8">
          Ощути адреналин настоящих уличных гонок. Тюнингуй авто, бросай вызов соперникам и властвуй над городом.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/play")}
            className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold transition-all duration-300 cursor-pointer"
          >
            Играть сейчас
          </button>
          <button
            onClick={() => navigate("/download")}
            className="bg-transparent border border-white hover:border-orange-400 hover:text-orange-400 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold transition-all duration-300 cursor-pointer"
          >
            Скачать
          </button>
        </div>
      </div>
    </div>
  );
}
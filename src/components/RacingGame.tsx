import { useEffect, useRef, useState, useCallback } from "react";

const TRACK_POINTS = [
  { x: 400, y: 100 },
  { x: 700, y: 80 },
  { x: 850, y: 150 },
  { x: 900, y: 300 },
  { x: 850, y: 450 },
  { x: 700, y: 520 },
  { x: 500, y: 540 },
  { x: 300, y: 520 },
  { x: 150, y: 450 },
  { x: 100, y: 300 },
  { x: 120, y: 150 },
  { x: 250, y: 90 },
];

const TRACK_WIDTH = 70;
const NUM_BOTS = 3;
const BOT_COLORS = ["#ef4444", "#22c55e", "#3b82f6"];
const PLAYER_COLOR = "#f97316";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPointOnTrack(t: number) {
  const pts = TRACK_POINTS;
  const n = pts.length;
  const idx = Math.floor(t * n) % n;
  const next = (idx + 1) % n;
  const local = (t * n) % 1;
  return {
    x: lerp(pts[idx].x, pts[next].x, local),
    y: lerp(pts[idx].y, pts[next].y, local),
  };
}

function getAngleOnTrack(t: number) {
  const a = getPointOnTrack(t);
  const b = getPointOnTrack((t + 0.001) % 1);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

interface Car {
  t: number;
  speed: number;
  offset: number;
  lap: number;
}

export default function RacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { t: 0, speed: 0, offset: 0, lap: 0 } as Car,
    bots: BOT_COLORS.map((_, i) => ({
      t: 0.02 * (i + 1),
      speed: 0.0018 + i * 0.0002,
      offset: (i - 1) * 18,
      lap: 0,
    })) as Car[],
    keys: {} as Record<string, boolean>,
    started: false,
    finished: false,
    totalLaps: 3,
    countdown: 3,
    countdownTimer: 0,
  });
  const animRef = useRef<number>(0);
  const raceStartTimeRef = useRef<number>(0);
  const raceFinishTimeRef = useRef<number>(0);
  const [display, setDisplay] = useState({ speed: 0, pos: 1, lap: 1, totalLaps: 3, countdown: 3, started: false, finished: false, winner: "" });
  const [elapsed, setElapsed] = useState(0);
  const [records, setRecords] = useState<{ player_name: string; finish_time_ms: number }[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_URL = "https://functions.poehali.dev/c378aa92-51ac-49b3-ba9d-2ba1318f3739";

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (e) { console.error(e); }
  }, []);

  const saveRecord = useCallback(async (name: string, timeMs: number) => {
    setSaving(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: name, finish_time_ms: timeMs, laps: 3 }),
      });
      await fetchRecords();
      setNameSaved(true);
    } catch (e) { console.error(e); } finally {
      setSaving(false);
    }
  }, [fetchRecords]);

  function formatTime(ms: number) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      stateRef.current.keys[e.key] = down;
      if (down && !stateRef.current.started && stateRef.current.countdown <= 0) {
        stateRef.current.started = true;
      }
    };
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));

    // Countdown
    const cdInterval = setInterval(() => {
      const s = stateRef.current;
      if (s.countdown > 0) {
        s.countdown -= 1;
        setDisplay(d => ({ ...d, countdown: s.countdown }));
      } else {
        s.started = true;
        raceStartTimeRef.current = performance.now();
        clearInterval(cdInterval);
      }
    }, 1000);

    // Elapsed timer
    const elapsedInterval = setInterval(() => {
      if (stateRef.current.started && !stateRef.current.finished) {
        setElapsed(Math.floor(performance.now() - raceStartTimeRef.current));
      }
    }, 100);

    return () => {
      window.removeEventListener("keydown", (e) => onKey(e, true));
      window.removeEventListener("keyup", (e) => onKey(e, false));
      clearInterval(cdInterval);
      clearInterval(elapsedInterval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function drawTrack() {
      const pts = TRACK_POINTS;
      const n = pts.length;

      // Outer edge
      ctx.beginPath();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = TRACK_WIDTH * 2 + 10;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let i = 0; i <= n; i++) {
        const p = pts[i % n];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Road
      ctx.beginPath();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = TRACK_WIDTH * 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let i = 0; i <= n; i++) {
        const p = pts[i % n];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Center dashes
      ctx.beginPath();
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      for (let i = 0; i <= n; i++) {
        const p = pts[i % n];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Start/finish line
      const sp = pts[0];
      const angle = getAngleOnTrack(0);
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(angle + Math.PI / 2);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#000000";
        ctx.fillRect(-TRACK_WIDTH + i * (TRACK_WIDTH * 2 / 6), -6, TRACK_WIDTH * 2 / 6, 12);
      }
      ctx.restore();
    }

    function drawCar(x: number, y: number, angle: number, color: string, shadow = false) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      if (shadow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }
      // Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-8, -14, 16, 28, 4);
      ctx.fill();
      // Windows
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(-5, -8, 10, 8);
      // Wheels
      ctx.fillStyle = "#111";
      [[-10, -10], [10, -10], [-10, 8], [10, 8]].forEach(([wx, wy]) => {
        ctx.fillRect(wx - 3, wy - 4, 6, 8);
      });
      ctx.restore();
    }

    function getPosition(playerT: number, bots: Car[]) {
      const all = [playerT, ...bots.map(b => b.t)];
      const sorted = [...all].sort((a, b) => b - a);
      return sorted.indexOf(playerT) + 1;
    }

    let lastTime = 0;
    function loop(time: number) {
      const dt = Math.min(time - lastTime, 32);
      lastTime = time;
      const s = stateRef.current;

      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;

      const scaleX = canvas!.width / 1000;
      const scaleY = canvas!.height / 620;
      ctx.save();
      ctx.scale(scaleX, scaleY);

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 1000, 620);

      // Grid
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1000; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 620); ctx.stroke();
      }
      for (let y = 0; y < 620; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke();
      }

      drawTrack();

      if (s.started && !s.finished) {
        // Player input
        const keys = s.keys;
        const maxSpeed = 0.004;
        const accel = 0.00015;
        const brake = 0.0003;
        const friction = 0.00005;

        if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
          s.player.speed = Math.min(s.player.speed + accel * dt, maxSpeed);
        } else {
          s.player.speed = Math.max(s.player.speed - friction * dt, 0);
        }
        if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
          s.player.speed = Math.max(s.player.speed - brake * dt, 0);
        }
        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
          s.player.offset = Math.max(s.player.offset - 0.3 * dt * (s.player.speed / maxSpeed), -TRACK_WIDTH + 12);
        }
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
          s.player.offset = Math.min(s.player.offset + 0.3 * dt * (s.player.speed / maxSpeed), TRACK_WIDTH - 12);
        }

        const prevT = s.player.t;
        s.player.t = (s.player.t + s.player.speed * dt) % 1;
        if (prevT > 0.9 && s.player.t < 0.1) {
          s.player.lap += 1;
          if (s.player.lap >= s.totalLaps) {
            s.finished = true;
            const finishMs = Math.floor(performance.now() - raceStartTimeRef.current);
            raceFinishTimeRef.current = finishMs;
            setDisplay(d => ({ ...d, finished: true, winner: "Ты победил! 🏆" }));
            fetchRecords();
          }
        }

        // Bots
        s.bots.forEach((bot, i) => {
          const prevBotT = bot.t;
          bot.t = (bot.t + bot.speed * dt) % 1;
          if (prevBotT > 0.9 && bot.t < 0.1) {
            bot.lap += 1;
            if (!s.finished && bot.lap >= s.totalLaps) {
              s.finished = true;
              setDisplay(d => ({ ...d, finished: true, winner: `Бот ${i + 1} финишировал первым!` }));
            }
          }
        });

        const speedKmh = Math.round(s.player.speed / 0.004 * 320);
        const pos = getPosition(s.player.t + s.player.lap, s.bots.map(b => b.t + b.lap));
        setDisplay(d => ({ ...d, speed: speedKmh, pos, lap: Math.min(s.player.lap + 1, s.totalLaps), started: true }));
      }

      // Draw bots
      s.bots.forEach((bot, i) => {
        const p = getPointOnTrack(bot.t);
        const angle = getAngleOnTrack(bot.t);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        drawCar(p.x + perpX * bot.offset, p.y + perpY * bot.offset, angle, BOT_COLORS[i]);
      });

      // Draw player
      const pp = getPointOnTrack(s.player.t);
      const pa = getAngleOnTrack(s.player.t);
      const perpX = -Math.sin(pa);
      const perpY = Math.cos(pa);
      drawCar(pp.x + perpX * s.player.offset, pp.y + perpY * s.player.offset, pa, PLAYER_COLOR, true);

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Touch controls
  const handleTouch = (key: string, down: boolean) => {
    stateRef.current.keys[key] = down;
    if (down && !stateRef.current.started) stateRef.current.started = true;
  };

  const restart = () => {
    const s = stateRef.current;
    s.player = { t: 0, speed: 0, offset: 0, lap: 0 };
    s.bots = BOT_COLORS.map((_, i) => ({
      t: 0.02 * (i + 1),
      speed: 0.0018 + i * 0.0002,
      offset: (i - 1) * 18,
      lap: 0,
    }));
    s.finished = false;
    s.started = false;
    s.countdown = 3;
    raceStartTimeRef.current = 0;
    raceFinishTimeRef.current = 0;
    setElapsed(0);
    setNameSaved(false);
    setPlayerName("");
    setShowRecords(false);
    setDisplay({ speed: 0, pos: 1, lap: 1, totalLaps: 3, countdown: 3, started: false, finished: false, winner: "" });
    // restart countdown
    let cd = 3;
    const cdInterval = setInterval(() => {
      cd -= 1;
      stateRef.current.countdown = cd;
      setDisplay(d => ({ ...d, countdown: cd }));
      if (cd <= 0) {
        stateRef.current.started = true;
        raceStartTimeRef.current = performance.now();
        clearInterval(cdInterval);
      }
    }, 1000);
  };

  return (
    <div className="relative w-full h-full bg-neutral-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-black/70 text-white px-4 py-2 font-black text-2xl uppercase tracking-widest">
          {display.speed} <span className="text-xs font-normal text-neutral-400">км/ч</span>
        </div>
        <div className="bg-black/70 text-orange-400 px-4 py-2 font-bold text-sm uppercase tracking-wide">
          Круг {display.lap} / {display.totalLaps}
        </div>
        <div className="bg-black/70 text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
          Позиция: <span className="text-orange-400">{display.pos}</span>
        </div>
      </div>

      {/* Timer */}
      {display.started && !display.finished && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 font-black text-xl tracking-widest tabular-nums">
          {formatTime(elapsed)}
        </div>
      )}

      {/* Countdown */}
      {display.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-orange-400 font-black text-[20vw] leading-none" style={{ textShadow: "0 0 60px #f97316" }}>
            {display.countdown}
          </div>
        </div>
      )}
      {display.countdown === 0 && !display.started && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white font-black text-[10vw] leading-none uppercase" style={{ textShadow: "0 0 40px #f97316" }}>
            GO!
          </div>
        </div>
      )}

      {/* Finish overlay */}
      {display.finished && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 px-4 overflow-y-auto py-8">
          <div className="text-5xl">🏁</div>
          <div className="text-white font-black text-2xl md:text-4xl uppercase text-center">{display.winner}</div>

          {raceFinishTimeRef.current > 0 && (
            <div className="text-orange-400 font-black text-3xl tracking-widest">
              {formatTime(raceFinishTimeRef.current)}
            </div>
          )}

          {/* Save record form — only if player won */}
          {raceFinishTimeRef.current > 0 && !nameSaved && (
            <div className="flex flex-col items-center gap-3 mt-2">
              <p className="text-neutral-400 text-sm uppercase tracking-wide">Сохранить результат в таблицу рекордов</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Твоё имя"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  className="bg-neutral-800 text-white px-4 py-2 text-sm font-bold uppercase tracking-wide outline-none border border-neutral-600 focus:border-orange-500 w-40"
                />
                <button
                  onClick={() => playerName.trim() && saveRecord(playerName.trim(), raceFinishTimeRef.current)}
                  disabled={saving || !playerName.trim()}
                  className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-4 py-2 font-black uppercase tracking-wide text-sm transition-all"
                >
                  {saving ? "..." : "Сохранить"}
                </button>
              </div>
            </div>
          )}
          {nameSaved && <p className="text-green-400 font-bold text-sm uppercase tracking-wide">Результат сохранён!</p>}

          {/* Leaderboard */}
          <div className="w-full max-w-sm mt-2">
            <div className="flex justify-between items-center mb-2">
              <p className="text-neutral-400 text-xs uppercase tracking-widest">Таблица рекордов</p>
              <button onClick={fetchRecords} className="text-neutral-600 hover:text-orange-400 text-xs uppercase tracking-wide transition-colors">Обновить</button>
            </div>
            <div className="border border-neutral-800">
              {records.length === 0 ? (
                <p className="text-neutral-600 text-xs text-center py-4 uppercase">Пока нет рекордов</p>
              ) : records.map((r, i) => (
                <div key={i} className={`flex justify-between items-center px-4 py-2 border-b border-neutral-800 last:border-0 ${i === 0 ? "bg-orange-500/10" : ""}`}>
                  <span className="text-neutral-500 text-xs w-6">{i + 1}</span>
                  <span className="text-white font-bold text-sm flex-1 uppercase">{r.player_name}</span>
                  <span className={`font-black text-sm tabular-nums ${i === 0 ? "text-orange-400" : "text-neutral-300"}`}>{formatTime(r.finish_time_ms)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={restart}
            className="bg-orange-500 hover:bg-orange-400 text-white px-10 py-3 font-black uppercase tracking-widest text-base transition-all mt-2"
          >
            Снова!
          </button>
        </div>
      )}

      {/* Touch controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 md:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onTouchStart={() => handleTouch("ArrowLeft", true)}
              onTouchEnd={() => handleTouch("ArrowLeft", false)}
              className="bg-white/20 active:bg-white/40 text-white w-14 h-14 text-xl font-bold rounded"
            >◀</button>
            <button
              onTouchStart={() => handleTouch("ArrowRight", true)}
              onTouchEnd={() => handleTouch("ArrowRight", false)}
              className="bg-white/20 active:bg-white/40 text-white w-14 h-14 text-xl font-bold rounded"
            >▶</button>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            onTouchStart={() => handleTouch("ArrowUp", true)}
            onTouchEnd={() => handleTouch("ArrowUp", false)}
            className="bg-orange-500/80 active:bg-orange-400 text-white w-16 h-16 text-xl font-bold rounded"
          >▲</button>
          <button
            onTouchStart={() => handleTouch("ArrowDown", true)}
            onTouchEnd={() => handleTouch("ArrowDown", false)}
            className="bg-white/20 active:bg-white/40 text-white w-16 h-16 text-xl font-bold rounded"
          >▼</button>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neutral-500 text-xs uppercase tracking-widest hidden md:block">
        ← → разгон · ↑ газ · ↓ тормоз
      </div>

      {/* Records button */}
      <button
        onClick={() => { fetchRecords(); setShowRecords(v => !v); }}
        className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-neutral-400 hover:text-orange-400 px-3 py-2 text-xs uppercase tracking-widest transition-colors"
        style={{ display: display.started && !display.finished ? "none" : undefined }}
      >
        🏆 Рекорды
      </button>

      {/* Records panel */}
      {showRecords && !display.finished && (
        <div className="absolute top-0 right-0 h-full w-72 bg-black/95 border-l border-neutral-800 flex flex-col p-4 z-20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-black uppercase tracking-wide text-sm">Таблица рекордов</span>
            <button onClick={() => setShowRecords(false)} className="text-neutral-500 hover:text-white text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {records.length === 0 ? (
              <p className="text-neutral-600 text-xs text-center py-8 uppercase">Пока нет рекордов</p>
            ) : records.map((r, i) => (
              <div key={i} className={`flex justify-between items-center px-2 py-3 border-b border-neutral-800 ${i === 0 ? "bg-orange-500/10" : ""}`}>
                <span className="text-neutral-500 text-xs w-5">{i + 1}</span>
                <span className="text-white font-bold text-sm flex-1 uppercase">{r.player_name}</span>
                <span className={`font-black text-sm tabular-nums ${i === 0 ? "text-orange-400" : "text-neutral-300"}`}>{formatTime(r.finish_time_ms)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
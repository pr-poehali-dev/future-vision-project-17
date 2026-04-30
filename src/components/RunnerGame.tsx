import { useEffect, useRef, useState } from "react";

const W = 480;
const H = 640;
const LANES = [W / 4, W / 2, (3 * W) / 4];
const GROUND = H - 80;
const PLAYER_W = 36;
const PLAYER_H = 56;
const OBS_W = 38;
const OBS_H = 52;
const COIN_R = 12;

interface Obstacle {
  x: number;
  y: number;
  lane: number;
  type: "barrier" | "train";
}

interface Coin {
  x: number;
  y: number;
  lane: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<"idle" | "playing" | "dead">("idle");
  const phaseRef = useRef<"idle" | "playing" | "dead">("idle");
  const animRef = useRef<number>(0);

  const state = useRef({
    lane: 1,
    targetLane: 1,
    x: LANES[1],
    y: GROUND - PLAYER_H,
    vy: 0,
    onGround: true,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    particles: [] as Particle[],
    score: 0,
    best: 0,
    speed: 4,
    frame: 0,
    spawnTimer: 0,
    coinTimer: 0,
    legPhase: 0,
    sliding: false,
    slideTimer: 0,
    dead: false,
    bgOffset: 0,
    fgOffset: 0,
  });

  function spawnParticles(x: number, y: number, color: string, n = 8) {
    for (let i = 0; i < n; i++) {
      state.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 4 + 1),
        life: 1,
        color,
      });
    }
  }

  function jump() {
    const s = state.current;
    if (s.dead) return;
    if (phaseRef.current === "idle" || phaseRef.current === "dead") {
      startGame();
      return;
    }
    if (s.onGround) {
      s.vy = -15;
      s.onGround = false;
    }
  }

  function slide() {
    const s = state.current;
    if (s.dead || !s.onGround) return;
    s.sliding = true;
    s.slideTimer = 40;
  }

  function moveLeft() {
    const s = state.current;
    if (s.dead) return;
    if (phaseRef.current !== "playing") { startGame(); return; }
    if (s.targetLane > 0) s.targetLane--;
  }

  function moveRight() {
    const s = state.current;
    if (s.dead) return;
    if (phaseRef.current !== "playing") { startGame(); return; }
    if (s.targetLane < 2) s.targetLane++;
  }

  function startGame() {
    const s = state.current;
    s.lane = 1; s.targetLane = 1;
    s.x = LANES[1]; s.y = GROUND - PLAYER_H;
    s.vy = 0; s.onGround = true;
    s.obstacles = []; s.coins = []; s.particles = [];
    s.score = 0; s.speed = 4; s.frame = 0;
    s.spawnTimer = 0; s.coinTimer = 0;
    s.sliding = false; s.slideTimer = 0;
    s.dead = false; s.bgOffset = 0; s.fgOffset = 0;
    phaseRef.current = "playing";
    setPhase("playing");
    setScore(0);
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Key handler
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") jump();
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") slide();
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft();
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight();
    };
    window.addEventListener("keydown", onKey);

    function drawBackground() {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      grad.addColorStop(0, "#0f0c29");
      grad.addColorStop(1, "#302b63");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H * 0.6);

      // Moving buildings bg
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, H * 0.3, W, H * 0.3);

      // Neon building silhouettes
      const bldColors = ["#ff006630", "#00ffff20", "#ff990020"];
      for (let i = 0; i < 8; i++) {
        const bx = ((i * 80 - state.current.bgOffset * 0.3) % (W + 80) + W + 80) % (W + 80) - 80;
        const bh = 80 + (i * 37) % 120;
        ctx.fillStyle = "#0d0d1a";
        ctx.fillRect(bx, H * 0.6 - bh, 60, bh);
        ctx.strokeStyle = bldColors[i % 3];
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, H * 0.6 - bh, 60, bh);
      }

      // Ground platform
      const groundGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      groundGrad.addColorStop(0, "#1a0533");
      groundGrad.addColorStop(1, "#0d0d0d");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      // Track lanes
      for (let l = 0; l < 3; l++) {
        const lx = LANES[l];
        ctx.strokeStyle = "#ffffff08";
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.moveTo(lx, H * 0.6);
        ctx.lineTo(lx, H);
        ctx.stroke();
      }

      // Moving lane lines
      ctx.strokeStyle = "#ffffff20";
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      for (let l = 0; l < 2; l++) {
        const lx = LANES[l] + (LANES[1] - LANES[0]) / 2;
        ctx.beginPath();
        ctx.moveTo(lx, H * 0.6);
        ctx.lineTo(lx, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Moving floor tiles
      ctx.strokeStyle = "#ff00ff15";
      ctx.lineWidth = 1;
      const tileSize = 60;
      const off = state.current.fgOffset % tileSize;
      for (let ty = H * 0.6; ty < H; ty += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, ty + off);
        ctx.lineTo(W, ty + off);
        ctx.stroke();
      }
    }

    function drawPlayer() {
      const s = state.current;
      const x = s.x;
      const ph = s.sliding ? PLAYER_H / 2 : PLAYER_H;
      const y = s.y + (s.sliding ? PLAYER_H / 2 : 0);

      ctx.save();

      // Glow
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 20;

      // Body
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.roundRect(x - PLAYER_W / 2, y, PLAYER_W, ph * 0.6, 6);
      ctx.fill();

      // Head
      if (!s.sliding) {
        ctx.fillStyle = "#fdba74";
        ctx.beginPath();
        ctx.arc(x, y - 8, 14, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#1f2937";
        ctx.beginPath();
        ctx.arc(x - 5, y - 10, 3, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Legs
      if (s.onGround && !s.sliding) {
        const legAnim = Math.sin(s.legPhase) * 10;
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(x - 12, y + ph * 0.6, 10, 14 + legAnim);
        ctx.fillRect(x + 2, y + ph * 0.6, 10, 14 - legAnim);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawObstacle(obs: Obstacle) {
      ctx.save();
      if (obs.type === "barrier") {
        // Barrier
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(obs.x - OBS_W / 2, obs.y, OBS_W, 8);
        ctx.fillRect(obs.x - OBS_W / 2, obs.y + OBS_H - 8, OBS_W, 8);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(obs.x - 4, obs.y, 8, OBS_H);
        // Warning stripes
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(obs.x - OBS_W / 2 + i * 10, obs.y);
          ctx.lineTo(obs.x - OBS_W / 2 + i * 10 + 8, obs.y + OBS_H);
          ctx.stroke();
        }
      } else {
        // Train / block
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.roundRect(obs.x - OBS_W / 2, obs.y, OBS_W, OBS_H, 4);
        ctx.fill();
        ctx.fillStyle = "#a78bfa";
        ctx.fillRect(obs.x - OBS_W / 2 + 4, obs.y + 8, OBS_W - 8, 12);
        ctx.fillRect(obs.x - OBS_W / 2 + 4, obs.y + 30, OBS_W - 8, 12);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawCoin(coin: Coin) {
      if (coin.collected) return;
      ctx.save();
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, COIN_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(coin.x - 3, coin.y - 3, COIN_R * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawParticles() {
      state.current.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawHUD() {
      const s = state.current;
      // Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${Math.floor(s.score)}`, 16, 40);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("ОЧКИ", 16, 56);

      // Best
      ctx.textAlign = "right";
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`${Math.floor(s.best)}`, W - 16, 40);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("РЕКОРД", W - 16, 56);

      // Speed bar
      const spd = Math.min((s.speed - 4) / 10, 1);
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(W / 2 - 50, 16, 100, 8);
      const barGrad = ctx.createLinearGradient(W / 2 - 50, 0, W / 2 + 50, 0);
      barGrad.addColorStop(0, "#22c55e");
      barGrad.addColorStop(1, "#ef4444");
      ctx.fillStyle = barGrad;
      ctx.fillRect(W / 2 - 50, 16, 100 * spd, 8);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.fillText("СКОРОСТЬ", W / 2, 38);
    }

    function loop() {
      const s = state.current;
      ctx.clearRect(0, 0, W, H);
      drawBackground();

      if (phaseRef.current === "idle") {
        // Idle screen
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 48px monospace";
        ctx.fillText("NEON", W / 2, H / 2 - 60);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px monospace";
        ctx.fillText("RUNNER", W / 2, H / 2 - 10);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "16px monospace";
        ctx.fillText("Нажми пробел или тап", W / 2, H / 2 + 40);
        ctx.fillText("← → уклон  ↑ прыжок  ↓ слайд", W / 2, H / 2 + 65);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      if (phaseRef.current === "dead") {
        s.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.03;
        });
        s.particles = s.particles.filter(p => p.life > 0);
        s.obstacles.forEach(o => { o.y += s.speed; });
        s.coins.forEach(c => { c.y += s.speed; });
        s.obstacles.forEach(o => drawObstacle(o));
        s.coins.forEach(c => drawCoin(c));
        drawParticles();

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 42px monospace";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 50);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px monospace";
        ctx.fillText(`${Math.floor(s.score)}`, W / 2, H / 2);
        ctx.fillStyle = "#facc15";
        ctx.font = "16px monospace";
        ctx.fillText(`Рекорд: ${Math.floor(s.best)}`, W / 2, H / 2 + 35);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "14px monospace";
        ctx.fillText("Нажми пробел или тап для рестарта", W / 2, H / 2 + 70);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      // === PLAYING ===
      s.frame++;
      s.bgOffset += s.speed * 0.5;
      s.fgOffset += s.speed;
      s.score += s.speed * 0.05;
      s.speed = Math.min(4 + s.score * 0.008, 16);
      if (s.score > s.best) { s.best = s.score; setBest(Math.floor(s.best)); }

      // Lane movement
      const targetX = LANES[s.targetLane];
      s.x += (targetX - s.x) * 0.18;

      // Gravity
      s.vy += 0.7;
      s.y += s.vy;
      if (s.y >= GROUND - PLAYER_H) {
        s.y = GROUND - PLAYER_H;
        s.vy = 0;
        s.onGround = true;
      } else {
        s.onGround = false;
      }

      // Slide timer
      if (s.sliding) {
        s.slideTimer--;
        if (s.slideTimer <= 0) s.sliding = false;
      }

      // Leg animation
      if (s.onGround) s.legPhase += 0.25;

      // Spawn obstacles
      s.spawnTimer--;
      if (s.spawnTimer <= 0) {
        const usedLanes = new Set<number>();
        const count = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          let lane;
          do { lane = Math.floor(Math.random() * 3); } while (usedLanes.has(lane));
          usedLanes.add(lane);
          s.obstacles.push({
            x: LANES[lane],
            y: -OBS_H,
            lane,
            type: Math.random() < 0.5 ? "barrier" : "train",
          });
        }
        s.spawnTimer = Math.max(40, 90 - s.speed * 3);
      }

      // Spawn coins
      s.coinTimer--;
      if (s.coinTimer <= 0) {
        const lane = Math.floor(Math.random() * 3);
        for (let i = 0; i < 5; i++) {
          s.coins.push({ x: LANES[lane], y: -i * 50 - COIN_R, lane, collected: false });
        }
        s.coinTimer = 60;
      }

      // Move obstacles & coins
      s.obstacles.forEach(o => { o.y += s.speed; });
      s.coins.forEach(c => { c.y += s.speed; });
      s.obstacles = s.obstacles.filter(o => o.y < H + OBS_H);
      s.coins = s.coins.filter(c => c.y < H + COIN_R);

      // Collision: obstacles
      const ph = s.sliding ? PLAYER_H / 2 : PLAYER_H;
      const py = s.y + (s.sliding ? PLAYER_H / 2 : 0);
      for (const obs of s.obstacles) {
        const dx = Math.abs(s.x - obs.x);
        const dy = Math.abs((py + ph / 2) - (obs.y + OBS_H / 2));
        if (dx < (PLAYER_W + OBS_W) / 2 - 8 && dy < (ph + OBS_H) / 2 - 8) {
          spawnParticles(s.x, s.y, "#f97316", 20);
          s.dead = true;
          phaseRef.current = "dead";
          setPhase("dead");
          break;
        }
      }

      // Collision: coins
      s.coins.forEach(c => {
        if (c.collected) return;
        const dx = Math.abs(s.x - c.x);
        const dy = Math.abs(s.y + PLAYER_H / 2 - c.y);
        if (dx < PLAYER_W / 2 + COIN_R && dy < PLAYER_H / 2 + COIN_R) {
          c.collected = true;
          s.score += 10;
          spawnParticles(c.x, c.y, "#facc15", 6);
        }
      });

      // Particles
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04;
      });
      s.particles = s.particles.filter(p => p.life > 0);

      // Draw
      s.obstacles.forEach(o => drawObstacle(o));
      s.coins.forEach(c => drawCoin(c));
      drawParticles();
      drawPlayer();
      drawHUD();

      setScore(Math.floor(s.score));
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) { jump(); return; }
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -20) moveLeft();
      else if (dx > 20) moveRight();
    } else {
      if (dy < -20) jump();
      else if (dy > 20) slide();
    }
    touchStart.current = null;
  };

  return (
    <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center select-none">
      <div className="relative" style={{ width: W, maxWidth: "100%", aspectRatio: `${W}/${H}` }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={jump}
        />
        {/* Mobile buttons */}
        {phase === "playing" && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 md:hidden pointer-events-none">
            <button
              className="pointer-events-auto bg-white/10 active:bg-white/30 text-white w-14 h-14 text-xl rounded-full"
              onTouchStart={e => { e.stopPropagation(); moveLeft(); }}
            >◀</button>
            <div className="flex gap-3">
              <button
                className="pointer-events-auto bg-orange-500/80 active:bg-orange-400 text-white w-14 h-14 text-xl rounded-full font-bold"
                onTouchStart={e => { e.stopPropagation(); jump(); }}
              >↑</button>
              <button
                className="pointer-events-auto bg-white/10 active:bg-white/30 text-white w-14 h-14 text-xl rounded-full"
                onTouchStart={e => { e.stopPropagation(); slide(); }}
              >↓</button>
            </div>
            <button
              className="pointer-events-auto bg-white/10 active:bg-white/30 text-white w-14 h-14 text-xl rounded-full"
              onTouchStart={e => { e.stopPropagation(); moveRight(); }}
            >▶</button>
          </div>
        )}
      </div>
    </div>
  );
}
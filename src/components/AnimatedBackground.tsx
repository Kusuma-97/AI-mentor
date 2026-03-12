import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useCallback, useMemo } from "react";

/* ─── Floating Orb ─── */
function FloatingOrb({
  size, x, y, color, duration, delay,
}: {
  size: number; x: string; y: string; color: string; duration: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, hsl(${color} / 0.25) 0%, hsl(${color} / 0) 70%)`,
      }}
      animate={{
        x: [0, 30, -20, 15, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.15, 0.95, 1.08, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Grid Pattern ─── */
function GridPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* ─── Floating Particles ─── */
function Particles() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }))
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20 pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ─── Shooting Stars ─── */
function ShootingStars() {
  const [stars] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      startX: Math.random() * 60,
      startY: Math.random() * 40,
      angle: 30 + Math.random() * 30,
      duration: 1.5 + Math.random() * 1.5,
      delay: i * 4 + Math.random() * 3,
      length: 80 + Math.random() * 120,
    }))
  );

  return (
    <>
      {stars.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * s.length;
        const dy = Math.sin(rad) * s.length;
        return (
          <motion.div
            key={s.id}
            className="absolute pointer-events-none"
            style={{
              left: `${s.startX}%`,
              top: `${s.startY}%`,
              width: s.length,
              height: 2,
              borderRadius: 1,
              background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)`,
              transformOrigin: "0 50%",
              rotate: `${s.angle}deg`,
            }}
            animate={{
              x: [0, dx],
              y: [0, dy],
              opacity: [0, 1, 1, 0],
              scaleX: [0, 1, 1, 0.3],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              repeatDelay: 8 + Math.random() * 6,
              ease: "easeOut",
            }}
          />
        );
      })}
    </>
  );
}

/* ─── Pulsing Rings ─── */
function PulsingRings() {
  const rings = useMemo(
    () => [
      { x: "20%", y: "30%", size: 200, delay: 0, color: "var(--primary)" },
      { x: "75%", y: "20%", size: 160, delay: 3, color: "var(--accent)" },
      { x: "50%", y: "70%", size: 180, delay: 6, color: "var(--gradient-end)" },
    ],
    []
  );

  return (
    <>
      {rings.map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x, top: r.y,
            width: r.size, height: r.size,
            border: `1px solid hsl(${r.color} / 0.15)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 2.5, 3],
            opacity: [0.4, 0.15, 0],
          }}
          transition={{
            duration: 4,
            delay: r.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

/* ─── Floating Geometric Shapes ─── */
function FloatingShapes() {
  const [shapes] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 8 + Math.random() * 16,
      rotation: Math.random() * 360,
      duration: 12 + Math.random() * 10,
      delay: Math.random() * 5,
      type: i % 3, // 0=square, 1=triangle, 2=diamond
    }))
  );

  return (
    <>
      {shapes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            border: `1px solid hsl(var(--primary) / 0.1)`,
            borderRadius: s.type === 0 ? "2px" : s.type === 2 ? "2px" : "0",
            rotate: s.type === 2 ? "45deg" : `${s.rotation}deg`,
            clipPath: s.type === 1 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 5, 0],
            rotate: s.type === 2
              ? [45, 135, 225, 315, 405]
              : [s.rotation, s.rotation + 90, s.rotation + 180, s.rotation + 270, s.rotation + 360],
            opacity: [0.15, 0.3, 0.15, 0.25, 0.15],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ─── Connecting Dots (Constellation) ─── */
function ConstellationDots() {
  const [dots] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      cx: 15 + Math.random() * 70,
      cy: 15 + Math.random() * 70,
    }))
  );

  // Create lines between nearby dots
  const lines = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number; id: string }[] = [];
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].cx - dots[j].cx;
        const dy = dots[i].cy - dots[j].cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 35) {
          result.push({
            x1: dots[i].cx, y1: dots[i].cy,
            x2: dots[j].cx, y2: dots[j].cy,
            id: `${i}-${j}`,
          });
        }
      }
    }
    return result;
  }, [dots]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {lines.map((l) => (
        <motion.line
          key={l.id}
          x1={`${l.x1}%`} y1={`${l.y1}%`}
          x2={`${l.x2}%`} y2={`${l.y2}%`}
          stroke="hsl(var(--primary) / 0.06)"
          strokeWidth="1"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {dots.map((d) => (
        <motion.circle
          key={d.id}
          cx={`${d.cx}%`} cy={`${d.cy}%`}
          r="2"
          fill="hsl(var(--primary) / 0.15)"
          animate={{ r: [1.5, 3, 1.5], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
        />
      ))}
    </svg>
  );
}

/* ─── Mouse-Reactive Glow ─── */
function MouseGlow() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 30 });
  const glowX = useTransform(springX, (v) => v - 175);
  const glowY = useTransform(springY, (v) => v - 175);

  // Secondary trailing glow
  const trailX = useSpring(mouseX, { stiffness: 40, damping: 40 });
  const trailY = useSpring(mouseY, { stiffness: 40, damping: 40 });
  const trailGlowX = useTransform(trailX, (v) => v - 120);
  const trailGlowY = useTransform(trailY, (v) => v - 120);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Primary glow */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          left: glowX, top: glowY,
          width: 350, height: 350,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      {/* Trailing accent glow */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          left: trailGlowX, top: trailGlowY,
          width: 240, height: 240,
          background: "radial-gradient(circle, hsl(var(--accent) / 0.05) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
    </>
  );
}

/* ─── Aurora Wave ─── */
function AuroraWave() {
  return (
    <motion.div
      className="absolute inset-x-0 top-0 h-[40%] pointer-events-none overflow-hidden opacity-30"
      style={{
        background: `linear-gradient(180deg, 
          hsl(var(--gradient-start) / 0.08) 0%, 
          hsl(var(--accent) / 0.04) 40%, 
          transparent 100%)`,
      }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 50%", "0% 0%"],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--gradient-end) / 0.1), transparent)`,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <AuroraWave />
      <GridPattern />

      <FloatingOrb size={500} x="-5%" y="-10%" color="var(--gradient-start)" duration={12} delay={0} />
      <FloatingOrb size={400} x="70%" y="60%" color="var(--gradient-end)" duration={14} delay={2} />
      <FloatingOrb size={350} x="40%" y="-20%" color="var(--accent)" duration={10} delay={1} />
      <FloatingOrb size={300} x="10%" y="70%" color="var(--primary)" duration={16} delay={3} />

      <ConstellationDots />
      <FloatingShapes />
      <PulsingRings />
      <ShootingStars />
      <Particles />
      <MouseGlow />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}

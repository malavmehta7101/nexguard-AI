import { useEffect, useRef } from "react";

export default function MatrixRain({ opacity = 0.18 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CHARS = "01アイウエオカキクケコサシスセソABCDEF0123456789<>{}|\\[];:!@#$%^&*";
    const FS = 13;
    let cols, drops, animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols  = Math.floor(canvas.width / FS);
      drops = Array(cols).fill(1);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.fillStyle = "rgba(1,5,10,0.055)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const bright = Math.random() > 0.93;
        ctx.font = `${FS}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = bright ? "rgba(0,232,122,0.95)" : "rgba(0,232,122,0.2)";
        ctx.fillText(ch, i * FS, y * FS);
        if (y * FS > canvas.height && Math.random() > 0.976) drops[i] = 0;
        drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    };

    const interval = setInterval(() => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(draw);
    }, 50);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
    />
  );
}

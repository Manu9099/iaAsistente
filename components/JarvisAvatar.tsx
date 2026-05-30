"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
}

export default function JarvisAvatar({ isSpeaking, isListening, isThinking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frameRef.current += 0.05;
      const t = frameRef.current;

      const rings = [
        { r: 55, width: 1.5, speed: 0.3, color: "#00b4ff22" },
        { r: 45, width: 1, speed: -0.5, color: "#00b4ff44" },
        { r: 35, width: 1.5, speed: 0.7, color: "#00b4ff66" },
      ];

      rings.forEach(ring => {
        const pulse = isSpeaking
          ? ring.r + Math.sin(t * ring.speed * 10) * 6
          : isListening
          ? ring.r + Math.sin(t * ring.speed * 6) * 3
          : ring.r + Math.sin(t * ring.speed) * 1.5;

        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.stroke();
      });

      const bars = 32;
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const noise = isSpeaking
          ? Math.abs(Math.sin(t * 8 + i * 0.8)) * 18
          : isListening
          ? Math.abs(Math.sin(t * 4 + i * 0.5)) * 8
          : Math.abs(Math.sin(t + i * 0.3)) * 3;

        const inner = 28;
        const outer = inner + noise;

        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * outer;
        const y2 = cy + Math.sin(angle) * outer;

        const alpha = isSpeaking ? 0.9 : isListening ? 0.6 : 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#040c14";
      ctx.fill();
      ctx.strokeStyle = "#00b4ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const iconSize = 12;
      ctx.fillStyle = "#00b4ff";
      ctx.font = `${iconSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        isSpeaking ? "◈" : isListening ? "◉" : isThinking ? "◌" : "◇",
        cx, cy
      );

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking, isListening, isThinking]);

  const statusText = isSpeaking
    ? "HABLANDO"
    : isListening
    ? "ESCUCHANDO"
    : isThinking
    ? "PROCESANDO"
    : "ESPERANDO COMANDO";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 0 10px",
      borderBottom: "0.5px solid #0d3a5a",
      background: "#040c14",
    }}>
      <motion.div
        animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
      >
        <canvas
          ref={canvasRef}
          width={140}
          height={140}
          style={{ display: "block" }}
        />
      </motion.div>
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "9px",
        letterSpacing: "3px",
        color: isSpeaking ? "#00b4ff" : isListening ? "#00ff88" : "#3a7fa0",
        marginTop: "8px",
      }}>
        {statusText}
      </div>
    </div>
  );
}
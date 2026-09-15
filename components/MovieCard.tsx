"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import Image from "next/image";

export type Movie = {
  id: number;
  title: string;
  year?: number;
  rating?: string;
  genre?: string;
  poster: string;
};

export default function MovieCard({ movie }: { movie: Movie }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 25,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  return (
    <Link href={`/movies/${movie.id}`}>
      <div
        className="relative w-full flex-shrink-0"
        style={{ perspective: 800 }}
      >
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative aspect-[2/3] cursor-pointer border border-white/10 bg-navy-light transition-colors duration-200"
        >
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="190px"
            className="object-cover"
          />

          {/* neon outline on hover */}
          <div
            className={`pointer-events-none absolute inset-0 border transition-all duration-200 ${
              hovered
                ? "border-cyan shadow-glow-cyan-lg"
                : "border-transparent"
            }`}
          />

          {/* base gradient + title, always visible */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/60 to-transparent p-3 pt-8">
            <p className="font-display text-sm font-medium leading-tight text-white">
              {movie.title}
            </p>
          </div>

          {/* quick info popup */}
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.15 }}
            style={{ transform: "translateZ(30px)" }}
            className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-cyan/40 bg-navy/95 p-3 backdrop-blur-sm"
          >
            <p className="font-display text-sm font-semibold text-white">
              {movie.title}
            </p>
            <div className="flex items-center gap-2 font-mono text-[10px] text-white/60">
              <span className="flex items-center gap-1 text-cyan">
                <Star className="h-3 w-3 fill-cyan" /> {movie.rating}
              </span>
              <span>{movie.year}</span>
              <span>·</span>
              <span>{movie.genre}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex h-7 w-7 items-center justify-center border border-cyan/60 text-cyan transition-all hover:bg-cyan hover:text-navy hover:shadow-glow-cyan"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex h-7 w-7 items-center justify-center border border-white/30 text-white transition-all hover:border-magenta hover:text-magenta hover:shadow-glow-magenta"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Link>
  );
}

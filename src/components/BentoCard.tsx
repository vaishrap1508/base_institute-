'use client';

import React, { useRef, useState, useEffect } from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delayIndex?: number;
}

export default function BentoCard({ children, className = '', delayIndex = 0 }: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Coordinates normalized from -0.5 to 0.5 for tilt depth
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Pixel coordinates relative to the card size for spotlight
    const glowX = e.clientX - rect.left;
    const glowY = e.clientY - rect.top;

    setCoords({ x, y });
    
    cardRef.current.style.setProperty('--mouse-x', `${glowX}px`);
    cardRef.current.style.setProperty('--mouse-y', `${glowY}px`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const animationDelay = delayIndex * 150;

  const tiltStyle = isHovered
    ? {
        transform: `perspective(1000px) rotateX(${-coords.y * 10}deg) rotateY(${coords.x * 10}deg) translateY(-4px)`,
        transitionProperty: 'transform, box-shadow',
        transitionDuration: '0.12s, 0.2s',
        transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1), ease',
      }
    : {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transitionProperty: 'transform, box-shadow',
        transitionDuration: '0.5s, 0.3s',
        transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1), ease',
      };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...tiltStyle,
        transitionDelay: isVisible ? `${animationDelay}ms, ${animationDelay}ms` : '0ms, 0ms',
      }}
      className={`
        relative overflow-hidden rounded-[24px] border border-slate-200/50 dark:border-slate-800/80
        bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
        shadow-sm hover:shadow-2xl hover:border-blue-500/30 dark:hover:border-blue-400/20
        transition-all duration-500 group
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        ${className}
      `}
    >
      {/* Subtle overlay glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(37, 99, 235, 0.05), transparent 80%)`
        }}
      />
      {/* Spotlight Border Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 rounded-[24px] border border-transparent"
        style={{
          backgroundImage: `radial-gradient(150px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(37, 99, 235, 0.25), transparent 100%)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'border-box',
        }}
      />
      
      {/* Card Content Wrapper */}
      <div className="relative z-20 h-full w-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

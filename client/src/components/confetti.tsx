import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const defaultColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#ffeaa7', '#fd79a8', '#fdcb6e', '#6c5ce7',
  '#a29bfe', '#fd79a8', '#00b894', '#e17055'
];

export function Confetti({ 
  isActive, 
  duration = 3000, 
  particleCount = 150,
  colors = defaultColors,
  onComplete 
}: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive && !isAnimating) {
      startConfetti();
    }
  }, [isActive]);

  const createParticle = (id: number): ConfettiPiece => {
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    };
  };

  const startConfetti = () => {
    setIsAnimating(true);
    const newParticles = Array.from({ length: particleCount }, (_, i) => createParticle(i));
    setParticles(newParticles);

    const animationFrame = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vy: particle.vy + 0.3, // gravity
        })).filter(particle => particle.y < window.innerHeight + 100)
      );
    };

    const animationId = setInterval(animationFrame, 16);

    setTimeout(() => {
      clearInterval(animationId);
      setParticles([]);
      setIsAnimating(false);
      onComplete?.();
    }, duration);
  };

  const renderParticle = (particle: ConfettiPiece) => {
    const style = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none' as const,
      zIndex: 9999,
    };

    if (particle.shape === 'circle') {
      return (
        <div
          key={particle.id}
          style={{
            ...style,
            borderRadius: '50%',
          }}
        />
      );
    } else if (particle.shape === 'square') {
      return (
        <div
          key={particle.id}
          style={style}
        />
      );
    } else {
      return (
        <div
          key={particle.id}
          style={{
            ...style,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderLeft: `${particle.size / 2}px solid transparent`,
            borderRight: `${particle.size / 2}px solid transparent`,
            borderBottom: `${particle.size}px solid ${particle.color}`,
          }}
        />
      );
    }
  };

  if (!isAnimating || particles.length === 0) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map(renderParticle)}
    </div>,
    document.body
  );
}

// Hook for easy confetti usage
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = () => {
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
  };

  return {
    trigger,
    ConfettiComponent: () => (
      <Confetti 
        isActive={isActive} 
        onComplete={handleComplete}
      />
    )
  };
}

// Success-specific confetti with enhanced colors
export function SuccessConfetti({ 
  isActive, 
  onComplete 
}: { 
  isActive: boolean; 
  onComplete?: () => void; 
}) {
  const successColors = [
    '#00b894', '#00cec9', '#6c5ce7', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff',
    '#55a3ff', '#26de81', '#2d3436', '#00b894'
  ];

  return (
    <Confetti
      isActive={isActive}
      duration={4000}
      particleCount={200}
      colors={successColors}
      onComplete={onComplete}
    />
  );
}
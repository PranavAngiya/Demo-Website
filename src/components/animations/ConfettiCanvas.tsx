import { useEffect, useRef } from 'react';

interface Confetti {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  velocity: { x: number; y: number };
  size: number;
  color: string;
  opacity: number;
}

interface ConfettiCanvasProps {
  active?: boolean;
  duration?: number;
  onComplete?: () => void;
}

const ConfettiCanvas = ({ active = false, duration = 3000, onComplete }: ConfettiCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // CFS brand colors
    const colors = [
      '#D81421', // CFS Red
      '#005847', // CFS Teal
      '#FFD700', // Gold
      '#FF6B9D', // Pink
      '#4ECDC4', // Cyan
      '#95E1D3'  // Mint
    ];

    // Create confetti pieces
    const createConfetti = (): Confetti[] => {
      const pieces: Confetti[] = [];
      const count = 150;

      for (let i = 0; i < count; i++) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * canvas.height,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 3 + 2
          },
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1
        });
      }

      return pieces;
    };

    confettiRef.current = createConfetti();
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw confetti
      confettiRef.current.forEach((piece) => {
        // Update position
        piece.x += piece.velocity.x;
        piece.y += piece.velocity.y;
        piece.rotation += piece.rotationSpeed;

        // Add gravity
        piece.velocity.y += 0.1;

        // Fade out near end
        if (progress > 0.7) {
          piece.opacity = 1 - (progress - 0.7) / 0.3;
        }

        // Draw confetti piece
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.globalAlpha = piece.opacity;
        ctx.fillStyle = piece.color;

        // Draw as rectangle with rounded corners
        const halfSize = piece.size / 2;
        ctx.fillRect(-halfSize, -halfSize, piece.size, piece.size);

        ctx.restore();
      });

      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (onComplete) {
          onComplete();
        }
      }
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ConfettiCanvas;

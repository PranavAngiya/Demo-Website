import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCanvasProps {
  active?: boolean;
  duration?: number;
  onComplete?: () => void;
}

const ConfettiCanvas = ({ active = false }: ConfettiCanvasProps) => {
  useEffect(() => {
    if (active) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [active]);

  return null; // No visible component, just triggers confetti effect
};

export default ConfettiCanvas;

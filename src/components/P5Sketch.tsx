import React from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5'; //Import this for typechecking and intellisense

interface Bubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: p5Types.Color;
}

const P5Sketch: React.FC = () => {
  let bubbles: Bubble[] = [];
  const bubbleColors: string[] = ['#FF5E00', '#3B82F6', '#FFFFFF', '#22C55E']; // Orange, Blue, White, Green

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.noStroke();
    for (let i = 0; i < 20; i++) { // Create 20 bubbles
      const r = p5.random(20, 60);
      const x = p5.random(r, p5.width - r);
      const y = p5.random(r, p5.height - r);
      const vx = p5.random(-0.5, 0.5);
      const vy = p5.random(-0.5, 0.5);
      const c = p5.color(p5.random(bubbleColors));
      c.setAlpha(p5.random(50, 150)); // Semi-transparent bubbles
      bubbles.push({ x, y, r, vx, vy, color: c });
    }
  };

  const draw = (p5: p5Types) => {
    p5.clear(); // Use clear() for transparent background if sketch is an overlay
    // Or p5.background(17, 24, 39, 10); // bg-gray-900 with some transparency if it's a full background
    
    for (let bubble of bubbles) {
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      if (bubble.x - bubble.r < 0 || bubble.x + bubble.r > p5.width) {
        bubble.vx *= -1;
      }
      if (bubble.y - bubble.r < 0 || bubble.y + bubble.r > p5.height) {
        bubble.vy *= -1;
      }

      p5.fill(bubble.color);
      p5.ellipse(bubble.x, bubble.y, bubble.r * 2);
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
     // Reinitialize bubbles or adjust their positions if needed on resize
    bubbles = []; // Simple reset, could be more sophisticated
    for (let i = 0; i < 20; i++) {
      const r = p5.random(20, 60);
      const x = p5.random(r, p5.width - r);
      const y = p5.random(r, p5.height - r);
      const vx = p5.random(-0.5, 0.5);
      const vy = p5.random(-0.5, 0.5);
      const c = p5.color(p5.random(bubbleColors));
      c.setAlpha(p5.random(50, 150));
      bubbles.push({ x, y, r, vx, vy, color: c });
    }
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} className="fixed top-0 left-0 w-full h-full z-[-1]" />;
};

export default P5Sketch;
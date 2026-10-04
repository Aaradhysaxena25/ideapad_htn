import { useEffect, useState } from 'react';

export function Starfield() {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="starfield">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

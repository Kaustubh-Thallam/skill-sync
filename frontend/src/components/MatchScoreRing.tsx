import { useEffect, useRef } from "react";

interface MatchScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const MatchScoreRing = ({
  score,
  size = 120,
  strokeWidth = 8,
}: MatchScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const circleRef = useRef<SVGCircleElement>(null);

  const color =
    score >= 80
      ? "hsl(var(--success))"
      : score >= 50
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = "stroke-dashoffset 1s ease-out";
          circleRef.current.style.strokeDashoffset = String(offset);
        }
      });
    }
  }, [circumference, offset]);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-2xl font-bold font-heading">
        {Number(score).toFixed(2)}%
      </span>
    </div>
  );
};

export default MatchScoreRing;

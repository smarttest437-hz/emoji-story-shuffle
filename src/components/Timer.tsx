import React, { useEffect, useRef } from 'react';
import { formatTime } from '../lib/utils';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  maxSeconds: number;
  selectedDuration: 90 | 180 | 300;
  onDurationChange: (duration: 90 | 180 | 300) => void;
  onTick: () => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const DURATIONS: { value: 90 | 180 | 300; label: string }[] = [
  { value: 90,  label: '90s'   },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];

export const Timer: React.FC<TimerProps> = ({
  seconds,
  isRunning,
  maxSeconds,
  selectedDuration,
  onDurationChange,
  onTick,
  onStart,
  onPause,
  onReset,
}) => {
  const animationRef = useRef<number>();
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isRunning && seconds > 0) {
      const tick = () => {
        const now = Date.now();
        if (now - lastTickRef.current >= 1000) {
          lastTickRef.current = now;
          onTick();
        }
        animationRef.current = requestAnimationFrame(tick);
      };
      animationRef.current = requestAnimationFrame(tick);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isRunning, seconds, onTick]);

  const progress = (seconds / maxSeconds) * 100;
  const isWarning = seconds <= 10 && seconds > 0;
  const isExpired = seconds === 0;

  return (
    <div className="timer-container">
      <h3>Timer</h3>

      <div className="timer-display">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring-background"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
          />
          <circle
            className={`progress-ring-progress ${isWarning ? 'warning' : ''} ${isExpired ? 'expired' : ''}`}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className={`time-text ${isWarning ? 'warning' : ''} ${isExpired ? 'expired' : ''}`}>
          {formatTime(seconds)}
        </div>
      </div>

      <div
        className={`timer-pill${isRunning ? ' timer-pill--disabled' : ''}`}
        role="group"
        aria-label="Timer duration"
      >
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`timer-pill__option${selectedDuration === value ? ' timer-pill__option--active' : ''}`}
            onClick={() => onDurationChange(value)}
            disabled={isRunning}
            aria-pressed={selectedDuration === value}
            aria-label={`Set timer to ${label}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button
            className="btn btn-primary"
            onClick={onStart}
            disabled={seconds === 0}
            aria-label="Start timer"
          >
            ▶️ Start
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={onPause}
            aria-label="Pause timer"
          >
            ⏸️ Pause
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={onReset}
          aria-label="Reset timer"
        >
          🔄 Reset
        </button>
      </div>

      {isExpired && (
        <div className="timer-message" role="alert">
          ⏰ Time's up!
        </div>
      )}
    </div>
  );
};

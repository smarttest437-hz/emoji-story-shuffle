import React from 'react';

interface EmojiCardProps {
  emoji: string;
  index: number;
  locked: boolean;
  onToggleLock: (index: number) => void;
  animating?: boolean;
}

export const EmojiCard: React.FC<EmojiCardProps> = ({
  emoji,
  index,
  locked,
  onToggleLock,
  animating = false,
}) => {
  return (
    <div className={`emoji-card ${animating ? 'shuffling' : ''}`}>
      <div className="emoji-display" role="img" aria-label={`Emoji ${index + 1}: ${emoji}`}>
        {emoji}
      </div>
      <button
        className={`lock-button ${locked ? 'locked' : ''}`}
        onClick={() => onToggleLock(index)}
        aria-label={locked ? `Unlock emoji ${index + 1}` : `Lock emoji ${index + 1}`}
        title={locked ? 'Unlock this emoji' : 'Lock this emoji'}
      >
        {locked ? '🔒' : '🔓'}
      </button>
    </div>
  );
};

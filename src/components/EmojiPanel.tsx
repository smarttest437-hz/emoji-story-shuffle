import React from 'react';
import { EmojiCard } from './EmojiCard';

interface EmojiPanelProps {
  emojis: string[];
  lockedIndices: Set<number>;
  emojiCount: 3 | 4 | 5;
  animating: boolean;
  markDoneEnabled: boolean;
  isHost: boolean;
  onToggleLock: (index: number) => void;
  onShuffle: () => void;
  onShuffleAll: () => void;
  onChangeCount: (count: 3 | 4 | 5) => void;
  onMarkDone: () => void;
  onLockEmojis: () => void;
}

export const EmojiPanel: React.FC<EmojiPanelProps> = ({
  emojis,
  lockedIndices,
  emojiCount,
  animating,
  markDoneEnabled,
  isHost,
  onToggleLock,
  onShuffle,
  onShuffleAll,
  onChangeCount,
  onMarkDone,
  onLockEmojis,
}) => {
  return (
    <div className="emoji-panel">
      <h2>Your Emojis</h2>

      {isHost ? (
        <>
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <EmojiCard
                key={index}
                emoji={emoji}
                index={index}
                locked={lockedIndices.has(index)}
                onToggleLock={onToggleLock}
                animating={animating}
              />
            ))}
          </div>

          <div className="emoji-controls">
            <div className="count-selector">
              <label htmlFor="emoji-count">Emoji Count:</label>
              <div className="count-buttons" role="group" aria-label="Select number of emojis">
                {([3, 4, 5] as const).map((count) => (
                  <button
                    key={count}
                    className={`count-button ${emojiCount === count ? 'active' : ''}`}
                    onClick={() => onChangeCount(count)}
                    aria-pressed={emojiCount === count}
                    aria-label={`${count} emojis`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="shuffle-buttons">
              <button
                className="btn btn-primary"
                onClick={onShuffle}
                disabled={animating}
                aria-label="Shuffle unlocked emojis"
              >
                🔀 Shuffle Unlocked
              </button>
              <button
                className="btn btn-secondary"
                onClick={onShuffleAll}
                disabled={animating}
                aria-label="Regenerate all emojis"
              >
                🔄 Shuffle All
              </button>
              <button
                className="btn btn-primary"
                onClick={onMarkDone}
                disabled={!markDoneEnabled}
                aria-label="Mark story as done"
              >
                🎉 Mark Done
              </button>
              <button
                className="btn btn-primary"
                onClick={onLockEmojis}
                aria-label="Lock emojis for all players"
              >
                🔒 Lock Emojis for Everyone
              </button>
            </div>
          </div>
        </>
      ) : (
        emojis.length === 0 ? (
          <p className="mp-connecting">Waiting for host to set emojis...</p>
        ) : (
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <EmojiCard
                key={index}
                emoji={emoji}
                index={index}
                locked={false}
                onToggleLock={() => {}}
                animating={animating}
              />
            ))}
          </div>
        )
      )}

      {isHost && (
        <div className="keyboard-hint">
          <small>💡 Tip: Lock emojis you want to keep, then shuffle the rest!</small>
        </div>
      )}
    </div>
  );
};

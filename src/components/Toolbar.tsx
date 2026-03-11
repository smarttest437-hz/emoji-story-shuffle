import React from 'react';

interface ToolbarProps {
  onNewRound: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onNewRound }) => {
  return (
    <div className="toolbar">
      <button
        className="btn btn-warning"
        onClick={onNewRound}
        aria-label="Start a new round"
      >
        🆕 New Round
      </button>
      <div className="toolbar-info">
        <small>
          New Round will clear your story, unlock all emojis, and reset the timer.
        </small>
      </div>
    </div>
  );
};

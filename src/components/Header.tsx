import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  authorName?: string;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode, authorName }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>
          <span role="img" aria-label="dice">🎲</span>
          {' '}Emoji Story Shuffle
        </h1>
        <p className="subtitle">A Scrum Retrospective Icebreaker</p>
      </div>
      <div className="header-right">
        {authorName && (
          <span className="header-username">
            <span role="img" aria-label="player">👤</span> {authorName}
          </span>
        )}
        <button
          className="theme-toggle"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

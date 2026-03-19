import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>
          <span role="img" aria-label="dice">🎲</span>
          {' '}Emoji Story Shuffle
        </h1>
        <p className="subtitle">A Scrum Retrospective Icebreaker</p>
      </div>
      <button
        className="theme-toggle"
        onClick={onToggleDarkMode}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
};

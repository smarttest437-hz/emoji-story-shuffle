import React, { useState } from 'react';
import { countWords, copyToClipboard, downloadTextFile } from '../lib/utils';

interface StoryEditorProps {
  story: string;
  minWords: number;
  maxWords: number;
  onStoryChange: (story: string) => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({
  story,
  minWords,
  maxWords,
  onStoryChange,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const wordCount = countWords(story);
  const isUnderMin = wordCount < minWords && story.trim().length > 0;
  const isOverMax = wordCount > maxWords;
  const isInRange = wordCount >= minWords && wordCount <= maxWords;

  const handleCopy = async () => {
    const success = await copyToClipboard(story);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `emoji-story-${timestamp}.txt`;
    downloadTextFile(filename, story);
  };

  return (
    <div className="story-editor">
      <h2>Your Story</h2>

      <textarea
        className="story-textarea"
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        placeholder="Start typing your story here using the emojis as inspiration..."
        aria-label="Story text area"
        aria-describedby="word-counter"
      />

      <div className="story-footer">
        <div
          id="word-counter"
          className={`word-counter ${isUnderMin ? 'under' : ''} ${isOverMax ? 'over' : ''} ${isInRange ? 'good' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="count">{wordCount}</span>
          <span className="range"> / {minWords}-{maxWords} words</span>
          {isOverMax && <span className="warning"> ⚠️ Over limit!</span>}
          {isUnderMin && <span className="hint"> (Keep going...)</span>}
          {isInRange && <span className="success"> ✓</span>}
        </div>

        <div className="story-actions">
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!story.trim()}
            aria-label="Copy story to clipboard"
          >
            {copySuccess ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={!story.trim()}
            aria-label="Export story as text file"
          >
            💾 Export
          </button>
        </div>
      </div>
    </div>
  );
};

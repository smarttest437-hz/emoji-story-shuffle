import React, { useEffect, useState, useCallback } from 'react';

type Phase = 'submission' | 'voting' | 'results';

interface Story {
  id: string;
  author: string;
  text: string;
  emojis: string[];
}

interface Vote {
  voterId: string;
  storyId: string;
}

interface MultiplayerPanelProps {
  authorName: string;
  voterId: string;
  storyText: string;
  emojis: string[];
  onSharedEmojis: (emojis: string[]) => void;
}

export const MultiplayerPanel: React.FC<MultiplayerPanelProps> = ({
  authorName,
  voterId,
  storyText,
  emojis,
  onSharedEmojis,
}) => {
  const [phase, setPhase] = useState<Phase>('submission');
  const [stories, setStories] = useState<Story[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [voteError, setVoteError] = useState<string>('');
  const [pollError, setPollError] = useState<boolean>(false);

  const isHost =
    new URLSearchParams(window.location.search).get('host') === 'true';

  const hasVoted = votes.some((v) => v.voterId === voterId);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Non-OK response');
      const data = await res.json();
      setPhase(data.phase);
      setStories(data.stories);
      setVotes(data.votes);
      setConnecting(false);
      setPollError(false);
      if (data.emojis && data.emojis.length > 0) {
        onSharedEmojis(data.emojis);
      }
    } catch {
      setConnecting(true);
      setPollError(true);
    }
  }, [onSharedEmojis]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: authorName, text: storyText, emojis }),
      });
      if (res.status === 409) {
        setSubmitted(true); // treat as already submitted — show "Story submitted!"
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(err.error ?? 'Failed to submit story.');
        return;
      }
      setSubmitted(true);
      fetchState();
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (storyId: string) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, storyId }),
      });
      if (res.status === 409) {
        fetchState();
        return;
      }
      if (!res.ok) {
        setVoteError('Failed to submit vote. Please try again.');
        return;
      }
      setVoteError('');
      fetchState();
    } catch {
      setVoteError('Failed to submit vote. Please try again.');
    }
  };

  const changePhase = async (p: Phase) => {
    await fetch('/api/phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: p }),
    });
    fetchState();
  };

  const handleReset = async () => {
    await fetch('/api/reset', { method: 'POST' });
    setSubmitted(false);
    fetchState();
  };

  const maxVotes = Math.max(
    ...stories.map((s) => votes.filter((v) => v.storyId === s.id).length),
    0
  );

  const renderStoryList = () => (
    <div className="story-list">
      {stories.map((story) => {
        const voteCount = votes.filter((v) => v.storyId === story.id).length;
        const isWinner =
          phase === 'results' && voteCount === maxVotes && maxVotes > 0;
        return (
          <div
            key={story.id}
            className={`story-card${isWinner ? ' story-card--winner' : ''}`}
          >
            <div className="story-card__emojis">{story.emojis.join(' ')}</div>
            <div className="story-card__author">{story.author}</div>
            <div className="story-card__text">{story.text}</div>
            {phase === 'results' && (
              <div className="story-card__vote-count">
                {voteCount} vote{voteCount !== 1 ? 's' : ''}
              </div>
            )}
            {phase === 'voting' && !hasVoted && (
              <button
                className="vote-btn"
                onClick={() => handleVote(story.id)}
              >
                Vote
              </button>
            )}
            {phase === 'voting' && hasVoted && (
              <span className="mp-voted-indicator">Voted!</span>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPhaseContent = () => {
    if (phase === 'submission') {
      return (
        <>
          <h3>Stories</h3>
          {!submitted ? (
            <>
              <button className="mp-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Story'}
              </button>
              {submitError && <p className="mp-submit-error">{submitError}</p>}
            </>
          ) : (
            <p>Story submitted!</p>
          )}
          {renderStoryList()}
        </>
      );
    }

    if (phase === 'voting') {
      return (
        <>
          <h3>Stories</h3>
          {renderStoryList()}
          {voteError && <p className="mp-error">{voteError}</p>}
        </>
      );
    }

    if (phase === 'results') {
      return (
        <>
          <h3>Stories</h3>
          {renderStoryList()}
        </>
      );
    }

    return null;
  };

  return (
    <div className="multiplayer-panel">
      <h3>Multiplayer</h3>
      {isHost && (
        <div className="host-controls">
          <button onClick={() => changePhase('voting')}>Open Voting</button>
          <button onClick={() => changePhase('results')}>Show Results</button>
          <button onClick={handleReset}>Reset</button>
        </div>
      )}
      {pollError && !connecting && <p className="mp-connecting">Reconnecting...</p>}
      {connecting ? (
        <p className="mp-connecting">Connecting...</p>
      ) : (
        renderPhaseContent()
      )}
    </div>
  );
};

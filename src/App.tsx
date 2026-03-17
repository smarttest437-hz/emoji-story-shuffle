import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { EmojiPanel } from './components/EmojiPanel';
import { StoryEditor } from './components/StoryEditor';
import { Timer } from './components/Timer';
import { Toolbar } from './components/Toolbar';
import { EMOJI_SEED } from './lib/emojis';
import { getRandomEmojis, useLocalStorage, getSeedFromURL } from './lib/utils';
import { MultiplayerPanel } from './components/MultiplayerPanel';

const MIN_WORDS = 80;
const MAX_WORDS = 120;

interface AppState {
  emojis: string[];
  lockedIndices: number[];
  emojiCount: 3 | 4 | 5;
  story: string;
  timerSeconds: number;
  timerDuration: 90 | 180 | 300;
  timerRunning: boolean;
  darkMode: boolean;
}

const initialState: AppState = {
  emojis: getRandomEmojis(EMOJI_SEED, 3),
  lockedIndices: [],
  emojiCount: 3,
  story: '',
  timerSeconds: 90,
  timerDuration: 90,
  timerRunning: false,
  darkMode: false,
};

function App() {
  const isHost = new URLSearchParams(window.location.search).get('host') === 'true';
  const [roundKey, setRoundKey] = useState(0);
  const [authorName, setAuthorName] = useState<string>(() => localStorage.getItem('mp-name') || '');
  const [voterId] = useState<string>(() => {
    let id = localStorage.getItem('mp-voter-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('mp-voter-id', id);
    }
    return id;
  });
  const [nameInput, setNameInput] = useState('');

  // Load state from localStorage or use initial state
  const [state, setState] = useLocalStorage<AppState>('emoji-story-state', initialState);
  const [animating, setAnimating] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state.darkMode]);

  // Handle timer tick
  const handleTimerTick = useCallback(() => {
    setState((prev) => {
      const newSeconds = Math.max(0, prev.timerSeconds - 1);
      if (newSeconds === 0) {
        // Timer ended - trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        return { ...prev, timerSeconds: 0, timerRunning: false };
      }
      return { ...prev, timerSeconds: newSeconds };
    });
  }, [setState]);

  // Toggle emoji lock
  const handleToggleLock = useCallback((index: number) => {
    setState((prev) => {
      const locked = new Set(prev.lockedIndices);
      if (locked.has(index)) {
        locked.delete(index);
      } else {
        locked.add(index);
      }
      return { ...prev, lockedIndices: Array.from(locked) };
    });
  }, [setState]);

  // Shuffle unlocked emojis
  const handleShuffle = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setState((prev) => {
        const locked = new Set(prev.lockedIndices);
        const newEmojis = [...prev.emojis];
        const seed = getSeedFromURL();

        // Generate new emojis for unlocked positions
        for (let i = 0; i < prev.emojiCount; i++) {
          if (!locked.has(i)) {
            const randomEmojis = getRandomEmojis(EMOJI_SEED, 1, new Set(), seed + i);
            newEmojis[i] = randomEmojis[0];
          }
        }

        return { ...prev, emojis: newEmojis };
      });
      setAnimating(false);
    }, 300);
  }, [setState]);

  // Shuffle all emojis (unlock all first)
  const handleShuffleAll = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setState((prev) => {
        const seed = getSeedFromURL();
        const newEmojis = getRandomEmojis(EMOJI_SEED, prev.emojiCount, new Set(), seed);
        return { ...prev, emojis: newEmojis, lockedIndices: [] };
      });
      setAnimating(false);
    }, 300);
  }, [setState]);

  // Change emoji count
  const handleChangeCount = useCallback((count: 3 | 4 | 5) => {
    setState((prev) => {
      if (count === prev.emojiCount) return prev;

      let newEmojis = [...prev.emojis];
      const newLocked = new Set(prev.lockedIndices);

      if (count > prev.emojiCount) {
        // Add more emojis
        const seed = getSeedFromURL();
        const additional = getRandomEmojis(EMOJI_SEED, count - prev.emojiCount, new Set(), seed);
        newEmojis = [...newEmojis, ...additional];
      } else {
        // Remove emojis from the end
        newEmojis = newEmojis.slice(0, count);
        // Remove locks for removed indices
        for (let i = count; i < prev.emojiCount; i++) {
          newLocked.delete(i);
        }
      }

      return {
        ...prev,
        emojiCount: count,
        emojis: newEmojis,
        lockedIndices: Array.from(newLocked),
      };
    });
  }, [setState]);

  // Story change
  const handleStoryChange = useCallback((story: string) => {
    setState((prev) => ({ ...prev, story }));
  }, [setState]);

  // Lock emojis for everyone
  const handleLockEmojis = useCallback(() => {
    fetch('/api/emojis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emojis: state.emojis }),
    }).catch(() => {});
  }, [state.emojis]);

  // Handle shared emojis pushed from backend (non-host only)
  const handleSharedEmojis = useCallback((emojis: string[]) => {
    if (!isHost) {
      setState((prev) => {
        if (prev.emojis.join(',') === emojis.join(',')) return prev;
        return { ...prev, emojis };
      });
    }
  }, [isHost, setState]);


  // Timer controls
  const handleTimerStart = useCallback(() => {
    setState((prev) => ({ ...prev, timerRunning: true }));
  }, [setState]);

  const handleTimerPause = useCallback(() => {
    setState((prev) => ({ ...prev, timerRunning: false }));
  }, [setState]);

  const handleTimerDurationChange = useCallback((duration: 90 | 180 | 300) => {
    setState((prev) => ({
      ...prev,
      timerDuration: duration,
      timerSeconds: duration,
      timerRunning: false,
    }));
  }, [setState]);

  const handleTimerReset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timerSeconds: prev.timerDuration,
      timerRunning: false,
    }));
  }, [setState]);

  // New round - reset everything
  const handleNewRound = useCallback(() => {
    if (confirm('Start a new round? This will clear your story and reset everything.')) {
      const seed = getSeedFromURL();
      const newEmojis = getRandomEmojis(EMOJI_SEED, state.emojiCount, new Set(), seed);
      setState((prev) => ({
        ...prev,
        emojis: newEmojis,
        lockedIndices: [],
        story: '',
        timerDuration: 90,
        timerSeconds: 90,
        timerRunning: false,
      }));
      fetch('/api/reset', { method: 'POST' }).catch(() => {});
      setRoundKey((k) => k + 1);
    }
  }, [setState, state.emojiCount]);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, [setState]);

  if (!authorName && !isHost) {
    return (
      <div className="name-entry">
        <h2>Welcome to Emoji Story Shuffle!</h2>
        <p>Enter your name to join</p>
        <form onSubmit={(e) => {
          e.preventDefault();
          const trimmed = nameInput.trim();
          if (!trimmed) return;
          localStorage.setItem('mp-name', trimmed);
          setAuthorName(trimmed);
        }}>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            autoFocus
            maxLength={50}
          />
          <button type="submit" disabled={!nameInput.trim()}>Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <Header darkMode={state.darkMode} onToggleDarkMode={handleToggleDarkMode} />

      <main className="main-content">
        <div className="left-panel">
          <EmojiPanel
            emojis={state.emojis}
            lockedIndices={new Set(state.lockedIndices)}
            emojiCount={state.emojiCount}
            animating={animating}
            isHost={isHost}
            onToggleLock={handleToggleLock}
            onShuffle={handleShuffle}
            onShuffleAll={handleShuffleAll}
            onChangeCount={handleChangeCount}
            onLockEmojis={handleLockEmojis}
          />

          {isHost && (
            <Timer
              seconds={state.timerSeconds}
              isRunning={state.timerRunning}
              maxSeconds={state.timerDuration}
              selectedDuration={state.timerDuration}
              onDurationChange={handleTimerDurationChange}
              onTick={handleTimerTick}
              onStart={handleTimerStart}
              onPause={handleTimerPause}
              onReset={handleTimerReset}
            />
          )}
        </div>

        <div className="right-panel">
          {!isHost && (
            <StoryEditor
              story={state.story}
              minWords={MIN_WORDS}
              maxWords={MAX_WORDS}
              onStoryChange={handleStoryChange}
            />
          )}

          <MultiplayerPanel
            key={roundKey}
            authorName={authorName}
            voterId={voterId}
            storyText={state.story}
            emojis={state.emojis}
            onSharedEmojis={handleSharedEmojis}
          />

          {isHost && <Toolbar onNewRound={handleNewRound} />}
        </div>
      </main>

      <footer className="app-footer">
        <div className="instructions">
          <h3>How to Play:</h3>
          <ol>
            <li>🎲 Generate 3-5 random emojis</li>
            <li>🔒 Lock emojis you like, shuffle the rest</li>
            <li>⏱️ Start the timer — choose 90s, 3 min, or 5 min (optional)</li>
            <li>✍️ Write a {MIN_WORDS}-{MAX_WORDS} word story inspired by the emojis</li>
          </ol>
        </div>
        <div className="keyboard-shortcuts">
          <h4>Tips:</h4>
          <ul>
            <li>Use <strong>?seed=123</strong> in URL for reproducible emoji sets</li>
            <li>Your session auto-saves to localStorage</li>
            <li>Perfect for 10-15 minute team icebreakers!</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;

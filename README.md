# 🎲 Emoji Story Shuffle

A fun, interactive single-page web app designed as a **Scrum retrospective icebreaker**. Teams collaboratively create short stories using randomly generated emojis in 10-15 minutes!

## 🎯 Features

- **🎲 Random Emoji Generation**: Generate 3-5 diverse emojis from a seed list of ~500 emojis
- **🔒 Lock & Shuffle**: Lock emojis you like and shuffle the rest for perfect combinations
- **⏱️ Timer**: Optional 90-second countdown with visual progress ring
- **✍️ Story Editor**: Write 80-120 word stories with real-time word counter
- **💾 Auto-Save**: Session state persists to localStorage automatically
- **🌙 Dark Mode**: Toggle between light and dark themes
- **🎉 Confetti**: Celebration animations when completing stories
- **♿ Accessible**: Keyboard navigation, ARIA labels, and high-contrast support
- **📱 Responsive**: Works beautifully on desktop and mobile devices

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the URL shown in terminal).

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Run Tests

```bash
npm test
```

## 🎮 How to Play

1. **🎲 Generate Emojis**: Click shuffle to get 3-5 random emojis
2. **🔒 Lock Favorites**: Click the lock icon to keep emojis you like
3. **🔀 Shuffle Again**: Shuffle unlocked emojis until you find the perfect set
4. **⏱️ Start Timer** (optional): 90 seconds to write your story
5. **✍️ Write Your Story**: Create a 80-120 word story inspired by the emojis
6. **🎉 Mark Done**: Celebrate with confetti when you finish!

## 🔧 Tech Stack

- **Vite**: Lightning-fast build tool
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Canvas Confetti**: Celebration animations
- **Vitest**: Fast unit testing
- **CSS3**: Modern styling with CSS Grid and Flexbox

## 📁 Project Structure

```
emoji-story-shuffle/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # App header with dark mode toggle
│   │   ├── EmojiCard.tsx       # Individual emoji card with lock
│   │   ├── EmojiPanel.tsx      # Emoji grid and controls
│   │   ├── Timer.tsx           # Countdown timer with progress ring
│   │   ├── StoryEditor.tsx     # Story text area and actions
│   │   └── Toolbar.tsx         # Session controls
│   ├── lib/
│   │   ├── emojis.ts           # 500+ emoji seed list
│   │   └── utils.ts            # Utility functions and hooks
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # React entry point
│   └── styles.css              # Global styles
├── tests/
│   └── utils.test.ts           # Unit tests
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 Features in Detail

### Deterministic Randomness

Use URL query parameters to create reproducible emoji sets:

```
http://localhost:5173/?seed=12345
```

This allows teams to share the same emoji set for synchronized sessions!

### LocalStorage Persistence

Your session automatically saves:
- Selected emojis and lock states
- Story text
- Timer state
- Dark mode preference
- Emoji count

Reload the page and pick up right where you left off!

### Keyboard Accessibility

- Full keyboard navigation with Tab
- Proper focus indicators
- ARIA labels for screen readers
- Semantic HTML structure

### Responsive Design

- Desktop: Two-column layout
- Tablet: Single column with optimized spacing
- Mobile: Touch-friendly buttons and compact layout
- Large text for projector display

## 🧪 Testing

The project includes unit tests for critical utilities:

- **Word counter**: Validates word counting logic
- **Time formatter**: Tests mm:ss formatting
- **Seeded random**: Ensures deterministic randomness
- **Emoji generator**: Validates emoji selection and locking

Run tests with:

```bash
npm test
```

## 🎭 Use Cases

Perfect for:

- **Scrum Retrospectives**: Fun icebreaker activity
- **Team Building**: Creative storytelling exercise
- **Writing Workshops**: Prompt generator
- **Classroom Activities**: Creative writing exercises
- **Remote Teams**: Synchronized virtual activities

## 🌟 Tips for Facilitators

1. **Screen Share**: Display the app during team meetings
2. **Set Time Limits**: Use the 90-second timer for quick rounds
3. **Share Seeds**: Use URL seeds to ensure everyone gets the same emojis
4. **Celebrate**: Encourage "Mark Done" clicks for team confetti!
5. **Multiple Rounds**: Play several rounds with different emoji counts

## 📝 Customization

### Adjust Word Limits

Edit `src/App.tsx`:

```typescript
const MIN_WORDS = 80;  // Change minimum
const MAX_WORDS = 120; // Change maximum
```

### Adjust Timer Duration

Edit `src/App.tsx`:

```typescript
const DEFAULT_TIMER_SECONDS = 90; // Change duration
```

### Add More Emojis

Edit `src/lib/emojis.ts` and add to the `EMOJI_SEED` array.

## 🐛 Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

## 📜 License

MIT License - feel free to use and modify for your team!

## 🤝 Contributing

This is a teaching/demo project. Feel free to fork and customize for your needs!

## 💡 Acknowledgments

- Emoji data from Unicode Standard
- Confetti effect by [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Built with ❤️ for Scrum teams everywhere

---

**Happy Storytelling! 🎉📖✨**

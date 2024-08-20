const Hiragana = ({ gameTime, onGameEnd, onReset }) => {
  const [visibleChars, setVisibleChars] = React.useState([
    "あ",
    "い",
    "う",
    "え",
    "お",
    "か",
    "き",
    "く",
    "け",
    "こ",
    "さ",
    "し",
    "す",
    "せ",
    "そ",
    "た",
    "ち",
    "つ",
    "て",
    "と",
    "な",
    "に",
    "ぬ",
    "ね",
    "の",
    "は",
    "ひ",
    "ふ",
    "へ",
    "ほ",
    "ま",
    "み",
    "む",
    "め",
    "も",
    "や",
    "",
    "ゆ",
    "",
    "よ",
    "ら",
    "り",
    "る",
    "れ",
    "ろ",
    "わ",
    "",
    "を",
    "",
    "ん",
  ]);
  const [fadedChars, setFadedChars] = React.useState([]);
  const [timeLeft, setTimeLeft] = React.useState(gameTime);
  const [progress, setProgress] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const animationFrameRef = React.useRef();
  const [remainingTime, setRemainingTime] = React.useState(gameTime);
  const [lastTimestamp, setLastTimestamp] = React.useState(null);
  const [pausedTime, setPausedTime] = React.useState(0);
  const [audio] = React.useState(new Audio("/alert.mp3"));
  const [currentRoundTime, setCurrentRoundTime] = React.useState(gameTime);

  React.useEffect(() => {
    let startTime;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      if (isPaused) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = timestamp - startTime - pausedTime;
      const newTimeLeft = Math.max(0, currentRoundTime - elapsedTime / 1000);
      setTimeLeft(newTimeLeft);
      setProgress(((currentRoundTime - newTimeLeft) / currentRoundTime) * 360);

      if (newTimeLeft > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // 1文字減らす処理
        setFadedChars((prevFaded) => {
          const nonFadedIndices = visibleChars.reduce((acc, char, index) => (char && !prevFaded.includes(index) ? [...acc, index] : acc), []);
          if (nonFadedIndices.length === 0) {
            onGameEnd();
            return prevFaded;
          }
          const randomIndex = nonFadedIndices[Math.floor(Math.random() * nonFadedIndices.length)];
          audio.play();
          return [...prevFaded, randomIndex];
        });
        startTime = timestamp;
        setPausedTime(0);
        setCurrentRoundTime(gameTime); // 新しいラウンドの時間をリセット
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameTime, onGameEnd, isPaused, pausedTime, visibleChars, audio, currentRoundTime]);

  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const togglePause = () => {
    setIsPaused((prev) => {
      if (prev) {
        setPausedTime((prevPausedTime) => prevPausedTime + (performance.now() - lastTimestamp));
      } else {
        setLastTimestamp(performance.now());
      }
      return !prev;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="game-container">
      <div className="hiragana-grid">
        {visibleChars.map((char, i) => (
          <div key={i} className={`hiragana-cell ${char ? "" : "empty"} ${fadedChars.includes(i) ? "faded" : ""}`}>
            {char}
          </div>
        ))}
      </div>
      <div className="timer" style={{ "--progress": `${progress}deg` }}>
        {formatTime(Math.ceil(timeLeft))}
      </div>
      <div className="button-container">
        <button onClick={togglePause} className="pause-button">
          {isPaused ? "再開" : "一時停止"}
        </button>
        <button onClick={onReset} className="reset-button">
          はじめから
        </button>
      </div>
    </div>
  );
};

const StartScreen = ({ onStart }) => {
  const [time, setTime] = React.useState("00:30");

  const handleTimeChange = (e) => {
    const value = e.target.value;
    if (/^[0-5]?[0-9]?:[0-5]?[0-9]?$/.test(value)) {
      setTime(value);
    }
  };

  const handleStart = () => {
    const [minutes, seconds] = time.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;
    onStart(totalSeconds);
  };

  return (
    <div className="start-screen">
      <h1>「残像に口紅を」ゲーム</h1>
      <div className="time-setting">
        <label htmlFor="time-input">ひらがなが1文字減るまで：</label>
        <input id="time-input" type="text" value={time} onChange={handleTimeChange} placeholder="00:00" pattern="[0-5]?[0-9]?:[0-5]?[0-9]?" />
      </div>
      <button onClick={handleStart}>スタート</button>
    </div>
  );
};

const EndScreen = ({ onRestart }) => {
  return (
    <div className="end-screen">
      <h1>ゲーム終了</h1>
      <p>全てのひらがなが消えました！</p>
      <button onClick={onRestart}>もう一度プ��イ</button>
    </div>
  );
};

const App = () => {
  const [gameState, setGameState] = React.useState("start");
  const [gameTime, setGameTime] = React.useState(30);

  const handleStart = (time) => {
    setGameTime(time);
    setGameState("playing");
  };

  const handleGameEnd = () => {
    setGameState("end");
  };

  const handleReset = () => {
    setGameState("start");
  };

  const handleRestart = () => {
    setGameState("start");
  };

  switch (gameState) {
    case "playing":
      return <Hiragana gameTime={gameTime} onGameEnd={handleGameEnd} onReset={handleReset} />;
    case "end":
      return <EndScreen onRestart={handleRestart} />;
    default:
      return <StartScreen onStart={handleStart} />;
  }
};

const target = document.getElementById("app");
const root = ReactDOM.createRoot(target);
root.render(<App />);

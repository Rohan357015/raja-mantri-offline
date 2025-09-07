import React, { useState, useEffect } from "react";
import "../styles/gamepage.css";
import { ScoreBoard } from "./scoreboard.jsx";

export const StartGame = () => {
  const [gameState, setGameState] = useState({
    phase: "waiting", // waiting, role-assignment, card-distribution, guessing, reveal, scoring, round-complete, game-finished
    currentRound: 1,
    totalRounds: 5,
    players: [],
    cards: [],
    sipahiGuess: null,
    roundResults: [],
    gameStarted: false,
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(1); // simulate current player id
  const [showScoreBoard, setShowScoreBoard] = useState(false);

  const roles = ["raja", "mantri", "chor", "sipahi"];
  const rolePoints = { raja: 1000, mantri: 800, chor: 0, sipahi: 500 };
  const roleColors = {
    raja: "#FFD700",
    mantri: "#C0C0C0",
    chor: "#FF6B6B",
    sipahi: "#4ECDC4",
  };

  // Load players & rounds from localStorage on mount
  useEffect(() => {
    const storedPlayers = JSON.parse(localStorage.getItem("players")) || [
      "Player 1",
      "Player 2",
      "Player 3",
      "Player 4",
    ];
    const rounds = parseInt(localStorage.getItem("rounds")) || 5;

    setGameState((prev) => ({
      ...prev,
      totalRounds: rounds,
      players: storedPlayers.map((name, index) => ({
        id: index + 1,
        name,
        role: null,
        points: 0,
      })),
    }));
  }, []);

  // Start the game
  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      gameStarted: true,
      phase: "role-assignment",
    }));
  };

  // Assign roles uniquely and prepare cards for current round
  const startRound = () => {
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    setGameState((prev) => {
      const newPlayers = prev.players.map((p, i) => ({
        ...p,
        role: shuffledRoles[i],
      }));

      const newCards = newPlayers.map((p) => ({
        playerId: p.id,
        role: p.role,
        // Reveal only Raja and Sipahi cards initially
        isRevealed: p.role === "raja" || p.role === "sipahi",
      }));

      return {
        ...prev,
        players: newPlayers,
        cards: newCards,
        phase: "card-distribution",
        sipahiGuess: null,
        selectedPlayer: null,
      };
    });
  };

  // Any player makes a guess between Chor and Mantri
  const makeGuess = () => {
    if (!selectedPlayer) return;

    const guessedPlayer = gameState.players.find(
      (p) => p.id === selectedPlayer
    );
    const isCorrect = guessedPlayer.role === "chor";

    setGameState((prev) => ({
      ...prev,
      sipahiGuess: {
        guessedPlayer: guessedPlayer.name,
        isCorrect,
        timestamp: new Date(),
      },
      phase: "reveal",
      cards: prev.cards.map((c) => ({ ...c, isRevealed: true })),
    }));
    setSelectedPlayer(null);
  };

  // Calculate scores based on guess outcome
  const calculateScore = () => {
    setGameState((prev) => {
      const { sipahiGuess } = prev;
      const updatedPlayers = prev.players.map((p) => {
        let earnedPoints = rolePoints[p.role];

        if (p.role === "sipahi") {
          earnedPoints = sipahiGuess?.isCorrect ? rolePoints.sipahi : 0;
        } else if (p.role === "chor") {
          earnedPoints = sipahiGuess?.isCorrect ? 0 : rolePoints.sipahi;
        }
        // Raja and Mantri keep their points as per rolePoints

        return { ...p, points: p.points + earnedPoints };
      });

      const results = updatedPlayers.map((p) => ({
        playerName: p.name,
        role: p.role,
        points: p.points,
        totalPoints: p.points,
      }));

      return {
        ...prev,
        players: updatedPlayers,
        phase: "scoring",
        roundResults: [
          ...prev.roundResults,
          { round: prev.currentRound, results },
        ],
      };
    });
  };

  // Move to next round or finish game if last
  const nextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      setGameState((prev) => ({
        ...prev,
        phase: "game-finished",
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      phase: "role-assignment",
      cards: [],
      sipahiGuess: null,
      selectedPlayer: null,
    }));
  };

  // Reset game to initial state
  const resetGame = () => {
    localStorage.removeItem("players");
    localStorage.removeItem("rounds");
    window.location.reload();
  };

  const getRoleName = (role) => {
    const map = {
      raja: "Raja (King)",
      mantri: "Mantri (Minister)",
      chor: "Chor (Thief)",
      sipahi: "Sipahi (Guard)",
    };
    return map[role] || role;
  };

  return (
    <div className="game-container">
      {/* Score Button top right */}
      {gameState.gameStarted && (
        <button
          className="score-button"
          onClick={() => setShowScoreBoard(true)}
        >
          📊 Score
        </button>
      )}

      {/* ScoreBoard Modal */}
      {showScoreBoard && (
        <ScoreBoard
          gameState={gameState}
          onClose={() => setShowScoreBoard(false)}
        />
      )}

      <div className="game-header">
        <h1>Raja Mantri Chor Sipahi</h1>
        <span>
          Round {gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {!gameState.gameStarted && (
        <div className="phase-container">
          <h2>Welcome to the Game</h2>
          <button onClick={startGame} className="btn-primary">
            Start Game
          </button>
        </div>
      )}

      {gameState.phase === "role-assignment" && (
        <div className="phase-container">
          <h2>Assigning Roles...</h2>
          <button onClick={startRound} className="btn-primary">
            Start Round {gameState.currentRound}
          </button>
        </div>
      )}

      {gameState.phase === "card-distribution" && (
        <div className="phase-container">
          <h2>Card Distribution</h2>
          <div className="players-grid">
            {gameState.players.map((p) => {
              const card = gameState.cards.find((c) => c.playerId === p.id);
              return (
                <div key={p.id} className="player-card">
                  <div className="player-name">{p.name}</div>
                  <div
                    className={`role-card ${
                      card?.isRevealed ? "revealed" : "hidden"
                    }`}
                    style={{
                      backgroundColor: card?.isRevealed
                        ? roleColors[card.role]
                        : "#ccc",
                    }}
                  >
                    {card?.isRevealed ? getRoleName(card.role) : "?"}
                  </div>
                  <div>Total: {p.points} pts</div>
                </div>
              );
            })}
          </div>

          {/* Anyone can guess between Chor and Mantri */}
          <div className="guessing">
            <h3> guess who is Chor:</h3>
            {gameState.players
              .filter((p) => p.role === "chor" || p.role === "mantri")
              .map((p) => (
                <button
                  key={p.id}
                  className={
                    selectedPlayer === p.id ? "selected guess-btn" : "guess-btn"
                  }
                  onClick={() => setSelectedPlayer(p.id)}
                >
                  {p.name}
                </button>
              ))}
            <button
              onClick={makeGuess}
              disabled={!selectedPlayer}
              className="btn-primary"
            >
              Confirm Guess
            </button>
          </div>
        </div>
      )}

      {gameState.phase === "reveal" && (
        <div className="phase-container">
          <h2>Reveal Phase</h2>
          <div className="players-grid">
            {gameState.players.map((p) => {
              const card = gameState.cards.find((c) => c.playerId === p.id);
              return (
                <div key={p.id} className="player-card">
                  <div>{p.name}</div>
                  <div
                    className="role-card revealed"
                    style={{ backgroundColor: roleColors[card.role] }}
                  >
                    {getRoleName(card.role)}
                  </div>
                  <div>Total: {p.points} pts</div>
                </div>
              );
            })}
          </div>
          <button onClick={calculateScore} className="btn-primary">
            Calculate Scores
          </button>
        </div>
      )}

      {gameState.phase === "scoring" && (
        <div className="phase-container">
          <h2>Scores</h2>
          {gameState.roundResults.length > 0 && (
            <div>
              {gameState.roundResults[
                gameState.roundResults.length - 1
              ].results.map((r, i) => (
                <p key={i}>
                  {r.playerName} → {getRoleName(r.role)} → +{r.points} pts →
                  Total {r.totalPoints}
                </p>
              ))}
            </div>
          )}
          <button onClick={nextRound} className="btn-primary">
            Next Round
          </button>
        </div>
      )}

      {gameState.phase === "game-finished" && (
        <div className="phase-container">
          <h2>Game Over 🎉</h2>
          {gameState.players
            .sort((a, b) => b.points - a.points)
            .map((p, i) => (
              <p key={i}>
                #{i + 1} {p.name} → {p.points} pts
              </p>
            ))}
          <button onClick={resetGame} className="btn-secondary">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

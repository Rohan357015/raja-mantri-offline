import React from 'react';
import '../styles/scoreboard.css';

export const ScoreBoard = ({ gameState, onClose }) => {
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
    <div className="scoreboard-overlay">
      <div className="scoreboard-container">
        <div className="scoreboard-header">
          <h2>Score Board</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="current-scores">
          <h3>Current Round Scores</h3>
          <div className="scores-grid">
            {gameState.players.map((player) => (
              <div key={player.id} className="score-item">
                <span className="player-name">{player.name}</span>
                <span className="player-role">
                  {player.role ? getRoleName(player.role) : "No Role"}
                </span>
                <span className="player-points">{player.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        {gameState.roundResults.length > 0 && (
          <div className="round-history">
            <h3>Round History</h3>
            {gameState.roundResults.map((round, index) => (
              <div key={index} className="round-summary">
                <h4>Round {round.round}</h4>
                <div className="round-results">
                  {round.results.map((result, i) => (
                    <div key={i} className="result-item">
                      <span>{result.playerName}</span>
                      <span>{getRoleName(result.role)}</span>
                      <span>+{result.points} pts</span>
                      <span>Total: {result.totalPoints}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

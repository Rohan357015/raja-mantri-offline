import React, { useState, useEffect } from 'react'
import '../styles/startingpage.css';
import { useNavigate } from 'react-router-dom';

export const StartingPage = () => {
  // ✅ Load from localStorage if available, else empty
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("players");
    return saved
      ? JSON.parse(saved)
      : ["", "", "", ""]; // 4 empty players
  });

  const [rounds, setRounds] = useState(() => {
    return localStorage.getItem("rounds") || 5; // default 5
  });

  // ✅ Save to localStorage whenever players or rounds change
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("rounds", rounds);
  }, [players, rounds]);

  // ✅ Handle name input
  const handleChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  // ✅ Handle start button (later you can navigate to game page)
  const navigate = useNavigate();
  const handleStart = (e) => {
    e.preventDefault();
    alert(`Game Started with ${players.join(", ")} for ${rounds} rounds`);
    navigate('/game');
  };

  return (
    <div className='d-flex flex-column justify-content-center align-items-center vh-100 game-container'>
      <h1 className='game-title'>Raja-Mantri</h1>
      <hr className="mx-auto mb-4 game-divider" />
      <h2 className='game-subtitle fw-semibold'>Enter The Player Name</h2>

      <form onSubmit={handleStart} className='game-divider p-5 form-bg rounded d-flex flex-column justify-content-center align-items-center'>

        {players.map((name, index) => (
          <div key={index} className="mb-3 w-100">
            <input
              type="text"
              className="form-control game-input"
              placeholder={`Player ${index + 1}`}
              value={name}
              onChange={(e) => handleChange(index, e.target.value)}
            />
            <br />
          </div>
        ))}

        <label className="fw-semibold mt-3">Rounds: {rounds}</label>
        <input
          type="range"
          max={20}
          min={1}
          value={rounds}
          onChange={(e) => setRounds(e.target.value)}
          className="form-range game-input"
        />

        <button type="submit" className='btn-game-success mt-4'>Start Game</button>
      </form>
    </div>
  )
}

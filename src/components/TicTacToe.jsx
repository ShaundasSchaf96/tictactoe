import { useState, useEffect, useCallback } from "react";  
import Board from "./Board";
import GameOver from "./GameOver";
import GameState from "./GameState";
import Reset from "./Reset";

const PLAYER_X = "X";
const PLAYER_O = "O";

const winningCombinations = [
  { combo: [0, 1, 2], strikeClass: "strike-row-1" },
  { combo: [3, 4, 5], strikeClass: "strike-row-2" },
  { combo: [6, 7, 8], strikeClass: "strike-row-3" },
  { combo: [0, 3, 6], strikeClass: "strike-column-1" },
  { combo: [1, 4, 7], strikeClass: "strike-column-2" },
  { combo: [2, 5, 8], strikeClass: "strike-column-3" },
  { combo: [0, 4, 8], strikeClass: "strike-diagonal-1" },
  { combo: [2, 4, 6], strikeClass: "strike-diagonal-2" },
];

function checkWinner(tiles, setStrikeClass) {
  for (const { combo, strikeClass } of winningCombinations) {
    const [a, b, c] = combo;

    if (tiles[a] && tiles[a] === tiles[b] && tiles[a] === tiles[c]) {
      setStrikeClass(strikeClass); 
      return tiles[a]; 
    }
  }
  return tiles.every(tile => tile !== null) ? 'draw' : null; 
}

function TicTacToe() {
  const [tiles, setTiles] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(PLAYER_X);
  const [strikeClass, setStrikeClass] = useState(null);
  const [gameState, setGameState] = useState(GameState.inProgress);

  const minimax = useCallback((newTiles, isMaximizing) => {
    const winner = checkWinner(newTiles, () => {}); 

    if (winner === PLAYER_X) return -1;
    if (winner === PLAYER_O) return 1;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < newTiles.length; i++) {
        if (newTiles[i] === null) {
          newTiles[i] = PLAYER_O;
          let score = minimax(newTiles, false);
          newTiles[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < newTiles.length; i++) {
        if (newTiles[i] === null) {
          newTiles[i] = PLAYER_X;
          let score = minimax(newTiles, true);
          newTiles[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, []);

  const makeRandomAIMove = useCallback(() => {
    const availableTiles = tiles
      .map((tile, index) => (tile === null ? index : null))
      .filter((index) => index !== null);
    
    if (availableTiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      const aiMove = availableTiles[randomIndex];

      const newTiles = [...tiles];
      newTiles[aiMove] = PLAYER_O;
      setTiles(newTiles);
      setPlayerTurn(PLAYER_X);
    }
  }, [tiles]);

  const getBestAIMove = useCallback(() => {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i] === null) {
        let newTiles = [...tiles];
        newTiles[i] = PLAYER_O;
        let score = minimax(newTiles, false);
        newTiles[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== null) {
      const newTiles = [...tiles];
      newTiles[move] = PLAYER_O;
      setTiles(newTiles);
      setPlayerTurn(PLAYER_X);
    }
  }, [tiles, minimax]);

  const handleAIMove = useCallback(() => {
    if (gameState !== GameState.inProgress) return;

    const makeRandomMove = Math.random() < 0.5;

    if (makeRandomMove) {
      makeRandomAIMove();
    } else {
      getBestAIMove();
    }
  }, [gameState, makeRandomAIMove, getBestAIMove]);

  const handleTileClick = (index) => {
    if (gameState !== GameState.inProgress || tiles[index] !== null) {
      return;
    }

    const newTiles = [...tiles];
    newTiles[index] = PLAYER_X;
    setTiles(newTiles);
    setPlayerTurn(PLAYER_O);
  };

  useEffect(() => {
    if (playerTurn === PLAYER_O && gameState === GameState.inProgress) {
      const aiTimeout = setTimeout(handleAIMove, 500);
      return () => clearTimeout(aiTimeout);
    }
  }, [playerTurn, gameState, handleAIMove]);

  useEffect(() => {
    const winner = checkWinner(tiles, setStrikeClass); 
    if (winner) {
      if (winner === PLAYER_X) {
        setGameState(GameState.playerXWins);
      } else if (winner === PLAYER_O) {
        setGameState(GameState.playerOWins);
      } else if (winner === 'draw') {
        setGameState(GameState.draw);
      }
    }
  }, [tiles]);

  const handleReset = () => {
    setGameState(GameState.inProgress);
    setTiles(Array(9).fill(null));
    setPlayerTurn(PLAYER_X);
    setStrikeClass(null);
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      <Board
        playerTurn={playerTurn}
        tiles={tiles}
        onTileClick={handleTileClick}
        strikeClass={strikeClass}
      />
      <GameOver gameState={gameState} />
      <Reset gameState={gameState} onReset={handleReset} />
    </div>
  );
}

export default TicTacToe;

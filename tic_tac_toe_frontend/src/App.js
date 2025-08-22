import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Tic Tac Toe Frontend
 * - Interactive 3x3 board
 * - Two-player local gameplay (X and O)
 * - Optional AI opponent with simple rule-based strategy
 * - Win/draw detection with visual highlight
 * - Reset game button
 * - Visual feedback for current player turn
 * - Modern, light-themed style using provided color palette
 *
 * Colors:
 *  primary:   #1976d2
 *  secondary: #ffffff
 *  accent:    #f44336
 */

// Helpers
const EMPTY_BOARD = Array(9).fill(null);
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

/**
 * Compute winner and winning line if present.
 * @param {Array<string|null>} squares
 * @returns {{winner: 'X'|'O'|null, line: number[]|null}}
 */
function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * Determine if the board is full.
 * @param {Array<string|null>} squares
 * @returns {boolean}
 */
function isBoardFull(squares) {
  return squares.every((v) => v !== null);
}

/**
 * Try to find a winning move for the given player.
 * Returns index or null.
 */
function findWinningMove(squares, player) {
  for (const [a, b, c] of LINES) {
    const line = [squares[a], squares[b], squares[c]];
    const emptyCount = line.filter((v) => v === null).length;
    const playerCount = line.filter((v) => v === player).length;
    if (emptyCount === 1 && playerCount === 2) {
      if (squares[a] === null) return a;
      if (squares[b] === null) return b;
      if (squares[c] === null) return c;
    }
  }
  return null;
}

/**
 * Choose a reasonable AI move:
 * 1) Win if possible
 * 2) Block opponent's win
 * 3) Take center
 * 4) Take a corner
 * 5) Take any side
 */
function chooseAiMove(squares, aiPlayer) {
  const human = aiPlayer === 'X' ? 'O' : 'X';

  // 1) Win
  const winIdx = findWinningMove(squares, aiPlayer);
  if (winIdx !== null) return winIdx;

  // 2) Block
  const blockIdx = findWinningMove(squares, human);
  if (blockIdx !== null) return blockIdx;

  // 3) Center
  if (squares[4] === null) return 4;

  // 4) Corners
  const corners = [0, 2, 6, 8].filter((i) => squares[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5) Sides
  const sides = [1, 3, 5, 7].filter((i) => squares[i] === null);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return null;
}

// PUBLIC_INTERFACE
export default function App() {
  /** Game state */
  const [squares, setSquares] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);

  /** Opponent mode: 'human' or 'ai' */
  const [opponent, setOpponent] = useState('human');
  /** Which symbol does the AI play when enabled. Default AI = 'O' so user starts as 'X'. */
  const [aiPlays, setAiPlays] = useState('O');

  // Derived state
  const { winner, line } = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => !winner && isBoardFull(squares), [winner, squares]);

  // Trigger AI move when:
  // - opponent is AI
  // - game not over
  // - it's AI's turn
  useEffect(() => {
    if (opponent !== 'ai') return;
    if (winner || draw) return;

    const currentPlayer = xIsNext ? 'X' : 'O';
    if (currentPlayer !== aiPlays) return;

    // Slight delay for UX
    const timer = setTimeout(() => {
      const move = chooseAiMove(squares, aiPlays);
      if (move !== null && squares[move] === null) {
        const next = squares.slice();
        next[move] = aiPlays;
        setSquares(next);
        setXIsNext(!xIsNext);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [opponent, winner, draw, xIsNext, aiPlays, squares]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    // Ignore clicks if occupied or game over
    if (squares[index] || winner || draw) return;

    const currentPlayer = xIsNext ? 'X' : 'O';
    // In AI mode, block clicking when it's AI's turn
    if (opponent === 'ai' && currentPlayer === aiPlays) {
      return;
    }

    const next = squares.slice();
    next[index] = currentPlayer;
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleOpponentChange(e) {
    const mode = e.target.value;
    setOpponent(mode);
    // Reset when switching modes for clarity
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleAiSideChange(e) {
    const side = e.target.value; // 'X' or 'O'
    setAiPlays(side);
    // Reset game when changing AI side
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  }

  const currentTurn = xIsNext ? 'X' : 'O';
  const isAiTurn = opponent === 'ai' && currentTurn === aiPlays;

  const statusText = winner
    ? `Winner: ${winner}`
    : draw
    ? 'Draw!'
    : `Current Turn: ${currentTurn}${opponent === 'ai' ? currentTurn === aiPlays ? ' (AI)' : ' (You)' : ''}`;

  return (
    <div className="ttt-app">
      <div className="ttt-container">
        <h1 className="ttt-title" aria-label="Tic Tac Toe heading">
          Tic Tac Toe
        </h1>

        {/* Opponent selector */}
        <div className="ttt-controls" style={{ marginBottom: 12, gap: 8 }}>
          <label htmlFor="opponent" style={{ fontWeight: 600, color: 'var(--color-muted)' }}>
            Opponent:
          </label>
          <select
            id="opponent"
            value={opponent}
            onChange={handleOpponentChange}
            className="btn"
            aria-label="Select opponent type"
          >
            <option value="human">Local Human</option>
            <option value="ai">Computer (AI)</option>
          </select>

          {opponent === 'ai' && (
            <>
              <label htmlFor="aiSide" style={{ fontWeight: 600, color: 'var(--color-muted)', marginLeft: 8 }}>
                AI plays:
              </label>
              <select
                id="aiSide"
                value={aiPlays}
                onChange={handleAiSideChange}
                className="btn"
                aria-label="Select AI side"
              >
                <option value="X">X (AI starts)</option>
                <option value="O">O (You start)</option>
              </select>
            </>
          )}
        </div>

        <div
          className={`ttt-status ${winner ? 'ttt-status-win' : draw ? 'ttt-status-draw' : ''}`}
          role="status"
          aria-live="polite"
        >
            <span className={`badge ${winner ? 'badge-accent' : xIsNext ? 'badge-primary' : 'badge-secondary'}`}>
            {winner ? '🏆' : isAiTurn ? '🤖' : '🎮'}
          </span>
          <span className="status-text">{statusText}</span>
        </div>

        <Board
          squares={squares}
          onClick={handleSquareClick}
          winningLine={line}
          disabled={!!winner || !!draw || isAiTurn}
        />

        <div className="ttt-controls">
          <button className="btn btn-reset" onClick={resetGame} aria-label="Reset game">
            Reset Game
          </button>
        </div>

        <footer className="ttt-footer">
          <span className="legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-x">X</span> Player X
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-o">O</span> Player O
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}

/**
 * Board component renders a 3x3 grid of squares.
 * @param {{squares: Array<string|null>, onClick: (idx:number)=>void, winningLine: number[]|null, disabled: boolean}} props
 */
function Board({ squares, onClick, winningLine, disabled }) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((value, idx) => {
        const isWinning = winningLine ? winningLine.includes(idx) : false;
        return (
          <Square
            key={idx}
            value={value}
            onClick={() => onClick(idx)}
            isWinning={isWinning}
            disabled={disabled || !!value}
            ariaLabel={`Square ${idx + 1}${value ? `, ${value}` : ''}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Square component
 * @param {{value: 'X'|'O'|null, onClick: ()=>void, isWinning: boolean, disabled: boolean, ariaLabel?: string}} props
 */
function Square({ value, onClick, isWinning, disabled, ariaLabel }) {
  const classes = [
    'square',
    value === 'X' ? 'square-x' : value === 'O' ? 'square-o' : '',
    isWinning ? 'square-winning' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {value}
    </button>
  );
}

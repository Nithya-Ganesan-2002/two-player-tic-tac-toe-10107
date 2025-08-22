import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Tic Tac Toe Frontend
 * - Interactive 3x3 board
 * - Two-player local gameplay (X and O)
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

// PUBLIC_INTERFACE
export default function App() {
  /** Game state */
  const [squares, setSquares] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);

  // Derived state
  const { winner, line } = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => !winner && isBoardFull(squares), [winner, squares]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    // Ignore clicks if occupied or game over
    if (squares[index] || winner) return;

    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  }

  const statusText = winner
    ? `Winner: ${winner}`
    : draw
    ? 'Draw!'
    : `Current Turn: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="ttt-app">
      <div className="ttt-container">
        <h1 className="ttt-title" aria-label="Tic Tac Toe heading">
          Tic Tac Toe
        </h1>

        <div
          className={`ttt-status ${winner ? 'ttt-status-win' : draw ? 'ttt-status-draw' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className={`badge ${winner ? 'badge-accent' : xIsNext ? 'badge-primary' : 'badge-secondary'}`}>
            {xIsNext && !winner && !draw ? (xIsNext ? 'X' : 'O') : winner ? '🏆' : '•'}
          </span>
          <span className="status-text">{statusText}</span>
        </div>

        <Board
          squares={squares}
          onClick={handleSquareClick}
          winningLine={line}
          disabled={!!winner}
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

import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Tic Tac Toe Frontend
 * - Interactive 3x3 board
 * - Two-player local gameplay (X and O)
 * - Single-player vs AI mode (toggleable)
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
 * Get list of empty indices.
 * @param {Array<string|null>} squares
 * @returns {number[]}
 */
function getAvailableMoves(squares) {
  const res = [];
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) res.push(i);
  }
  return res;
}

/**
 * Try to find a move that results in a win for the given player.
 * @param {Array<string|null>} squares
 * @param {'X'|'O'} player
 * @returns {number|null}
 */
function findWinningMove(squares, player) {
  for (const [a, b, c] of LINES) {
    const line = [squares[a], squares[b], squares[c]];
    const countPlayer = line.filter((v) => v === player).length;
    const countEmpty = line.filter((v) => v === null).length;
    if (countPlayer === 2 && countEmpty === 1) {
      if (!squares[a]) return a;
      if (!squares[b]) return b;
      if (!squares[c]) return c;
    }
  }
  return null;
}

/**
 * Basic AI move selection:
 * 1) Win if possible
 * 2) Block opponent's immediate win
 * 3) Take center if free
 * 4) Take a corner if free
 * 5) Otherwise take any available move
 * @param {Array<string|null>} squares
 * @param {'X'|'O'} aiMark
 * @returns {number|null}
 */
function chooseAiMove(squares, aiMark) {
  const humanMark = aiMark === 'X' ? 'O' : 'X';

  // 1) Try to win
  const winningMove = findWinningMove(squares, aiMark);
  if (winningMove !== null) return winningMove;

  // 2) Block human if they can win next
  const blockMove = findWinningMove(squares, humanMark);
  if (blockMove !== null) return blockMove;

  // 3) Take center
  if (squares[4] === null) return 4;

  // 4) Take a corner
  const corners = [0, 2, 6, 8].filter((i) => squares[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5) Any move
  const options = getAvailableMoves(squares);
  if (options.length) return options[Math.floor(Math.random() * options.length)];

  return null;
}

// PUBLIC_INTERFACE
export default function App() {
  /** Game state */
  const [squares, setSquares] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);

  /** Mode: false => Two Players, true => Player vs AI (Player is X, AI is O) */
  const [vsAI, setVsAI] = useState(false);

  // Derived state
  const { winner, line } = useMemo(() => calculateWinner(squares), [squares]);
  const draw = useMemo(() => !winner && isBoardFull(squares), [winner, squares]);

  // When in AI mode and it's AI's turn, make an AI move automatically
  useEffect(() => {
    if (!vsAI) return;              // only in AI mode
    if (winner || draw) return;     // stop if game over
    if (xIsNext) return;            // AI is 'O' and plays on O's turn

    // Slight delay to feel natural
    const t = setTimeout(() => {
      setSquares((prev) => {
        // Double-check within updater in case of rapid changes
        const { winner: w } = calculateWinner(prev);
        if (w) return prev;
        const idx = chooseAiMove(prev, 'O');
        if (idx === null || prev[idx]) return prev;
        const copy = prev.slice();
        copy[idx] = 'O';
        return copy;
      });
      setXIsNext(true);
    }, 350);

    return () => clearTimeout(t);
  }, [vsAI, xIsNext, winner, draw]);

  // PUBLIC_INTERFACE
  function handleSquareClick(index) {
    // Ignore clicks if occupied or game over
    if (squares[index] || winner) return;

    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);

    // In AI mode: if human (X) just moved, toggle to AI; otherwise normal toggle
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function toggleMode() {
    // Switching modes resets the game for clarity
    setVsAI((prev) => !prev);
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
          <span className="status-text">
            {statusText} {vsAI ? '(vs AI)' : '(2 Players)'}
          </span>
        </div>

        <Board
          squares={squares}
          onClick={handleSquareClick}
          winningLine={line}
          // Disable only when the game is over or when it's AI's turn in AI mode
          disabled={!!winner || (vsAI && !xIsNext)}
        />

        <div className="ttt-controls" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={toggleMode} aria-label="Toggle game mode">
            {vsAI ? 'Switch to 2 Players' : 'Play vs AI'}
          </button>
          <button className="btn btn-reset" onClick={resetGame} aria-label="Reset game">
            Reset Game
          </button>
        </div>

        <footer className="ttt-footer">
          <span className="legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-x">X</span> {vsAI ? 'You' : 'Player X'}
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-o">O</span> {vsAI ? 'AI' : 'Player O'}
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
      data-content={value || ''}
    >
      {/* Using CSS :after to render data-content keeps layout consistent */}
    </button>
  );
}

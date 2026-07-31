import React from 'react';
import MondrianBoard from './Vis/Board';
import BoardState from './Solver/BoardState';
import Controller from './Solver/SolverController';
import Levels from './Solver/Levels';
import PieceRegistry from './Solver/PieceRegistry';
import PieceTray from './Vis/PieceTray';
import { PuzzleGenerator } from './Solver/PuzzleGenerator';

type AppProps = {};
type AppState = {
  boardState: BoardState;
  gameMode: 'setup' | 'play' | 'solving';
  selectedLevelId: number; // 0 = Custom, 1-5 = Levels
  selectedPieceIndex: number | null;
  rotationState: boolean;
  hoveredCell: { x: number; y: number } | null;
  darkMode: boolean;
  
  // Solver running stats
  solverTries: number;
  openSpawns: number;
  isWon: boolean;
  isImpossible: boolean;
};

class App extends React.Component<AppProps, AppState> {
  boardState: BoardState;
  controller: Controller;
  solverInterval: any = null;

  constructor(props: AppProps) {
    super(props);

    this.boardState = new BoardState();
    this.controller = new Controller();

    // Default to dark mode as index.html has lang="en" class="dark"
    const isDark = document.documentElement.classList.contains('dark') || true;

    this.state = {
      boardState: this.boardState,
      gameMode: 'setup',
      selectedLevelId: 0,
      selectedPieceIndex: null,
      rotationState: false,
      hoveredCell: null,
      darkMode: isDark,
      solverTries: 0,
      openSpawns: 0,
      isWon: false,
      isImpossible: false
    };
  }

  componentDidMount() {
    // Add global keypress listener for rotation
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    this.clearSolverInterval();
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e: KeyboardEvent) {
    if ((e.key === 'r' || e.key === 'R') && this.state.selectedPieceIndex !== null) {
      this.handleToggleRotation();
    }
  }

  clearSolverInterval() {
    if (this.solverInterval) {
      clearInterval(this.solverInterval);
      this.solverInterval = null;
    }
  }

  toggleTheme() {
    const isDark = !this.state.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.setState({ darkMode: isDark });
  }

  handleLevelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const levelId = parseInt(e.target.value);
    this.clearSolverInterval();
    this.controller.stopSolving();

    const newBoard = new BoardState();
    if (levelId > 0) {
      const level = Levels[levelId - 1];
      level.blocked.forEach(cell => {
        newBoard.toggleBlocked(cell.x, cell.y);
      });
      
      this.setState({
        boardState: newBoard,
        gameMode: 'play',
        selectedLevelId: levelId,
        selectedPieceIndex: null,
        rotationState: false,
        hoveredCell: null,
        isWon: false,
        isImpossible: false,
        solverTries: 0,
        openSpawns: 0
      });
    } else {
      this.setState({
        boardState: newBoard,
        gameMode: 'setup',
        selectedLevelId: 0,
        selectedPieceIndex: null,
        rotationState: false,
        hoveredCell: null,
        isWon: false,
        isImpossible: false,
        solverTries: 0,
        openSpawns: 0
      });
    }
  }

  handleCellClick(x: number, y: number) {
    const { gameMode, selectedPieceIndex, rotationState } = this.state;

    if (gameMode === 'setup') {
      const count = this.state.boardState.getBlockedCount();
      const isBlocked = this.state.boardState.fieldStates[y * 8 + x] === BoardState.IDX_BLOCKED;

      if (!isBlocked && count >= 6) {
        return;
      }

      this.state.boardState.toggleBlocked(x, y);
      this.setState({
        boardState: this.state.boardState
      });
    } else if (gameMode === 'play') {
      const idx = this.state.boardState.fieldStates[y * 8 + x];

      if (idx >= 0) {
        this.state.boardState.removePiece(idx);
        this.setState({
          boardState: this.state.boardState,
          selectedPieceIndex: idx,
          isWon: false
        });
      } else if (selectedPieceIndex !== null) {
        const piece = PieceRegistry[selectedPieceIndex];
        let w = piece.width;
        let h = piece.height;
        if (rotationState) {
          w = piece.height;
          h = piece.width;
        }

        const px = Math.min(x, 8 - w);
        const py = Math.min(y, 8 - h);

        const success = this.state.boardState.placePiece(selectedPieceIndex, px, py, rotationState);
        if (success) {
          const hasWon = this.checkWin();
          this.setState({
            boardState: this.state.boardState,
            selectedPieceIndex: null,
            isWon: hasWon
          });
        }
      }
    }
  }

  checkWin(): boolean {
    for (let i = 0; i < PieceRegistry.length; i++) {
      if (!this.state.boardState.isPiecePlaced(i)) return false;
    }
    return true;
  }

  handleSelectPiece(idx: number) {
    if (this.state.gameMode !== 'play') return;
    this.setState({
      selectedPieceIndex: idx
    });
  }

  handleToggleRotation() {
    this.setState(prev => ({
      rotationState: !prev.rotationState
    }));
  }

  handleCellMouseEnter(x: number, y: number) {
    if (this.state.gameMode !== 'play' || this.state.selectedPieceIndex === null) return;
    this.setState({
      hoveredCell: { x, y }
    });
  }

  handleCellMouseLeave() {
    this.setState({
      hoveredCell: null
    });
  }

  handleStartGame() {
    if (this.state.boardState.getBlockedCount() === 6) {
      this.setState({
        gameMode: 'play'
      });
    }
  }

  handleStartAutoSolve() {
    this.clearSolverInterval();
    this.controller.stopSolving();

    this.state.boardState.clearPlacements();
    this.setState({
      boardState: this.state.boardState,
      gameMode: 'solving',
      selectedPieceIndex: null,
      isWon: false,
      isImpossible: false
    });

    this.controller.startSolving(this.state.boardState);

    const self = this;
    this.solverInterval = setInterval(function() {
      const status = self.controller.getStatus();
      let board = status.isWon ? status.winningBoard : status.exampleState;
      if (board == null) board = self.state.boardState;

      self.setState({
        boardState: board,
        solverTries: status.placeTries,
        openSpawns: status.openSpawns,
        isWon: status.isWon,
        isImpossible: status.isImpossible
      });

      if (status.isWon || status.isImpossible) {
        self.clearSolverInterval();
      }
    }, 100);
  }

  handleStopSolving() {
    this.clearSolverInterval();
    this.controller.stopSolving();
    
    this.state.boardState.clearPlacements();
    this.setState({
      boardState: this.state.boardState,
      gameMode: 'play',
      isWon: false,
      isImpossible: false,
      solverTries: 0,
      openSpawns: 0
    });
  }

  handleReset() {
    this.clearSolverInterval();
    this.controller.stopSolving();

    const cleanBoard = this.state.boardState.copy();
    cleanBoard.clearPlacements();

    this.setState({
      boardState: cleanBoard,
      selectedPieceIndex: null,
      rotationState: false,
      isWon: false,
      isImpossible: false,
      solverTries: 0,
      openSpawns: 0
    });
  }

  handleClearAll() {
    this.clearSolverInterval();
    this.controller.stopSolving();
    
    this.setState({
      boardState: new BoardState(),
      gameMode: 'setup',
      selectedLevelId: 0,
      selectedPieceIndex: null,
      rotationState: false,
      isWon: false,
      isImpossible: false,
      solverTries: 0,
      openSpawns: 0
    });
  }

  handleGeneratePuzzle() {
    this.clearSolverInterval();
    this.controller.stopSolving();

    // Determine target difficulty
    let difficulty = 'Medium';
    if (this.state.selectedLevelId > 0) {
      difficulty = Levels[this.state.selectedLevelId - 1].difficulty;
    }

    const blockedCells = PuzzleGenerator.generate(difficulty);
    
    const newBoard = new BoardState();
    blockedCells.forEach(cell => {
      newBoard.toggleBlocked(cell.x, cell.y);
    });

    this.setState({
      boardState: newBoard,
      gameMode: 'play',
      selectedPieceIndex: null,
      rotationState: false,
      hoveredCell: null,
      isWon: false,
      isImpossible: false,
      solverTries: 0,
      openSpawns: 0
    });
  }

  render() {
    const { 
      boardState, 
      gameMode, 
      selectedLevelId, 
      selectedPieceIndex, 
      rotationState, 
      hoveredCell,
      isWon,
      isImpossible,
      solverTries,
      darkMode
    } = this.state;

    let hoveredPiecePreview = null;
    if (gameMode === 'play' && selectedPieceIndex !== null && hoveredCell) {
      const piece = PieceRegistry[selectedPieceIndex];
      let w = piece.width;
      let h = piece.height;
      if (rotationState) {
        w = piece.height;
        h = piece.width;
      }
      hoveredPiecePreview = {
        x: Math.min(hoveredCell.x, 8 - w),
        y: Math.min(hoveredCell.y, 8 - h),
        w,
        h,
        colorClass: piece.gradientClass
      };
    }

    const blockedCount = boardState.getBlockedCount();

    return (
      <div className="transition-colors duration-300 font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        
        {/* Header section */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3 transition-colors duration-300 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 via-yellow-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="font-heading font-extrabold text-white text-lg tracking-wider">M</span>
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-100 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Mondrian Blocks
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Interactive Puzzle & Solver</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl px-2 py-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">Level:</span>
                <select
                  value={selectedLevelId}
                  onChange={this.handleLevelChange.bind(this)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none border-none cursor-pointer pr-4"
                >
                  <option value="0" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Custom Level</option>
                  <option value="1" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Level 1: Beginner</option>
                  <option value="2" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Level 2: Easy</option>
                  <option value="3" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Level 3: Medium</option>
                  <option value="4" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Level 4: Hard</option>
                  <option value="5" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Level 5: Expert</option>
                </select>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={this.toggleTheme.bind(this)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl w-full mx-auto p-4 md:p-6 flex-grow flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
          
          {/* Left Column: Board and Controls */}
          <div className="flex flex-col items-center gap-6 w-full md:w-auto flex-shrink-0">
            
            {/* Interactive Grid Board */}
            <MondrianBoard
              boardState={boardState}
              onCellClick={this.handleCellClick.bind(this)}
              onCellMouseEnter={this.handleCellMouseEnter.bind(this)}
              onCellMouseLeave={this.handleCellMouseLeave.bind(this)}
              hoveredPiecePreview={hoveredPiecePreview}
            />

            {/* Context Controls card */}
            <div className="w-full max-w-[420px] bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              
              {/* Setup Mode Details */}
              {gameMode === 'setup' && (
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                    Please click on <span className="font-bold text-slate-900 dark:text-slate-100">6 fields</span> to block them. ({blockedCount}/6 blocked)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={this.handleStartGame.bind(this)}
                      disabled={blockedCount !== 6}
                      className={`flex-grow py-2 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95
                        ${blockedCount === 6 
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                          : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'}`}
                    >
                      🚀 Start Playing
                    </button>
                    <button
                      onClick={this.handleStartAutoSolve.bind(this)}
                      disabled={blockedCount !== 6}
                      className={`flex-grow py-2 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-95
                        ${blockedCount === 6 
                          ? 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20' 
                          : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'}`}
                    >
                      🤖 Auto Solve
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={this.handleGeneratePuzzle.bind(this)}
                      className="w-full py-2 px-4 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all animate-pulse-subtle"
                    >
                      ✨ Auto-Generate ({selectedLevelId > 0 ? Levels[selectedLevelId - 1].difficulty : 'Medium'})
                    </button>
                  </div>
                </div>
              )}

              {/* Play Mode Details */}
              {gameMode === 'play' && (
                <div className="flex flex-col gap-3">
                  {isWon ? (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-center text-sm font-bold shadow-sm">
                      🎉 Puzzle Solved! You did it!
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                      {selectedPieceIndex === null ? (
                        <span>Select a block from the registry, then click the board to place it. <br/>Tip: Click a placed block on the board to remove it.</span>
                      ) : (
                        <span>Placing piece ({PieceRegistry[selectedPieceIndex].width}x{PieceRegistry[selectedPieceIndex].height}). <br/>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono border dark:border-slate-700">R</kbd> or click rotate button to rotate.</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={this.handleReset.bind(this)}
                      className="flex-grow py-2 px-3 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    >
                      🔄 Reset Level
                    </button>
                    <button
                      onClick={this.handleStartAutoSolve.bind(this)}
                      className="flex-grow py-2 px-3 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      🤖 Auto Solve
                    </button>
                    {selectedLevelId === 0 && (
                      <button
                        onClick={this.handleClearAll.bind(this)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      >
                        🗑️ Reset Grid
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={this.handleGeneratePuzzle.bind(this)}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      ✨ Auto-Generate ({selectedLevelId > 0 ? Levels[selectedLevelId - 1].difficulty : 'Medium'})
                    </button>
                  </div>
                </div>
              )}

              {/* Solving Mode Details */}
              {gameMode === 'solving' && (
                <div className="flex flex-col gap-3">
                  <div className="text-center">
                    {isWon ? (
                      <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm font-bold shadow-sm">
                        🤖 Solution Found! Checked {solverTries} combinations.
                      </div>
                    ) : isImpossible ? (
                      <div className="bg-red-500/15 border border-red-500/30 text-red-500 p-3 rounded-xl text-sm font-bold shadow-sm">
                        ❌ Impossible! No solution exists. Checked {solverTries} moves.
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 animate-pulse">
                          Calculating solutions...
                        </div>
                        <div className="text-xs text-slate-500">
                          Tried {solverTries} combinations
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={this.handleStopSolving.bind(this)}
                    className="w-full py-2 px-4 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 active:scale-95 transition-all"
                  >
                    ⏹️ Stop Solver
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Piece Registry */}
          <div className="w-full md:max-w-md flex-grow">
            <PieceTray
              boardState={boardState}
              selectedPieceIndex={selectedPieceIndex}
              onSelectPiece={this.handleSelectPiece.bind(this)}
              rotationState={rotationState}
              onToggleRotation={this.handleToggleRotation.bind(this)}
            />
          </div>

        </main>

        {/* Footer info */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/30 py-4 px-4 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              Mondrian Solver is open-source. Fork or visit the project on{' '}
              <a 
                href="https://github.com/ibrezm1/Madorian-generator-solver" 
                target="_blank" 
                rel="noreferrer"
                className="underline hover:text-slate-800 dark:hover:text-slate-300 font-semibold"
              >
                GitHub
              </a>
            </div>
            <div>
              Adapted UI reference from{' '}
              <a 
                href="https://github.com/ibrezm1/LogicPuzzle" 
                target="_blank" 
                rel="noreferrer"
                className="underline hover:text-slate-800 dark:hover:text-slate-300 font-semibold"
              >
                LogicPuzzle
              </a>
            </div>
          </div>
        </footer>

      </div>
    );
  }
}

export default App;

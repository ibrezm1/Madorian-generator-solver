import React from 'react';
import PieceRegistry from '../Solver/PieceRegistry';
import BoardState from '../Solver/BoardState';

type PieceTrayProps = {
    boardState: BoardState;
    selectedPieceIndex: number | null;
    onSelectPiece: (idx: number) => void;
    rotationState: boolean; // true = rotated 90 degrees
    onToggleRotation: () => void;
};

const PieceTray: React.FC<PieceTrayProps> = ({
    boardState,
    selectedPieceIndex,
    onSelectPiece,
    rotationState,
    onToggleRotation
}) => {
    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                <h3 className="font-heading font-bold text-sm tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                    Piece Registry
                </h3>
                {selectedPieceIndex !== null && (
                    <button
                        onClick={onToggleRotation}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                        🔄 Rotate Selected ({rotationState ? '90°' : '0°'})
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto custom-scroll pr-1">
                {PieceRegistry.map((piece, idx) => {
                    const isPlaced = boardState.isPiecePlaced(idx);
                    const isSelected = selectedPieceIndex === idx;
                    
                    let w = piece.width;
                    let h = piece.height;
                    if (isSelected && rotationState) {
                        w = piece.height;
                        h = piece.width;
                    }

                    const cells = [];
                    for (let i = 0; i < w * h; i++) {
                        cells.push(
                            <div 
                                key={i} 
                                className={`rounded-[3px] shadow-sm block-3d bg-gradient-to-br ${piece.gradientClass} w-3 h-3 md:w-3.5 md:h-3.5`}
                            />
                        );
                    }

                    return (
                        <div
                            key={idx}
                            onClick={() => !isPlaced && onSelectPiece(idx)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer relative select-none
                                ${isPlaced 
                                    ? 'bg-slate-100 dark:bg-slate-900/30 border-slate-200 dark:border-slate-850 opacity-30 cursor-not-allowed' 
                                    : isSelected 
                                        ? 'bg-cyan-500/10 dark:bg-cyan-950/20 border-cyan-400 shadow-glow-cyan scale-102'
                                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/45 dark:hover:bg-slate-800/70 border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500 active:scale-98'
                                }`}
                        >
                            {isPlaced && (
                                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                                    <span className="text-emerald-500 font-bold text-lg drop-shadow-md select-none">✓</span>
                                </div>
                            )}

                            <div 
                                className="grid gap-0.5 pointer-events-none mb-2"
                                style={{
                                    gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))`
                                }}
                            >
                                {cells}
                            </div>

                            <span className="font-heading font-bold text-xs tracking-tight text-slate-700 dark:text-slate-300">
                                {piece.width} × {piece.height}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PieceTray;

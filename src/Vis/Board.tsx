import React from 'react';
import Field from './BoardField';
import BoardState from '../Solver/BoardState';

type MondrianBoardProps = {
    boardState: BoardState;
    onCellClick: (x: number, y: number) => void;
    onCellMouseEnter?: (x: number, y: number) => void;
    onCellMouseLeave?: () => void;
    hoveredPiecePreview?: {
        x: number;
        y: number;
        w: number;
        h: number;
        colorClass: string;
    } | null;
};

class MondrianBoard extends React.Component<MondrianBoardProps> {
    render() {
        const cells = [];
        const preview = this.props.hoveredPiecePreview;

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const idx = this.props.boardState.fieldStates[y * 8 + x];
                
                // Determine if this cell falls under the placement preview
                let isPreviewCell = false;
                if (preview) {
                    const { x: px, y: py, w: pw, h: ph } = preview;
                    if (x >= px && x < px + pw && y >= py && y < py + ph) {
                        isPreviewCell = true;
                    }
                }

                cells.push(
                    <Field
                        key={`${x}.${y}`}
                        x={x}
                        y={y}
                        idx={idx}
                        isPreviewCell={isPreviewCell}
                        previewColorClass={preview ? preview.colorClass : ''}
                        onClick={this.props.onCellClick}
                        onMouseEnter={this.props.onCellMouseEnter}
                        onMouseLeave={this.props.onCellMouseLeave}
                    />
                );
            }
        }

        return (
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-slate-200 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 p-3 md:p-4 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/50">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 md:gap-1.5 relative rounded-2xl overflow-hidden bg-slate-350 dark:bg-slate-950 shadow-[inset_0_4px_12px_0_rgba(0,0,0,0.5)]">
                    {cells}
                </div>
            </div>
        );
    }
}

export default MondrianBoard;
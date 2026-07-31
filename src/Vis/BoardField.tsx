import React from 'react';
import BoardState from '../Solver/BoardState';
import PieceRegistry from '../Solver/PieceRegistry';

type FieldProps = {
    x: number;
    y: number;
    idx: number;
    isPreviewCell: boolean;
    previewColorClass: string;
    onClick: (x: number, y: number) => void;
    onMouseEnter?: (x: number, y: number) => void;
    onMouseLeave?: () => void;
};

class MondrianBoardField extends React.Component<FieldProps> {
    onClick() {
        this.props.onClick(this.props.x, this.props.y);
    }

    render() {
        const { idx, isPreviewCell, onMouseEnter, onMouseLeave, x, y } = this.props;

        // Base slot styling
        let classes = "w-full h-full rounded-md transition-all duration-200 cursor-pointer select-none flex items-center justify-center ";

        if (idx === BoardState.IDX_BLOCKED) {
            // Locked black puzzle blocks
            classes += "block-3d-locked bg-gradient-to-br from-slate-700 to-slate-900 bg-slate-800 text-white z-10 border border-slate-700 shadow-inner";
        } else if (idx >= 0) {
            // Placed colored pieces
            const piece = PieceRegistry[idx];
            classes += `block-3d bg-gradient-to-br ${piece.gradientClass} z-20 text-white border border-black/10`;
        } else if (isPreviewCell) {
            // Hover preview cell
            classes += `bg-cyan-500/25 border-2 border-dashed border-cyan-400 shadow-glow-cyan z-30 scale-95`;
        } else {
            // Empty grid slot
            classes += "border-[0.5px] border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/15 hover:bg-slate-200/50 dark:hover:bg-slate-800/40";
        }

        return (
            <div
                onClick={this.onClick.bind(this)}
                onMouseEnter={() => onMouseEnter && onMouseEnter(x, y)}
                onMouseLeave={() => onMouseLeave && onMouseLeave()}
                className={classes}
                style={{
                    gridColumn: `${x + 1}`,
                    gridRow: `${y + 1}`
                }}
            >
                {idx === BoardState.IDX_BLOCKED && (
                    <span className="text-[10px] select-none pointer-events-none opacity-60">
                        🔒
                    </span>
                )}
            </div>
        );
    }
}

export default MondrianBoardField;
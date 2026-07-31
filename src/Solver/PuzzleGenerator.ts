import BoardState from './BoardState';
import PieceRegistry from './PieceRegistry';

export class PuzzleGenerator {
    
    // Check if the board is solvable, and return the number of tries taken
    static solveSync(state: BoardState): { solved: boolean; tries: number } {
        let tries = 0;
        const maxTries = 120000; // Safety limit
        
        function processPieceSync(idx: number, currentBoard: BoardState): boolean {
            if (idx === PieceRegistry.length) {
                return true; // Solved
            }
            
            for (let rotated = 0; rotated < 2; rotated++) {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        tries++;
                        if (tries > maxTries) return false;

                        let nextBoard = currentBoard.copy();
                        if (nextBoard.placePiece(idx, x, y, !!rotated)) {
                            if (processPieceSync(idx + 1, nextBoard)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        
        const cleanBoard = state.copy();
        cleanBoard.clearPlacements();
        const solved = processPieceSync(0, cleanBoard);
        return { solved, tries };
    }

    // Generate a random solvable candidate puzzle (coordinates of 6 empty spaces)
    static generateCandidate(): { x: number; y: number }[] | null {
        const board = new BoardState();
        
        function placeRandomly(idx: number): boolean {
            if (idx === PieceRegistry.length) {
                return true;
            }
            
            // List all 128 positions & rotations
            const options: { x: number; y: number; rotated: boolean }[] = [];
            for (let rotated = 0; rotated < 2; rotated++) {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        options.push({ x, y, rotated: !!rotated });
                    }
                }
            }
            
            // Shuffle
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = options[i];
                options[i] = options[j];
                options[j] = temp;
            }
            
            for (const opt of options) {
                const nextBoard = board.copy();
                if (nextBoard.placePiece(idx, opt.x, opt.y, opt.rotated)) {
                    const originalGrid = board.fieldStates.slice();
                    board.fieldStates = nextBoard.fieldStates;
                    if (placeRandomly(idx + 1)) {
                        return true;
                    }
                    board.fieldStates = originalGrid; // backtrack
                }
            }
            return false;
        }
        
        if (placeRandomly(0)) {
            const emptyCells: { x: number; y: number }[] = [];
            for (let i = 0; i < 64; i++) {
                if (board.fieldStates[i] === BoardState.IDX_EMPTY) {
                    emptyCells.push({ x: i % 8, y: Math.floor(i / 8) });
                }
            }
            return emptyCells;
        }
        return null;
    }

    // Generate puzzle coordinates matching the target difficulty
    static generate(difficulty: string): { x: number; y: number }[] {
        let attempts = 0;
        let bestCandidate: { x: number; y: number }[] | null = null;
        let bestDiffDistance = Infinity;

        // Difficulty boundaries based on solveSync placement tries
        const difficultyRanges: { [key: string]: { min: number; max: number } } = {
            'Beginner': { min: 1, max: 800 },
            'Easy': { min: 801, max: 4000 },
            'Medium': { min: 4001, max: 15000 },
            'Hard': { min: 15001, max: 60000 },
            'Expert': { min: 60001, max: Infinity }
        };

        const targetRange = difficultyRanges[difficulty] || { min: 1, max: Infinity };

        while (attempts < 50) {
            attempts++;
            const candidate = this.generateCandidate();
            if (!candidate) continue;

            // Load candidate coordinates into a board state to test solvability
            const testBoard = new BoardState();
            candidate.forEach(c => testBoard.toggleBlocked(c.x, c.y));

            const result = this.solveSync(testBoard);
            if (result.solved) {
                // If it falls within target range, return it immediately
                if (result.tries >= targetRange.min && result.tries <= targetRange.max) {
                    return candidate;
                }

                // Otherwise, track the closest candidate in case we reach max attempts
                let dist = 0;
                if (result.tries < targetRange.min) {
                    dist = targetRange.min - result.tries;
                } else if (result.tries > targetRange.max) {
                    dist = result.tries - targetRange.max;
                }

                if (dist < bestDiffDistance) {
                    bestDiffDistance = dist;
                    bestCandidate = candidate;
                }
            }
        }

        // Return best matching candidate found or a fallback if none found
        return bestCandidate || [
            { x: 0, y: 0 }, { x: 7, y: 0 }, { x: 0, y: 7 }, { x: 7, y: 7 }, { x: 3, y: 3 }, { x: 4, y: 4 }
        ];
    }
}

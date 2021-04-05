import BoardState from './BoardState';
import PieceRegistry from './PieceRegistry';

class SolverController {
    exampleState:BoardState|null = null;
    isWon:boolean = false;
    isImpossible:boolean = false;
    winningBoard:BoardState|null = null;
    placeTryCounter = 0;

    startSolving(state:BoardState) {
        this.isWon = false;
        this.isImpossible = false;
        this.winningBoard = null;

        this.processPiece(0, state);
    }

    getStatus() {
        return {
            exampleState: this.exampleState,
            isWon: this.isWon,
            isImpossible: this.isImpossible,
            winningBoard: this.winningBoard,
            placeTries: this.placeTryCounter
        };
    }

    processPiece(idx:number, state:BoardState) {
        let self = this;
        let localState = state.copy();
        for (var rotated = 0; rotated < 2; rotated++) {
            for (var x = 0; x < 8; x++) {
                for (var y = 0; y < 8; y++) {
                    this.placeTryCounter++;

                    // Try if we can place it here
                    if (localState.placePiece(idx, x, y, !!rotated)) {
                        // We could place it - if we were the last part, we have won!
                        if (idx == PieceRegistry.length-1) {
                            this.isWon = true;
                            this.winningBoard = localState;
                        }
                        // We are not the last piece - mark a run for the next piece from the
                        // new local board, then reset the board and try the next configuration.
                        else {
                            this.spawnNextPiece(idx+1, localState);
                            this.exampleState = localState;
                            localState = state.copy();
                        }
                    }
                }
            }
        }
    }

    spawnNextPiece(newIdx:number, newState:BoardState) {
        var self = this;
        setTimeout(function(){
            self.processPiece(newIdx, newState);
        }, 50);
    }
};

export default SolverController;
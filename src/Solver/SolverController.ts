import BoardState from './BoardState';
import PieceRegistry from './PieceRegistry';

class SolverController {
    exampleState:BoardState|null = null;
    isWon:boolean = false;
    isImpossible:boolean = false;
    winningBoard:BoardState|null = null;
    placeTryCounter = 0;
    openSpawns = 0;
    currentSessionId = 0;

    startSolving(state:BoardState) {
        this.isWon = false;
        this.isImpossible = false;
        this.winningBoard = null;
        this.placeTryCounter = 0;
        this.openSpawns = 0;
        this.currentSessionId++;

        let cleanState = state.copy();
        cleanState.clearPlacements();

        this.processPiece(0, cleanState, this.currentSessionId);
    }

    stopSolving() {
        this.currentSessionId++;
        this.isWon = false;
        this.isImpossible = false;
        this.winningBoard = null;
        this.openSpawns = 0;
    }

    getStatus() {
        return {
            exampleState: this.exampleState,
            isWon: this.isWon,
            isImpossible: this.isImpossible,
            winningBoard: this.winningBoard,
            placeTries: this.placeTryCounter,
            openSpawns: this.openSpawns
        };
    }

    processPiece(idx:number, state:BoardState, sessionId:number) {
        if (sessionId !== this.currentSessionId || this.isWon) return;

        let localState = state.copy();
        for (var rotated = 0; rotated < 2; rotated++) {
            for (var x = 0; x < 8; x++) {
                for (var y = 0; y < 8; y++) {
                    if (sessionId !== this.currentSessionId || this.isWon) return;
                    this.placeTryCounter++;

                    // Try if we can place it here
                    if (localState.placePiece(idx, x, y, !!rotated)) {
                        // We could place it - if we were the last part, we have won!
                        if (idx === PieceRegistry.length-1) {
                            this.isWon = true;
                            this.winningBoard = localState;
                        }
                        // We are not the last piece - mark a run for the next piece from the
                        // new local board, then reset the board and try the next configuration.
                        else {
                            this.spawnNextPiece(idx+1, localState, sessionId);
                            this.exampleState = localState;
                            localState = state.copy();
                        }
                    }
                }
            }
        }
    }

    spawnNextPiece(newIdx:number, newState:BoardState, sessionId:number) {
        let self = this;
        this.openSpawns++;
        setTimeout(function(){
            if (sessionId !== self.currentSessionId) {
                self.openSpawns--;
                return;
            }
            self.processPiece(newIdx, newState, sessionId);
            self.openSpawns--;

            if (self.openSpawns < 1 && !self.isWon) {
                self.isImpossible = true;
            }
        }, 50);
    }
};

export default SolverController;
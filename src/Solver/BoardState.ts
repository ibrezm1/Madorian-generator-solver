import PieceRegistry from './PieceRegistry';

class BoardState {
    public fieldStates: number[];

    public static readonly IDX_BLOCKED = -2;
    public static readonly IDX_EMPTY = -1;

    constructor(fs?:number[]) {

        if (fs) {
            this.fieldStates = fs;
            if (this.fieldStates.length !== 64)
                throw new Error("Invalid state passed to BoardState constructor - must be 64 fields, got "+fs.length+" instead.");
        } else {
            this.fieldStates = new Array<number>(64);
            for (let i = 0; i < 64; i++) this.fieldStates[i] = BoardState.IDX_EMPTY;
        }
    }

    copy():BoardState {
        return new BoardState(this.fieldStates.slice());
    }

    /**
     * Tries to place the piece with index pieceIndex in the PieceRegistry at position x/y.
     * If rotated is true, the piece is rotated by 90°. If the placement fails, return false and changes nothing.
     * @param pieceIndex Index of the piece definition in the PieceRegistry.
     * @param x x coordinate on the board - 0-7.
     * @param y y coordinate on the board - 0-7.
     * @param rotated If true, the piece is rotated 90° compared to definition.
     * @returns True if the piece could be placed, false otherwise (off board or already occupied)
     */
    placePiece(pieceIndex:number, x:number, y:number, rotated:boolean=false):boolean {

        // Get width and height and then rotate if necessary
        let w = PieceRegistry[pieceIndex].width;
        let h = PieceRegistry[pieceIndex].height;
        if (rotated) {
            let tmp = w;
            w = h;
            h = tmp;
        }

        // Check that we do not fall of the board!
        if (x+w-1 > 7) return false;
        if (y+h-1 > 7) return false;

        // Check that all fields we will occupy are empty
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                if (this.fieldStates[(y+j)*8 + (x+i)] !== BoardState.IDX_EMPTY)
                    return false;
            }
        }

        // Write the fields
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.fieldStates[(y+j)*8 + (x+i)] = pieceIndex;
            }
        }

        return true;
    }

    toggleBlocked(x:number, y:number):void {
        let idx = (y*8) + x;
        if (this.fieldStates[idx] === BoardState.IDX_BLOCKED) {
            this.fieldStates[idx] = BoardState.IDX_EMPTY;
        } else {
            this.fieldStates[idx] = BoardState.IDX_BLOCKED;
        }
    }

    getBlockedCount():number {
        let c = 0;
        for (let i = 0; i < 64; i++) {
            if (this.fieldStates[i] === BoardState.IDX_BLOCKED)
                c++;
        }
        return c;
    }

    removePiece(pieceIndex:number):void {
        for (let i = 0; i < 64; i++) {
            if (this.fieldStates[i] === pieceIndex) {
                this.fieldStates[i] = BoardState.IDX_EMPTY;
            }
        }
    }

    clearPlacements():void {
        for (let i = 0; i < 64; i++) {
            if (this.fieldStates[i] >= 0) {
                this.fieldStates[i] = BoardState.IDX_EMPTY;
            }
        }
    }

    isPiecePlaced(pieceIndex:number):boolean {
        for (let i = 0; i < 64; i++) {
            if (this.fieldStates[i] === pieceIndex) {
                return true;
            }
        }
        return false;
    }

};

export default BoardState;
import React from 'react';
import Field from './BoardField';
import BoardState from '../Solver/BoardState';

class MondrianBoard extends React.Component<{boardState:BoardState,onCellClick:any}> {
    render() {

       let rows = [];
        for (var y = 0; y < 8; y++) {
            let cells = [];
            for (var x = 0; x < 8; x++) {
                cells.push(<Field key={x+"."+y} x={x} y={y} idx={this.props.boardState.fieldStates[(y*8)+x]} onClick={this.props.onCellClick} />);
            }
            rows.push(<tr key={y}>{cells}</tr>);
        }
        return <table className="gameboard"><tbody>
            {rows}
        </tbody></table>;
    }
}

export default MondrianBoard;
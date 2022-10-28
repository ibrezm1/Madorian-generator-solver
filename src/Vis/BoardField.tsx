import React from 'react';
import BoardState from '../Solver/BoardState';
import PieceRegistry from '../Solver/PieceRegistry';

class MondrianBoardField extends React.Component<{x:number,y:number,idx:number,onClick:any}> {

    onClick() {
        this.props.onClick(this.props.x, this.props.y);
    }

    calculateCSS(): object {
        if (this.props.idx === BoardState.IDX_BLOCKED)
            return {backgroundColor: "#333"};
        else if (this.props.idx >= 0)
            return {backgroundColor: PieceRegistry[this.props.idx].color};

        return {};
    }

    render() {
        return <td onClick={this.onClick.bind(this)} style={this.calculateCSS()}>
            
        </td>;
    }
}

export default MondrianBoardField;
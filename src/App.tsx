import React from 'react';
import MondrianBoard from './Vis/Board';
import './App.css';
import BoardState from './Solver/BoardState';
import Controller from './Solver/SolverController';

type AppProps = {
};
type AppState = {
  boardState:BoardState,
  isInteractive:boolean,
  index:number
  isWon:boolean
};

class App extends React.Component<AppProps,AppState> {

  boardState:BoardState;
  controller:Controller;

  constructor(props:AppProps) {
    super(props);

    this.boardState = new BoardState()
    this.controller = new Controller();

    this.state = {
      boardState: this.boardState,
      isInteractive: true,
      index: 0,
      isWon: false
    };
  }

  handleCellClick (x:number, y:number) {
    if (!this.state.isInteractive) return;

    this.boardState.toggleBlocked(x, y);
    this.setState({
      boardState: this.boardState
    });
  }

  handleStartClick () {
    if (!this.state.isInteractive) return;

    this.controller.startSolving(this.boardState);
    let self = this;
    setInterval(function(){
      let board = self.controller.isWon ? self.controller.winningBoard : self.controller.exampleState;
      if (board == null) board = self.boardState;
      self.setState({index: self.controller.placeTryCounter, boardState: board, isWon: self.controller.isWon});
    }, 250);

    this.setState({
      isInteractive: false
    });
  }

  render(){
    let board = <MondrianBoard boardState={this.state.boardState} onCellClick={this.handleCellClick.bind(this)} />;

    let footer = <div className="explanation">Please click on the <b>6 fields</b> that are blocked in your puzzle.</div>;
    if (!this.state.isInteractive) {
      if (!this.state.isWon)
        footer = <div className="explanation">Calculating - trying combination {this.state.index}.</div>;
      else
        footer = <div className="explanation"><b>Solution found!</b> Tried {this.state.index} combinations.</div>;
    }
    else if (this.boardState.getBlockedCount() === 6)
      footer = <button onClick={this.handleStartClick.bind(this)}>Solve this Mondrian!</button>;
    
    return (
      <div className="App">
        {board}
        {footer}
      </div>
    );
  }
}

export default App;

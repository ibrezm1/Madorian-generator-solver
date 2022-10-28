import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <h1>Mondrian Solver</h1>
    <p>
      Use this tiny web application to solve Mondrian Blocks Puzzles (<a target="_blank" rel="noreferrer" href="https://www.amazon.de/Mondrian-Blocks-Winning-Kompaktes-Reisespiel/dp/B083XWNTZ5">link to the game on Amazon.de</a>).
    </p>
    <p>
      Click on the fields that are occupied by the black pieces in the puzzle description and let your web browser brute force a solution for you.
    </p>
    <p>
      You can always <a onClick={() => {window.location.reload(); return false}} href="/">restart</a>.
    </p>
    <App />
    <p className="footer">
      Brought to you by <a href="https://cottleston.io" target="_blank" rel="noreferrer">Steffen Müller</a> because he was frustrated by the puzzles.
      This app is open source, feel free to <a href="https://gitlab.com/cottleston/mondrian-solver" target="_blank" rel="noreferrer">visit its Git repository</a>.
    </p>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [actionLog, setActionLog] = useState([]);
  const [gameId, setGameId] = useState('');
  const [isNext, setIsNext] = useState('crosses');

  useEffect(() => {
    axios
      .get('http://localhost:5000/')
      .then((res) => {
        if (res.data) {
          setGameId(res.data._id);
          res.data.moves.forEach((move) => {
            fillBoard(move);
            setActionLog((actionLog) => [
              ...actionLog,
              move.who + ' made move to field ' + move.fieldNr,
            ]);
          });
        }
      })
      .catch((err) => {
        setActionLog([...actionLog, err.response.data]);
      });
  }, []);

  function fillBoard(move) {
    if (move.who === 'crosses') {
      setSquares((squares) => [...squares, (squares[move.fieldNr] = 'X')]);
      setIsNext('noughts');
    } else if (move.who === 'noughts') {
      setSquares((squares) => [...squares, (squares[move.fieldNr] = 'O')]);
      setIsNext('crosses');
    }
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => makeMove(i)}>
        {squares[i]}
      </button>
    );
  }

  function makeMove(fieldNr) {
    axios
      .put(
        'http://localhost:5000/move/' + isNext,
        { _id: gameId, fieldNr },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setGameId(res.data._id);

        const lastMove = res.data.moves[res.data.moves.length - 1];
        setActionLog((actionLog) => [
          ...actionLog,
          lastMove.who + ' made move to field ' + (lastMove.fieldNr + 1),
        ]);

        fillBoard(lastMove);

        if (res.data.winner) {
          setActionLog((actionLog) => [
            ...actionLog,
            'Winner is ' + res.data.winner,
          ]);
        } else if (res.data.draw) {
          setActionLog((actionLog) => [...actionLog, res.data.draw]);
        }
      })
      .catch((err) => {
        setActionLog([...actionLog, err.response.data]);
      });
  }

  function startNewGame() {
    axios
      .get('http://localhost:5000/start')
      .then((res) => {
        setSquares(Array(9).fill(null));
        setGameId(res.data._id);
        setActionLog((actionLog) => [...actionLog, 'New game...']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getAllActions() {
    axios
      .get('http://localhost:5000/all-actions')
      .then((res) => {
        res.data.forEach((game) => {
          setActionLog((actionLog) => [...actionLog, 'New game...']);
          game.moves.forEach((move) => {
            setActionLog((actionLog) => [
              ...actionLog,
              move.who + ' made move to field ' + (move.fieldNr + 1),
            ]);
          });
          if (res.data.winner) {
            setActionLog((actionLog) => [
              ...actionLog,
              'Winner is ' + res.data.winner,
            ]);
          } else if (res.data.draw) {
            setActionLog((actionLog) => [...actionLog, res.data.draw]);
          }
        });
      })
      .catch((err) => {});
  }

  return (
    <div className="App">
      <div className="container">
        <div className="game">
          {gameId ? (
            <div className="game-board">
              <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
              </div>
              <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
              </div>
              <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
              </div>
            </div>
          ) : (
            <p>To start game, click start game button!</p>
          )}
          <button className="start-new-game" onClick={startNewGame}>
            Start new game
          </button>
          <h4>Your actions</h4>
          <ul>
            {actionLog &&
              actionLog.map((action, index) => {
                return <li key={index}>{action}</li>;
              })}
          </ul>
          <button onClick={getAllActions}>Get all actions</button>
        </div>
      </div>
    </div>
  );
}

export default App;

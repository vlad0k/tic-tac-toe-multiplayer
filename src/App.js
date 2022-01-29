import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Table from "./components/Table";

const API_URL = "https://ttt-course-server.herokuapp.com";
const WS_URL = "wss://ttt-course-server.herokuapp.com/ws";

const INITIAl_TABLE = [null, null, null, null, null, null, null, null, null];

function App() {
  const [player, setPlayer] = useState(null);
  const [move, setMove] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameIds, setGameIds] = useState([]);
  const [table, setTable] = useState(INITIAl_TABLE);
  const [win, setWin] = useState(null);

  const handleStartGame = () => {
    axios.post(API_URL + "/start-game").then((response) => {
      const { gameId, player } = response.data;

      setPlayer(player);
      setGameId(gameId);
      setMove("X");
    });
  };

  const handleConnectGame = (event) => {
    event.preventDefault();
    const gameId = event.target.gameId.value;

    axios.post(API_URL + "/select-game", { gameId }).then((response) => {
      const { currentMove, gameId, player, table } = response.data;

      setPlayer(player);
      setGameId(gameId);
      setMove(currentMove);
      setTable(table);
    });
  };

  useEffect(() => {
    axios.get(API_URL + "/gameid-list").then((response) => {
      const gameIds = response.data;

      setGameIds(gameIds);
    });
  }, []);

  useEffect(() => {
    if (gameId) {
      const ws = new WebSocket(WS_URL + `/${gameId}`);

      ws.onopen = () => console.log("ws open");

      ws.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        console.log("ws message:", message);

        if (message.type === "TABLE") {
          setTable(message.table);
          setMove(message.currentMove);
        }
        if (message.type === "DRAW") {
          setWin("Round Draw!");
        }
        if (message.type === "WIN") {
          setWin(`Winner is ${message.winner}!`);
        }
      };
    }
  }, [gameId]);

  return (
    <div className="App">
      {player && gameId && move && (
        <div>
          <div>Player: {player}</div>
          <div>GameId: {gameId}</div>
          <div>Move: {move}</div>

          {win ? (
            <h1 style={{ color: "red" }}>{win}</h1>
          ) : (
            <Table
              table={table}
              currentMove={move}
              player={player}
              gameId={gameId}
              setTable={setTable}
            />
          )}
        </div>
      )}
      {!player && !gameId && !move && (
        <div>
          <button onClick={handleStartGame}>Start Game</button>

          <form onSubmit={handleConnectGame}>
            <select name="gameId">
              <option value="" default disabled>
                --- Select game ---
              </option>
              {gameIds.map((gameId) => {
                return (
                  <option key={gameId} value={gameId}>
                    {gameId}
                  </option>
                );
              })}
            </select>
            <button type="submit">Connect Game</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

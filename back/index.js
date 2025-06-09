const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

function getRandomLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

// Stockage en mémoire
const games = {};

io.on("connection", (socket) => {
  socket.on("get_id", () => {
    socket.emit("connected", socket.id);
  });

  socket.on("check_game", (gameId) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found");
    } else {
      socket.emit("game_found", true);
    }
  });

  socket.on("create_game", () => {
    const gameId = Math.random().toString(36).substr(2, 6);
    games[gameId] = {
      players: [],
      host: socket.id,
      responses: [],
      roundes: 0,
    };
    socket.join(gameId);
    socket.emit("game_created", gameId);
  });

  socket.on("join_game", ({ gameId, name }) => {
    if (games[gameId]) {
      // Ajoute le joueur a la liste des joueurs s'il n'y est pas déja
      const players = games[gameId].players;

      const idExists = players.some((player) => player.id === socket.id);
      const nameExists = players.some((player) => player.name === name);

      if (!idExists && !nameExists) {
        players.push({ id: socket.id, name });
      } else {
        socket.emit("error", "Name already taken or Is already joined");
      }

      socket.join(gameId);
      io.to(gameId).emit("player_joined", {
        options: games[gameId],
        player: socket.id,
      });
    } else {
      socket.emit("error", "Game not found");
    }
  });

  socket.on("start_game", (gameId) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    if (game.host === null) {
      game.host = socket.id;
    }

    if (game.host !== socket.id) {
      socket.emit("error", "Only the host can start the game");
      return;
    }

    if (game.state === "started") {
      socket.emit("error", "Game already started");
      return;
    }

    const letter = getRandomLetter();
    const duration = 60; // secondes

    game.state = "started";
    game.letter = letter;
    game.startTime = Date.now();
    game.duration = duration;
    game.roundes += 1;

    io.to(gameId).emit("game_started", games[gameId]);
  });

  socket.on("disconnect", () => {
    Object.keys(games).forEach((gameId) => {
      const game = games[gameId];

      // Trouver l'index du joueur à retirer
      const index = game.players.findIndex((player) => player.id === socket.id);

      // Retirer le joueur s'il est trouvé
      if (index !== -1) {
        game.players.splice(index, 1);

        // Optionnel : supprimer le jeu si plus de joueurs
        // if (game.players.length === 0) {
        //   delete games[gameId];
        // }

        // Informer les autres joueurs
        io.to(gameId).emit("player_quit", game);
      }
    });
  });

  socket.on("game_stop", (gameId) => {
    const game = games[gameId];
    if (!game) socket.emit("error", "Game not found");

    if (game.state === "started") {
      game.state = "stopped";
      io.to(gameId).emit("game_stopped", game);
    } else {
      socket.emit("error", "game not started or already stopped");
    }
  });

  socket.on("game_finished", (gameId) => {
    const game = games[gameId];
    if (!game) socket.emit("error", "Game not found");
    game.state = "finished";
    io.to(gameId).emit("game_stopped", game);
  });

  socket.on("submit_responses", ({ gameId, answers }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    const playerId = socket.id;

    // Déterminer le round actuel (index du dernier round en cours)
    let currentRoundIndex = game.roundes - 1;

    if (game.responses.length < game.roundes) {
      game.responses.push([{ id: playerId, answers }]);
    }

    const currentRound = game.responses[currentRoundIndex];

    const hasAlreadySubmitted = currentRound.some(
      (response) => response.id === socket.id
    );

    if (!hasAlreadySubmitted) {
      currentRound.push({ id: socket.id, answers });
    }

    // // Vérifie si tous les joueurs ont répondu pour ce round
    const allResponded =
      game.responses[currentRoundIndex].length === game.players.length;

    if (allResponded) {
      io.to(gameId).emit("all_responses_collected", game.responses);
    }
  });

  socket.on("vote_pos", ({ key, playerId, gameId }) => {
    const game = games[gameId];
    if (!game) return;

    const player = game.players.find((pl) => pl.id === playerId);
    if (!player) return;

    const roundIndex = Math.max(game.roundes - 1, 0);
    const currentRound = game.responses[roundIndex];

    const response = currentRound.find((res) => res.id === playerId);
    if (!response) return;

    const answer = response.answers[key];
    if (!answer || answer.vote.includes(socket.id)) return;

    answer.vote.push(socket.id);

    io.to(gameId).emit("vote", game.responses);
  });

  socket.on("vote_neg", ({ key, playerId, gameId }) => {
    const game = games[gameId];
    if (!game) return;

    const player = game.players.find((pl) => pl.id === playerId);
    if (!player) return;

    const roundIndex = Math.max(game.roundes - 1, 0);
    const currentRound = game.responses[roundIndex];

    const response = currentRound.find((res) => res.id === playerId);
    if (!response) return;

    const answer = response.answers[key];
    if (!answer) return;

    const voteIndex = answer.vote.indexOf(socket.id);
    if (voteIndex !== -1) {
      answer.vote.splice(voteIndex, 1);
      io.to(gameId).emit("vote", game.responses);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {});

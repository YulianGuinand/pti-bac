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
    console.log("Connected : ", socket.id);
    socket.emit("connected", socket.id);
  });

  socket.on("create_game", (name) => {
    const gameId = Math.random().toString(36).substr(2, 6);
    games[gameId] = {
      players: [{ id: socket.id, name }],
      host: socket.id,
      responses: [],
    };
    socket.join(gameId);
    socket.emit("game_created", gameId);

    console.log("CREATED : ", games[gameId]);
  });

  socket.on("join_game", ({ gameId, name }) => {
    console.log(gameId, name);
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

      console.log("JOINDED : ", games[gameId]);
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

    console.log("STARTED : ", games[gameId]);

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
      console.log("QUIT : ", game);
    });
  });

  socket.on("game_stop", (gameId) => {
    const game = games[gameId];
    if (!game) socket.emit("error", "Game not found");

    if (game.state === "started") {
      game.state = "stopped";
      console.log("STOPED : ", game);
      io.to(gameId).emit("game_stopped", game);
    } else {
      socket.emit("error", "game not started or already stopped");
    }
  });

  socket.on("game_finished", (gameId) => {
    const game = games[gameId];
    if (!game) socket.emit("error", "Game not found");
    game.state = "finished";
    console.log("FINISHED : ", game);
    io.to(gameId).emit("game_stopped", game);
  });

  socket.on("submit_responses", ({ gameId, answers }) => {
    const game = games[gameId];
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    if (game.responses.length === 0) {
      game.responses.push({});
    }

    if (typeof game.responses[game.responses.length - 1] !== "object") {
      game.responses[game.responses.length - 1] = {};
    }

    if (!game.players.include(socket.id)) {
      console.error(`Nom introuvable pour socket.id: ${socket.id}`);
      return;
    }

    game.responses[game.responses.length - 1][socket.id] = answers;

    console.log(game.responses);

    if (Object.keys(game.responses).length === game.players.length) {
      io.to(gameId).emit("all_responses_collected", game.responses);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "https://petit-bac-yulian.netlify.app",
  methods: ["*"],
};

app.use(cors(corsOptions));

const io = require("socket.io")(server, {
  cors: {
    origin: "https://petit-bac-yulian.netlify.app",
    methods: ["*"],
    transports: ["websocket"],
  },
});

function getRandomLetter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

// Stockage en mémoire
const games = {};

function updateLastModified(gameId) {
  if (games[gameId]) {
    games[gameId].lastUpdate = Date.now();
  }
}

cron.schedule("*/10 * * * * *", () => {
  const now = Date.now();
  const threshold = 60 * 1000 * 5; // 5 min

  for (const [gameId, game] of Object.entries(games)) {
    if (now - game.lastUpdate > threshold) {
      delete games[gameId];
      console.log("Game deleted due to inactivity : ", gameId);
      io.to(gameId).emit("game_deleted_due_to_inactivity");
    }
  }
});

io.on("connection", (socket) => {
  socket.on("get_id", () => {
    socket.emit("connected", socket.id);
  });

  socket.on("check_game", (gameId) => {
    const game = games[gameId];
    let isFound = true;
    if (!game) {
      isFound = false;
    }
    socket.emit("game_found", isFound);
  });

  socket.on("create_game", () => {
    const gameId = Math.random().toString(36).substr(2, 6);
    games[gameId] = {
      players: [],
      host: socket.id,
      responses: [],
      roundes: 0,
      lastUpdate: Date.now(),
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
      updateLastModified(gameId);
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
    updateLastModified(gameId);

    io.to(gameId).emit("game_started", games[gameId]);
  });

  socket.on("disconnect", () => {
    Object.keys(games).forEach((gameId) => {
      const game = games[gameId];

      const index = game.players.findIndex((player) => player.id === socket.id);

      if (index !== -1) {
        const wasHost = game.host === socket.id;

        // Retirer le joueur déconnecté
        game.players.splice(index, 1);

        // S'il n'y a plus de joueurs, on supprime la partie
        if (game.players.length === 0) {
          delete games[gameId];
          return;
        }

        // Si c'était le host, on attribue un nouveau host
        if (wasHost) {
          game.host = game.players[0].id; // Premier joueur restant devient host
        }
        updateLastModified(gameId);

        // Notifier les clients qu'un joueur a quitté
        io.to(gameId).emit("player_quit", game);
      }
    });
  });

  socket.on("round_stop", (gameId) => {
    const game = games[gameId];
    if (!game) socket.emit("error", "Game not found");

    if (game.state === "started") {
      game.state = "stopped";
      updateLastModified(gameId);
      io.to(gameId).emit("round_stopped", game);
    } else {
      socket.emit("error", "game not started or already stopped");
    }
  });

  socket.on("game_finish", (gameId) => {
    const game = games[gameId];
    if (!game) return socket.emit("error", "Game not found");

    game.state = "finished";
    const responses = game.responses;
    game.resultats = {};

    responses.forEach((round) => {
      const nbPlayerRound = round.length;
      const lettre = round.letter.toLowerCase(); // On suppose que round a une propriété lettre

      // Initialiser les résultats de chaque joueur
      const playerPoints = {};

      round.forEach((player) => {
        playerPoints[player.id] = 0;
      });

      const champs = [
        "prenom",
        "metier",
        "geographie",
        "marque",
        "animal",
        "aliment",
        "celebrite",
      ];

      champs.forEach((champ) => {
        // Pour détecter les doublons
        const valueMap = {}; // { "Wagner": [playerId1, playerId2] }

        round.forEach((player) => {
          const val = player.answers[champ]?.value?.trim().toLowerCase();
          if (val) {
            if (!valueMap[val]) valueMap[val] = [];
            valueMap[val].push(player.id);
          }
        });

        round.forEach((player) => {
          const answer = player.answers[champ];
          const val = answer?.value?.trim();
          if (!val || !val.toLowerCase().startsWith(lettre)) {
            return; // Pas de point si ça ne commence pas par la bonne lettre
          }

          const voteCount = answer.vote.length;
          const hasMajority = voteCount > nbPlayerRound / 2;

          if (hasMajority) {
            playerPoints[player.id] += 10;
          }

          const otherUsersSameAnswer = valueMap[val.toLowerCase()];
          if (otherUsersSameAnswer && otherUsersSameAnswer.length > 1) {
            // Attribuer +5 à chaque joueur ayant la même réponse
            otherUsersSameAnswer.forEach((id) => {
              playerPoints[id] += 5;
            });
          }
        });
      });

      // Stocker les résultats
      for (const [id, point] of Object.entries(playerPoints)) {
        const res = game.resultats[id];
        if (!res) {
          game.resultats[id] = point;
        } else {
          game.resultats[id] += point;
        }
      }
    });

    io.to(gameId).emit("game_results", game);
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

    currentRound.letter = game.letter.toLowerCase();
    const hasAlreadySubmitted = currentRound.some(
      (response) => response.id === socket.id
    );

    if (!hasAlreadySubmitted) {
      currentRound.push({ id: socket.id, answers });
    }

    // // Vérifie si tous les joueurs ont répondu pour ce round
    const allResponded =
      game.responses[currentRoundIndex].length === game.players.length;

    updateLastModified(gameId);
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

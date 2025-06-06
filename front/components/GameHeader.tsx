import socket from "../src/sockets";
import { Button } from "./ui/button";
import { CardAction, CardDescription, CardTitle } from "./ui/card";

interface GameHeaderProps {
  state: string;
  players: string[];
  isHoster: boolean;
  id: string;
}

const GameHeader = ({ state, players, isHoster, id }: GameHeaderProps) => {
  const handleStart = () => {
    socket.emit("start_game", id);
  };

  return (
    <>
      <CardTitle>
        {state === "started"
          ? "Round commencé"
          : state === "stopped"
          ? "Round arrêté"
          : "La partie n'a pas encore commencée"}
      </CardTitle>
      <CardDescription>
        Il y a {players?.length} joueur{players?.length > 1 ? "s" : ""} connecté
        {players?.length > 1 ? "s" : ""}
      </CardDescription>
      {isHoster && state !== "started" && (
        <CardAction>
          <Button variant="ghost" onClick={handleStart}>
            {state === "stopped" ? "Nouveau round" : "Demarrer la partie"}
          </Button>
        </CardAction>
      )}
    </>
  );
};

export default GameHeader;

import socket from "../src/sockets";
import GameHeader from "./GameHeader";
import { GameInputs } from "./GameInputs";
import { StartScreen } from "./StartScreen";
import { Button } from "./ui/button";
import { CardContent, CardFooter, CardHeader } from "./ui/card";

interface GameParams {
  letter: string;
  host: string;
  duration: number;
  startTime: number;
  state?: string;
  players: string[];
}

export const GamePanel = ({
  gameParams,
  userId,
  id,
  handleInputChange,
  champs,
}: {
  gameParams: GameParams;
  userId: string;
  id: string;
  handleInputChange: (champ: string, valeur: string) => void;
  champs: string[];
}) => {
  const handleStop = () => {
    socket.emit("game_stop", id);
  };

  return (
    <>
      <CardHeader>
        <GameHeader
          id={id}
          players={gameParams.players}
          isHoster={
            gameParams.host !== null ? gameParams.host === userId : true
          }
          state={gameParams.state!}
        />
      </CardHeader>
      {gameParams.state !== "started" ? (
        <StartScreen id={id} />
      ) : (
        <>
          <CardContent className="space-y-2">
            <GameInputs
              letter={gameParams.letter}
              champs={champs}
              handleInputChange={handleInputChange}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleStop}
              variant="destructive"
              className="w-full cursor-pointer"
            >
              Arrêter
            </Button>
          </CardFooter>
        </>
      )}
    </>
  );
};

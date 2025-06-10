import { useNavigate } from "react-router-dom";
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
  players: { id: string; name: string }[];
  resultats?: { [id: string]: number };
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
  const navigate = useNavigate();

  const handleStop = () => {
    socket.emit("round_stop", id);
  };

  const handleRestart = () => {
    navigate("/");
  };
  const handleFinish = () => {
    socket.emit("game_finish", id);
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
        gameParams.state !== "finished" ? (
          <>
            <StartScreen id={id} />
            {(
              gameParams?.host !== null ? gameParams?.host === userId : true
            ) ? (
              <CardFooter>
                <Button
                  onClick={handleFinish}
                  variant="destructive"
                  className="w-full"
                >
                  Arrêter la partie
                </Button>
              </CardFooter>
            ) : null}
          </>
        ) : (
          <>
            <CardContent>
              {gameParams.resultats && (
                <table className="table-auto w-full border border-gray-300 rounded-md">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="p-2 border-b">Joueur</th>
                      <th className="p-2 border-b">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(gameParams.resultats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([id, point]) => {
                        const player = gameParams.players.find(
                          (p) => p.id === id
                        );
                        return (
                          <tr key={id} className="even:bg-gray-100">
                            <td className="p-2 border-b">
                              {player?.name ?? "Joueur inconnu"}
                            </td>
                            <td className="p-2 border-b">{point}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleRestart} className="w-full cursor-pointer">
                Recommencer !
              </Button>
            </CardFooter>
          </>
        )
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
              Arrêter le round
            </Button>
          </CardFooter>
        </>
      )}
    </>
  );
};

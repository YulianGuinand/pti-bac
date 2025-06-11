import socket from "../src/sockets";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface AnswersType {
  prenom: { value: string; vote: string[] };
  metier: { value: string; vote: string[] };
  geographie: { value: string; vote: string[] };
  marque: { value: string; vote: string[] };
  animal: { value: string; vote: string[] };
  aliment: { value: string; vote: string[] };
  celebrite: { value: string; vote: string[] };
}

interface ResponsesType {
  id: string;
  answers: AnswersType;
}

export const GameResponse = ({
  responses,
  players,
  id,
  userId,
}: {
  responses: ResponsesType[][];
  players: { id: string; name: string }[];
  id: string;
  userId: string;
}) => {
  return responses.length > 0 ? (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Réponses</CardTitle>
          <CardDescription>
            Découvrez et décidez de la véracité des réponses des autres joueurs.
          </CardDescription>
        </CardHeader>
      </Card>
      {responses.map((round, index) => (
        <Card key={`ROUND-${index + 1}`} className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Round {index + 1}</CardTitle>
            <CardDescription>
              {round.length} joueur{round.length > 1 && "s"} ont joué durant
              cette manche.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {round.map((player, i) => {
              const playerInfo = players.find((el) => el.id === player.id);
              const name = playerInfo?.name || "Nom inconnu";
              const responses = player?.answers || {};

              const handleVotePositive = (key: string) => {
                socket.emit("vote_pos", {
                  key,
                  playerId: player.id,
                  gameId: id,
                });
              };

              const handleVoteNegative = (key: string) => {
                socket.emit("vote_neg", {
                  key,
                  playerId: player.id,
                  gameId: id,
                });
              };

              return (
                <div key={`${player.id}-${i}-${index}`} className="mb-2">
                  <h2 className="font-semibold mb-2">Joueur : {name}</h2>
                  <table className="min-w-full table-auto border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border-b text-left">
                          Catégorie
                        </th>
                        <th className="px-4 py-2 border-b text-left">
                          Réponse
                        </th>
                        <th className="px-4 py-2 border-b text-left">
                          Nombre de vote
                        </th>
                        <th className="px-4 py-2 border-b text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(responses).map(([key, value], index) => {
                        const votes = value.vote;

                        return (
                          <tr
                            key={`${key}-${value.value}-${index}-${player.id}`}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-2 border-b capitalize text-gray-600 font-medium">
                              {key}
                            </td>
                            <td className="px-4 py-2 border-b text-gray-800">
                              {value.value || "—"}
                            </td>
                            <td className="px-4 py-2 border-b text-gray-800">
                              {value.vote.length}
                            </td>
                            <td className="px-4 py-2 border-b text-gray-800 flex flex-row gap-2">
                              {votes.includes(userId!) ? (
                                <Button
                                  onClick={() => handleVoteNegative(key)}
                                  variant="destructive"
                                  className="cursor-pointer"
                                >
                                  Contre
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleVotePositive(key)}
                                  className="cursor-pointer"
                                >
                                  Pour
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </>
  ) : null;
};

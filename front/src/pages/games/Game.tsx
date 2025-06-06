import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GamePanel } from "../../../components/GamePanel";
import { StartScreen } from "../../../components/StartScreen";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import socket from "../../sockets";

interface GameParams {
  letter: string;
  host: string;
  duration: number;
  startTime: number;
  state?: string;
  players: string[];
}

const Game = () => {
  const { id } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [gameParams, setGameParams] = useState<GameParams | null>(null);

  const [isJoined, setIsJoined] = useState(false);

  const [userName, setUserName] = useState<string | null>(null);

  const userNameRef = useRef(userName);

  const [answers, setAnswers] = useState({
    prenom: "",
    metier: "",
    geographie: "",
    marque: "",
    animal: "",
    aliment: "",
    celebrite: "",
  });

  const answersRef = useRef(answers);

  const handleInputChange = (champ: string, valeur: string) => {
    setAnswers((prevData) => ({
      ...prevData,
      [champ]: valeur,
    }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get_id");
    socket.on("connected", (id: string) => {
      setUserId(id);
    });

    socket.on("error", (message) => {
      console.error("Erreur reçue :", message);
    });

    socket.on("player_joined", ({ options, player }) => {
      if (player === userId) {
        setIsJoined(true);
      }
      setGameParams(options);
    });

    socket.on("game_started", (option) => {
      setGameParams({ ...gameParams, ...option });
    });

    socket.on("game_stopped", (option) => {
      setGameParams({ ...gameParams, ...option });

      socket.emit("submit_responses", {
        gameId: id,
        answers: answersRef.current,
      });
    });

    socket.on("player_quit", (option) => {
      setGameParams({ ...gameParams, ...option });
    });

    socket.on("all_responses_collected", (responses) => {
      console.log(responses);
    });
  }, []);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  const handleUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoin = () => {
    socket.emit("join_game", { gameId: id, name: userNameRef.current });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Card className="w-full max-w-sm">
          {!isJoined ? (
            <>
              <CardHeader>
                <CardTitle>Rejoindre la partie</CardTitle>
                <CardDescription>
                  Rejoinez la partie de Petit-Bac avec vos amis !
                </CardDescription>
              </CardHeader>
              <StartScreen id={id!} />
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Rejoindre</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Créer un nom d'utilisateur</DialogTitle>
                      <DialogDescription>
                        Vous avez besoin de créer un nom d'utilisateur avant de
                        créer et jouer !
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="username-1">Nom d'utilisateur :</Label>
                        <Input
                          onChange={handleUserName}
                          id="username"
                          placeholder="Nom d'utilisateur"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button onClick={handleJoin}>Rejoindre</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </>
          ) : gameParams ? (
            <>
              <GamePanel
                gameParams={gameParams}
                id={id!}
                userId={userId!}
                handleInputChange={handleInputChange}
                champs={Object.keys(answers)}
              />
            </>
          ) : (
            <>
              <CardContent>
                <h1>Aucune partie trouvé</h1>
              </CardContent>
              <CardFooter className="flex-row gap-2">
                <Button onClick={handleBack}>Retour page principale</Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Game;

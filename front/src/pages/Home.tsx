import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import socket from "../sockets";
function Home() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    socket.on("connect", () => {});

    socket.on("error", (message) => {
      console.error("Erreur reçue :", message);
    });

    socket.on("game_created", (id) => {
      navigate(`game/${id}`, { replace: true });
    });

    return () => {
      socket.off("game_created");
    };
  }, []);

  const handleCreateGame = () => {
    socket.emit("create_game");
  };

  const onSubmit = () => {
    if (!inputRef.current) return;
    const code = inputRef.current.value;

    socket.emit("check_game", code);
    socket.on("game_found", (res) => {
      if (res) navigate(`game/${code}`, { replace: true });
    });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-2">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Bienvue sur le jeu du Petit-Bac</CardTitle>
            <CardDescription>
              Créez une partie ou rejoignez en une et amusez vous bien !
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-row w-full gap-2">
            <Button onClick={handleCreateGame} className="flex-1/2">
              Créer
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1/2">
                  Rejoindre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Rejoindre la partie</DialogTitle>
                  <DialogDescription>
                    Vous devez rentrer le code pour rejoindre la partie !
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="code">Code pour rejoindre :</Label>
                    <Input ref={inputRef} id="code" placeholder="Code" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={onSubmit}>Rejoindre</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default Home;

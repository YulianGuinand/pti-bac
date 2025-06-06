import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
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
  const [userName, setUserName] = useState<string | null>(null);

  const userNameRef = useRef(userName);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connecté au serveur backend");
    });

    socket.on("game_created", (id) => {
      navigate(`game/${id}`);
    });

    return () => {
      socket.off("game_created");
    };
  }, []);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  const handleCreateGame = () => {
    socket.emit("create_game", userNameRef.current);
  };

  const handleUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Créer une partie</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer un nom d'utilisateur</DialogTitle>
              <DialogDescription>
                Vous avez besoin de créer un nom d'utilisateur avant de créer et
                jouer !
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
              <Button onClick={handleCreateGame}>Créer et Rejoindre</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Home;

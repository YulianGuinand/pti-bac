import { useState } from "react";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { Input } from "./ui/input";

export const StartScreen = ({ id }: { id: string }) => {
  const [isCopy, setIsCopy] = useState<boolean>(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`http://localhost:5173/game/${id}`);
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 1500);
  };
  return (
    <CardContent className="space-y-2">
      <p>Pour inviter des amis, copiez et partagez ce lien</p>
      <div className="w-full flex flex-row">
        <Input
          disabled
          type="text"
          value={`http://localhost:5173/game/${id}`}
          className="rounded-r-none"
        />
        <Button
          onClick={handleCopy}
          className="rounded-l-none"
          disabled={isCopy}
        >
          {isCopy ? "Succès" : "Copier"}
        </Button>
      </div>
    </CardContent>
  );
};

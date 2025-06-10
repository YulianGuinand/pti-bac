import { useState } from "react";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { Input } from "./ui/input";

export const StartScreen = ({ id }: { id: string }) => {
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [isCodeCopy, setIsCodeCopy] = useState<boolean>(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `https://petit-bac-yulian.netlify.app/game/game/${id}`
    );
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 1500);
  };

  const handleCodeCopy = async () => {
    await navigator.clipboard.writeText(id);
    setIsCodeCopy(true);
    setTimeout(() => {
      setIsCodeCopy(false);
    }, 1500);
  };
  return (
    <CardContent className="space-y-2">
      <p>Pour inviter des amis, copiez et partagez ce lien</p>
      <div className="w-full flex flex-row">
        <Input
          disabled
          type="text"
          value={`https://petit-bac-yulian.netlify.app/game/${id}`}
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
      <div className="w-full flex flex-row">
        <Input
          disabled
          type="text"
          value={id}
          className="rounded-r-none flex-1"
        />
        <Button
          onClick={handleCodeCopy}
          className="rounded-l-none"
          disabled={isCodeCopy}
        >
          {isCodeCopy ? "Succès" : "Copier"}
        </Button>
      </div>
    </CardContent>
  );
};

import { useState } from "react";
import { Input } from "./ui/input";

const ChampInput = ({
  letter,
  id,
  handleInputChange,
  champ,
}: {
  letter: string;
  id: string;
  handleInputChange: (champ: string, valeur: string) => void;
  champ: string;
}) => {
  const [className, setClassName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= 0) return;
    if (text[0].toLowerCase() !== letter.toLowerCase()) {
      setClassName("border border-red-500");
    } else {
      setClassName("");
    }
    handleInputChange(champ, text);
  };
  return (
    <Input
      onChange={handleChange}
      id={id}
      type="text"
      placeholder={letter}
      className={className}
    />
  );
};

export default ChampInput;

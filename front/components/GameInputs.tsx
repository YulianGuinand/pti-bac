import ChampInput from "./ChampInput";
import { Label } from "./ui/label";

export const GameInputs = ({
  letter,
  champs,
  handleInputChange,
}: {
  letter: string;
  champs: string[];
  handleInputChange: (champ: string, valeur: string) => void;
}) => {
  return champs.map((el, index) => {
    return (
      <div key={index} className="space-y-2">
        <Label htmlFor={`champ-${el}`}>{el} :</Label>
        <ChampInput
          letter={letter}
          id={`champ-${el}`}
          handleInputChange={handleInputChange}
          champ={el}
        />
      </div>
    );
  });
};

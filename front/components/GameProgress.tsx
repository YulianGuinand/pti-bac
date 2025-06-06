import { CircularProgress } from "./ui/circular";

export const GameProgress = ({
  progress,
  isFinished,
}: {
  progress: number;
  isFinished: boolean;
}) => {
  return (
    !isFinished && (
      <div>
        <CircularProgress value={progress} size={70} />
      </div>
    )
  );
};

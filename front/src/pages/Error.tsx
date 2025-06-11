import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Error = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Une erreur est survenue...</CardTitle>
          <CardDescription>
            La page cherchée n&apos;a pas été trouvé. Souhaitez vous lancer une
            nouvelle partie ?
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/")}>Page d'accueil</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Error;

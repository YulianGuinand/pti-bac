import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { Toaster } from "../components/ui/sonner";
import Error from "./pages/Error";
import Home from "./pages/Home";
import DocPage from "./pages/documentation/Doc";
import Game from "./pages/games/Game";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/documentation" element={<DocPage />} />
      <Route path="*" element={<Error />} />
    </Route>
  )
);

const App = () => {
  return (
    <>
      <NavBar />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;

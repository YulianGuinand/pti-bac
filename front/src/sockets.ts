import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Change avec URL Render en prod

export default socket;

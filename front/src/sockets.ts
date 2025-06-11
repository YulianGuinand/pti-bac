import { io } from "socket.io-client";
// http://localhost:3001
// https://pti-bac.onrender.com
const socket = io("https://pti-bac.onrender.com", {
  transports: ["websocket"],
});

export default socket;

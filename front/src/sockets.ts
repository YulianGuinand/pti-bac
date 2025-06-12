import { io } from "socket.io-client";
// http://localhost:3001
// https://pti-bac.onrender.com
const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});

export default socket;

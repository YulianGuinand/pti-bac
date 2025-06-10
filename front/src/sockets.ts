import { io } from "socket.io-client";

const socket = io("https://pti-bac.onrender.com", {
  transports: ["websocket"],
});

export default socket;

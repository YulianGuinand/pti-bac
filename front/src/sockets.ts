import { io } from "socket.io-client";

const socket = io("https://pti-bac.onrender.com:3001");

export default socket;

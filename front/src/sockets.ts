import { io } from "socket.io-client";

const socket = io("https://pti-bac.onrender.com:10000");

export default socket;

import { io } from "socket.io-client";

const socket = io("https://ashengo-inventory-production.fly.dev");

export default socket;

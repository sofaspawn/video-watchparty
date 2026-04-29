import {io} from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
export const socket =  io(backendURL);
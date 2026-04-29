import { useEffect } from "react";
import { socket } from "./socket";

function App() {
  useEffect(() => {
    socket.on("message", (data) => {
      console.log("Message:", data);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", "Hello from client");
  };

  return <button onClick={sendMessage}>Send</button>;
}

export default App;
import { useState, useEffect, useRef } from "react";

const useWebSocket = (url) => {
  const [data, setData] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed, reconnecting...");
      reconnectTimer.current = setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [url]);

  return data;
};

export default useWebSocket;

import { useEffect, useState } from "react";

export default function Home() {
    const [fmriData, setFmriData] = useState(null);

    useEffect(() => {
        const socket = new WebSocket("ws://100.99.242.6:8000/ws");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setFmriData(data.fmri_data);
        };

        socket.onclose = () => console.log("WebSocket closed");
        return () => socket.close();
    }, []);

    return (
        <div>
            <h1>Live fMRI Visualization</h1>
            <pre>{fmriData ? JSON.stringify(fmriData, null, 2) : "Waiting for data..."}</pre>
        </div>
    );
}

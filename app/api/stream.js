import { Server } from 'ws';
import { Client } from 'pg';

const CRATEDB_CONFIG = {
  user: 'crate',
  host: 'localhost',
  database: 'doc',
  password: '',
  port: 5432,
};

export default function handler(req, res) {
  if (res.socket.server.ws) return res.end();

  const wss = new Server({ server: res.socket.server });
  res.socket.server.ws = wss;

  wss.on('connection', async ws => {
    const client = new Client(CRATEDB_CONFIG);
    await client.connect();

    setInterval(async () => {
      const result = await client.query(
        'SELECT ST_X(point) AS x, ST_Y(point) AS y, ST_Z(point) AS z, intensity FROM fmri_voxels ORDER BY timestamp DESC LIMIT 100'
      );
      ws.send(JSON.stringify(result.rows));
    }, 500);
  });

  res.end();
}

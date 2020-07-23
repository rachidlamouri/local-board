const express = require('express');
const app = express();
const WebSocket = require('ws');
const uuid = require('uuid');

const { PORT, WS_PORT } = process.env;

const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`Web socket server listening on ${WS_PORT}`);

const connections = {};

wss.on('connection', (connection) => {
  const connectionId = uuid.v4();
  connections[connectionId] = connection;
  console.log('Connected:', connectionId);

  connection.send(connectionId);

  connection.on('message', (message) => {
    const [userId, points] = JSON.parse(message);
    const otherConnections = Object.entries(connections).filter(([connectionId]) => userId !== connectionId);
    otherConnections.forEach(([, connection]) => {
      connection.send(JSON.stringify(points));
    })
  });

  connection.on('close', () => {
    console.log('Closing:', connectionId)
    delete connections[connectionId];
  })
});

app.use(express.static('public'))

app.get('/wsport', (req, res) => {
  res.send(WS_PORT);
});

app.listen(PORT, () => {
  console.log(`Web server listening on ${PORT}`)
});

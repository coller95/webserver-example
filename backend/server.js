const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let value = 0;  // Initial value

// WebSocket connection
wss.on('connection', (ws) => {
    // Send the current value to the connected client
    ws.send(value.toString());

    ws.on('message', (message) => {
        console.log('Received:', message);
    });
    // Set up a ping interval. For instance, every 30 seconds.
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping(() => {});
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
});

app.get('/add', (req, res) => {
    value += 1;
    broadcastValue();
    console.log('[backend]/add Received: +1');
    res.send('Added 1');
});

app.get('/minus', (req, res) => {
    value -= 1;
    broadcastValue();
    console.log('[backend]/minus Received: -1');
    res.send('Subtracted 1');
});

function broadcastValue() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(value.toString());
        }
    });
}

server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

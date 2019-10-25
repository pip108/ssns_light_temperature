const dgram = require('dgram');
const server = dgram.createSocket('udp6');
const express = require('express');
const app = express();
const api_port = 3333;

const PORT = 5678;

const nodes = [];

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const r = new Buffer('b');
    let node = nodes.find(x => x.addr == rinfo.address);
    if (!node) {
        node = { addr: rinfo.address };
        nodes.push(node);
    }
    node.state = msg.toString();
    server.send(r, 0, r.length, rinfo.port, rinfo.address);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);

app.get('/', (req, res) => res.send(nodes))

app.listen(api_port, () => console.log(`Light & Temperature monitoring backend listing on ${api_port}!`))
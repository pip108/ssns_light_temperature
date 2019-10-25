const dgram = require('dgram');
const server = dgram.createSocket('udp6');

const PORT = 5678;

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    const r = new Buffer('b');
    server.send(r, 0, r.length, rinfo.port, rinfo.address);

});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);
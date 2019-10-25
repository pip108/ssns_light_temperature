// Require node js dgram module.
var dgram = require('dgram');

// Create a udp socket client object.
var client = dgram.createSocket("udp6");
client.bind(5678, () => {
    const msg = Buffer.from('b');
    client.send(msg, 0, msg.length, 5678, "ff02::1%wlo1");
});

// message variable is used to save user input text.

const dgram = require('dgram');
const server = dgram.createSocket('udp6');
const express = require('express');
var cors = require('cors')
const app = express();
const expressWs = require('express-ws')(app);
app.use(cors());
const api_port = 3333;

const PORT = 5678;

/*const nodes = [{
    addr: 'test:test:test:test1',
    temp: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }],
    light: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }]
}, {
    addr: 'test:test:test:test2',
    temp: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }],
    light: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }]
}, {
    addr: 'test:test:test:test3',
    temp: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }],
    light: [{ value: 0.1, timestamp: new Date() }, { value: 0.2, timestamp: new Date() }]
}];*/
const nodes = [];

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    let node = nodes.find(x => x.addr == rinfo.address);
    if (!node) {
        node = { addr: rinfo.address, light: [], temp: [] };
        nodes.push(node);
    }
    const status = JSON.parse(msg);
    
    const adc_temp = status.temp * 4096 / 30000;
    const r_temp = (4095 - adc_temp) * 10 / adc_temp;
    const temp = 1 / (Math.log(r_temp / 10) / 3975 + 1 / 298.15) - 273.15;


    const adc_light = status.light * 4096 / 30000;
    const r_light = (4095 - adc_light) * 10 / adc_light;
    const light = 63 * Math.pow(r_light, -0.7);

    console.log(`temp ${temp}`);
    console.log(`light ${light}`);
    node.temp.unshift({ value: temp, timestamp: new Date() });
    node.light.unshift({ value: light, timestamp: new Date() });

    sendToAllWs(nodes_payload());
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);

function sendToAllWs(payload) {
    const clients = expressWs.getWss('/').clients;
    clients.forEach(client => client.send(JSON.stringify(payload)));
}


app.get('/', (req, res) => {
    res.send(nodes)
});

app.get('/test', (req, res) => {
    nodes[2].temp.push({ value: 'FULL', timestamp: new Date() });
    nodes[2].light.push({ value: 'FULL', timestamp: new Date() });
    const r = { msg: 'update', data: nodes[2] };
    sendToAllWs(r);
    res.send('ok');
});

function nodes_payload() {
    return {
        msg: 'nodes',
        data: nodes
    };
}

app.ws('/', function (ws, req) {
    console.log('Socket Connected');
    ws.send(nodes_payload());
});

app.listen(api_port, () => console.log(`Light & Temperature monitoring backend listening on ${api_port}!`))
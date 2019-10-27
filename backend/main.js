const dgram = require('dgram');
const server = dgram.createSocket('udp6');
const express = require('express');
var cors = require('cors')
const app = express();
const expressWs = require('express-ws')(app);
const mongoose = require('mongoose');
app.use(cors());
const api_port = 3333;


import models from './db';

const PORT = 5678;
const db_url = 'mongodb://192.168.1.140/ssns_lt';

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
});

const db = mongoose.connection;
db.on('error', error => {
    console.log('error', error);
});
db.on('open', () => console.log('mongodb connection successfull!'));

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


app.get('/', async (req, res) => {
    const r = await models.Node.find({});
    res.send(r);
});

app.get('/:id', async (req, res) => {
    const r = await models.Sensor.find({ node: { addr: req.params.id }});
    res.send(r);
});

let i = 1;
app.get('/test/:addr', async (req, res) => {
    const n = await models.Node.findOne({ addr: req.params.addr });
    const s = new models.Sensor({
        type: 'light',
        value: 0.12,
        timestamp: new Date(),
        node: n
    });
    s.save();
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
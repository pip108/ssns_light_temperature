const dgram = require('dgram');
const server = dgram.createSocket('udp6');
const express = require('express');
var cors = require('cors')
const app = express();
const expressWs = require('express-ws')(app);
const mongoose = require('mongoose');
import bodyparser from 'body-parser';
app.use(cors());
app.use(bodyparser.json());
const api_port = 3333;


import { models, connectDb, SensorType } from './db';
import { model } from 'mongoose';

const PORT = 5678;
const INIT_TIMER = 5;

connectDb();

server.on('message', async (msg, rinfo) => {
    console.log(`${msg} from ${rinfo.address} port ${rinfo.port}`);
    let node = await models.Node.findOne({ addr: rinfo.address });
    if (!node) {
        node = new models.Node({ addr: rinfo.address, timer: INIT_TIMER });
    }
    const payload = JSON.parse(msg);
    switch (payload.msg) {
        case 'update':
            handleUpdate(node, payload.data);
            break;
        case 't_req':
            setNodeTimer(rinfo.address, node.timer);
            break;
        default:
            break;
    }
    await node.save();
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});


async function handleUpdate(node, update) {
    const adc_temp = update.temp * 4096 / 30000;
    const r_temp = (4095 - adc_temp) * 10 / adc_temp;
    const temp = 1 / (Math.log(r_temp / 10) / 3975 + 1 / 298.15) - 273.15;

    const adc_light = update.light * 4096 / 30000;
    const r_light = (4095 - adc_light) * 10 / adc_light;
    const light = 63 * Math.pow(r_light, -0.7);

    const newValue = new models.Sensor({
        light: light,
        temp: temp,
        timestamp: new Date(),
        node: node._id
    });
    await newValue.save();

    const update_payload = {
        msg: 'update',
        data: newValue
    };
    sendToAllWs(JSON.stringify(update_payload));
}

function setNodeTimer(addr, value) {
    server.send('set_timer ' + value, PORT, addr);
}

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);

function sendToAllWs(payload) {
    const clients = expressWs.getWss('/').clients;
    clients.forEach(client => client.send(JSON.stringify(payload)));
}

app.get('/node/:id', async (req, res) => {
    const node = await models.Node.findOne({ _id: req.params.id });
    res.send(node);
});

app.get('/sensors/:nodeId', async (req, res) => {
    const s = parseInt(req.query.s) || 0;
    const t = parseInt(req.query.t) || 20;
    const r = await models.Sensor.find({ node: req.params.nodeId }).skip(s).limit(t);
    res.send(r);
});

app.put('/node/:id', async (req, res) => {
    const node = await models.Node.findOne({ _id: req.params.id });
    if (req.body.timer != node.timer) {
        setNodeTimer(node.addr, req.body.timer);
    }
    node.name = req.body.name;
    node.timer = req.body.timer;
    await node.save();
    res.send(node);
});


app.ws('/', async function (ws, req) {
    console.log('Socket Connected');
    const nodes = await models.Node.find({});
    const sensors = [];
    for (let i = 0; i < nodes.length; i++) {
        const s = await models.Sensor.find({ node: nodes[i]._id }).sort({ 'timestamp': -1 }).limit(1);
        if (s.length > 0) {
            sensors.push(s[0]);
        }
    }
    const payload = {
        msg: 'init',
        data: {
            nodes: nodes,
            sensors: sensors
        }
    };
    ws.send(JSON.stringify(payload));
});

app.listen(api_port, () => console.log(`Light & Temperature monitoring backend listening on ${api_port}!`))
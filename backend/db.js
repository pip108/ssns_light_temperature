
import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
    value: {
        type: Number
    },
    timestamp: {
        type: Date,
    },
});
const Sensor = mongoose.model('Sensor', sensorSchema);


const nodeSchema = new mongoose.Schema({
    addr: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    timer: {
        type: Number
    },
    light: [sensorSchema],
    temp: [sensorSchema]
});

const Node = mongoose.model('Node', nodeSchema);

const models = { Node, Sensor };
export default models;


import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    value: {
        type: Number
    },
    timestamp: {
        type: Date,
    },
    node: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Node'
    }
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
});

const Node = mongoose.model('Node', nodeSchema);

const models = { Node, Sensor };
export default models;

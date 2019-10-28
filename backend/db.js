
import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
    light: {
        type: Number
    },
    temp: {
        type: Number
    },
    timestamp: {
        type: Date,
    },
    node: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
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
    timer: {
        type: Number
    }
});
const Node = mongoose.model('Node', nodeSchema);

const db_url = 'mongodb://192.168.1.140/ssns_lt';


export const connectDb = async () => {
    await mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    db.on('error', error => {
        console.log('error', error);
    });
    db.on('open', () => console.log('mongodb connected'));
}

export const models = { Node, Sensor };

export const SensorType = { Light: 1, Temp: 2 };

import { Sensor } from './sensor';

export interface Node {
    _id: string;
    addr: string;
    temp: Sensor[];
    light: Sensor[];
    timer: number;
}
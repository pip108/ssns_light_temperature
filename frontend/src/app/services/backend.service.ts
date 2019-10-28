import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { map } from 'rxjs/operators';
import { Node } from '../models/node';
import { Sensor } from '../models/sensor';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    private ws = webSocket('ws://localhost:3333');

    private nodeSubject = new ReplaySubject<Node[]>();
    private nodes: Node[] = [];
    private latestSensorsSubject = new ReplaySubject<Sensor[]>();
    private latestSensors: Sensor[] = [];

    constructor(private http: HttpClient) {
        this.ws.subscribe((r: { msg: string, data: any }) => this.handleWs(r));
    }

    public getNodes(): Observable<Node[]> {
        return this.nodeSubject.asObservable();
    }

    public getLatestSensors(): Observable<Sensor[]> {
        return this.latestSensorsSubject.asObservable();
    }

    public getNode(id: string): Observable<Node> {
        return this.http.get<Node>(`http://localhost:3333/node/${id}`);
    }

    public getSensors(nodeId: string, skip: number, take: number): Observable<Sensor[]> {
        return this.http.get<Sensor[]>(`http://localhost:3333/sensors/${nodeId}?s=${skip}&t=${take}`);
    }

    public async updateNode(node: Node): Promise<Node> {
        const n = await this.http.put<Node>(`http://localhost:3333/node/${node._id}`, node, httpOptions)
            .toPromise();

        return n;
    }

    private handleWs(r: { msg: string, data: any }): void {
        switch (r.msg) {
            case 'init':
                this.nodes = r.data.nodes;
                this.nodeSubject.next(this.nodes);
                this.latestSensors = r.data.sensors;
                this.latestSensorsSubject.next(this.latestSensors);
                break;
            case 'update':
                const i = this.latestSensors.findIndex(x => x.node === r.data.node);
                this.latestSensors.splice(i, 1);
                this.latestSensors.push(r.data);
                this.latestSensorsSubject.next(this.latestSensors);
                break;
            default:
                break;
        }
    }
}

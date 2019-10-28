import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { map } from 'rxjs/operators';
import { Node } from '../models/node';

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

    constructor(private http: HttpClient) {
        this.ws.subscribe((r: { msg: string, data: any }) => this.handleWs(r));
    }

    public getNodes(): Observable<Node[]> {
        return this.nodeSubject.asObservable();
    }

    public getNodeUpdates(id: string): Observable<Node> {
        return this.nodeSubject.asObservable().pipe(map(nodes => nodes.find(x => x._id === id)));
    }

    public getNode(id: string): Observable<Node> {
        return this.http.get<Node>(`http://localhost:3333/node/${id}`);
    }

    public async updateNode(node: Node): Promise<Node> {
        const n = await this.http.put<Node>(`http://localhost:3333/node/${node._id}`, node, httpOptions)
            .toPromise();

        this.updateSingle(n);
        return n;
    }

    private updateSingle(update: Node): void {
        const i = this.nodes.findIndex(x => x.addr == update.addr);
        if (i > 0) {
            this.nodes[i] = update;
            this.nodeSubject.next(this.nodes);
        } else {
            this.nodes.push(update);
        }
    }

    private handleWs(r: { msg: string, data: any }): void {
        switch (r.msg) {
            case 'nodes':
                this.nodes = r.data;
                this.nodeSubject.next(this.nodes);
                break;
            case 'update':
                this.updateSingle(r.data);
                break;
            default:
                break;
        }
    }

}
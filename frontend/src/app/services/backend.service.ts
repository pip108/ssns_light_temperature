import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { webSocket } from "rxjs/webSocket";
import { map } from 'rxjs/operators';
import { Node } from '../models/node';

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    private ws = webSocket('ws://localhost:3333');

    private nodeSubject = new ReplaySubject<Node[]>();

    constructor(private http: HttpClient) {
        this.ws.subscribe((r: {msg: string, data: any}) => this.handleWs(r));
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

    private handleWs(r: { msg: string, data: any }): void {
        console.log('hmm', r);
        switch (r.msg) {
            case 'nodes':
                this.nodeSubject.next(r.data);
                break;
            case 'update':
                this.nodeSubject.next(r.data);
            break;
            default:
                break;
        }
    }

}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { switchMap, skip } from 'rxjs/operators';
import { Node } from '../models/node';
import { Sensor } from '../models/sensor';

@Component({
    selector: 'app-details',
    templateUrl: 'details.component.html',
    styleUrls: ['details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

    public node = this.route.snapshot.data.node as Node;
    public sensors = this.route.snapshot.data.sensors as Sensor[];

    private updatesSubscription: Subscription | null = null;

    constructor(private router: Router, private route: ActivatedRoute, private backend: BackendService) {
    }

    public ngOnInit(): void {
        console.log();
    }

    public ngOnDestroy(): void {
        if (this.updatesSubscription) {
            this.updatesSubscription.unsubscribe();
        }
    }

    public async loadData(event: any): Promise<void> {
        const more = await this.backend.getSensors(this.node._id, this.sensors.length, 5).toPromise();
        this.sensors = [...this.sensors, ...more];
        event.target.complete();
    }

    public async saveChanges() {
        this.node = await this.backend.updateNode(this.node);
    }
}

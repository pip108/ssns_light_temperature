import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { switchMap, skip, filter, map } from 'rxjs/operators';
import { Node } from '../models/node';
import { Sensor } from '../models/sensor';

@Component({
    selector: 'app-details',
    templateUrl: 'details.component.html',
    styleUrls: ['details.component.scss']
})
export class DetailsComponent implements OnDestroy {

    public node = this.route.snapshot.data.node as Node;
    public sensors = this.route.snapshot.data.sensors as Sensor[];

    private updatesSubscription = this.backend.getLatestSensors()
        .pipe(map(sensors => sensors.find(x => x.node === this.node._id )))
        .subscribe(update => {
            if(!this.sensors.find(x => x._id == update._id)) {
                this.sensors.unshift(update)
                this.sensors.splice(this.sensors.length - 1, 1);
            }
        });

    constructor(private router: Router, private route: ActivatedRoute, private backend: BackendService) {
    }


    public ngOnDestroy(): void {
        this.updatesSubscription.unsubscribe();
    }

    public async loadData(event: any): Promise<void> {
        const more = await this.backend.getSensors(this.node._id, this.sensors.length, 5).toPromise();
        this.sensors = [...this.sensors, ...more];
        console.log('is more', more);
        event.target.complete();
    }

    public async saveChanges() {
        this.node = await this.backend.updateNode(this.node);
    }
}

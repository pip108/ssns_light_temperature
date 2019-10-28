import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { switchMap, skip } from 'rxjs/operators';
import { Node } from '../models/node';

@Component({
    selector: 'app-details',
    templateUrl: 'details.component.html',
    styleUrls: ['details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

    public node = this.route.snapshot.data.node as Node;
    private updatesSubscription: Subscription | null = null;

    constructor(private router: Router, private route: ActivatedRoute, private backend: BackendService) {
        this.node.temp = this.node.temp.slice().reverse();
        this.node.light = this.node.light.slice().reverse();
    }

    public ngOnInit(): void {
        this.updatesSubscription = this.backend.getNodeUpdates(this.node._id).pipe(skip(1)).subscribe(n => {
            this.node.light.unshift(n.light[0]);
            this.node.temp.unshift(n.temp[0]);
        });
    }

    public ngOnDestroy(): void {
        if (this.updatesSubscription) {
            this.updatesSubscription.unsubscribe();
        }
    }

    public async saveChanges() {
        this.node = await this.backend.updateNode(this.node);
    }
}

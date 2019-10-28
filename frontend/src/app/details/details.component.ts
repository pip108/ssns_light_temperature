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
    }

    public ngOnInit(): void {
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

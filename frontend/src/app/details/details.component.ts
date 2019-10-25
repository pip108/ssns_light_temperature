import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, ReplaySubject } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-details',
    templateUrl: 'details.component.html',
    styleUrls: ['details.component.scss']
})
export class DetailsComponent implements OnInit {

    constructor(private router: Router, private route: ActivatedRoute, private backend: BackendService) {}

    public node$ = this.route.paramMap.pipe(switchMap(params => {
        return this.backend.getNode(params.get('i'));
    }));

    public ngOnInit(): void {
   
    }
}

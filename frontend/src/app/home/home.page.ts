import { Component, OnInit } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { Sensor } from '../models/sensor';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public nodes$ = this.backend.getNodes();
  public sensors$ = this.backend.getLatestSensors().pipe(map(sensors => {
    const d: { [index:string]: Sensor } = {};
    sensors.forEach(s => d[s.node] = s);
    console.log('what', d);
    return d;
  }));

  constructor(private backend: BackendService, private router: Router) {}

  public ngOnInit(): void {
  }


  public async showDetails(i: number) {
    this.router.navigate(['node', { i: i }]);
  }

}

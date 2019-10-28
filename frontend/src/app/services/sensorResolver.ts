import { BackendService } from './backend.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Sensor } from '../models/sensor';

@Injectable({ providedIn: 'root' })
export class SensorResolver implements Resolve<Sensor[]> {
  constructor(private backend: BackendService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    const s = Number.parseInt(route.paramMap.get('s')) || 0;
    const t = Number.parseInt(route.paramMap.get('t')) || 20;
    return this.backend.getSensors(route.paramMap.get('id'), s, t);
  }
}

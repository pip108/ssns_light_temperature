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
    const s = Number.parseInt(route.queryParamMap.get('s')) || 0;
    const t = Number.parseInt(route.queryParamMap.get('t')) || 100;
    return this.backend.getSensors(route.paramMap.get('id'), s, t);
  }
}

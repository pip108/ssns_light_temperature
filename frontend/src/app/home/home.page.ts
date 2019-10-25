import { Component, OnInit } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { DetailsComponent } from '../details/details.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public nodes$ = this.backend.getNodes();

  constructor(private backend: BackendService, private modalController: ModalController, private router: Router) {}

  public ngOnInit(): void {
    
    this.nodes$.subscribe(nodes => console.log('nodes', nodes), error => console.log('error', error));
  }

  public async showDetails(i: number) {
    this.router.navigate(['node', { i: i }]);
  }

}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NodeResolver } from './services/nodeResolver';
import { SensorResolver } from './services/sensorResolver';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'node/:id', 
    loadChildren: () => import('./details/details.module').then( m => m.HomePageModule),
    resolve: {
      node: NodeResolver,
      sensors: SensorResolver
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureModelDetailComponent } from './feature-model-detail/feature-model-detail.component';
import { FeatureModelComponent } from './feature-model/feature-model.component';


// Routing for the Feature Modeler
const routes: Routes = [
  { path: '', redirectTo: '/featuremodels', pathMatch: 'full' },
  { path: 'featuremodel/:id', component: FeatureModelDetailComponent },
  { path: 'featuremodels', component: FeatureModelComponent },
  { path: '**', component: FeatureModelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

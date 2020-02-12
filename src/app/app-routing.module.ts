import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FeatureModelDetailComponent } from './feature-model-detail/feature-model-detail.component';
import { FeatureModelViewComponent } from './feature-model-view/feature-model-view.component';
import { FeatureModelComponent } from './feature-model/feature-model.component';
import { ToolExplanationComponent } from './tool-explanation/tool-explanation.component';


// Routing for the Feature Modeler
const routes: Routes = [
  { path: '', redirectTo: '/featuremodels', pathMatch: 'full' },
  { path: 'explanation', component: ToolExplanationComponent },
  { path: 'featuremodel/:id', component: FeatureModelDetailComponent },
  { path: 'featuremodelview/:id', component: FeatureModelViewComponent },
  { path: 'featuremodels', component: FeatureModelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

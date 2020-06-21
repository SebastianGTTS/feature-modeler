import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FeatureModelComponent } from './feature-model/feature-model.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FeatureModelDetailComponent } from './feature-model-detail/feature-model-detail.component';
import { FeatureTreeComponent } from './feature-tree/feature-tree.component';

import { ToolExplanationComponent } from './tool-explanation/tool-explanation.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    FeatureModelComponent,
    FeatureModelDetailComponent,
    FeatureTreeComponent,
    ToolExplanationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

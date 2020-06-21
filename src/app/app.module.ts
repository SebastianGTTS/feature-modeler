import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FeatureModelDetailComponent } from './feature-model-detail/feature-model-detail.component';
import { FeatureModelComponent } from './feature-model/feature-model.component';
import { FeatureTreeComponent } from './feature-tree/feature-tree.component';
import { ToolExplanationComponent } from './tool-explanation/tool-explanation.component';


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

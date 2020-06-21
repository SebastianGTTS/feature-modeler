import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { saveAs } from 'file-saver';

import { PouchdbService } from '../service/pouchdb.service';

@Component({
  selector: 'app-feature-model',
  templateUrl: './feature-model.component.html',
  styleUrls: ['./feature-model.component.css']
})
/**
 * The FeatureModelComponent shows a starting page where all existing feature models
 * can be discovered and new feature models can be created.
 *
 * @author: Sebastian Gottschalk
 */
export class FeatureModelComponent {
  // List of feature models
  featureModelList: Array<any>;
  // Form to create new feature model
  featureModelForm = this.fb.group({ name: [''], description: [] });

  /**
   * Create a new instance of the FeatureModelComponent.
   * @param fb FormBuilder
   * @param pouchDBServer PouchdbService
   * @param router Router
   */
  constructor(
    private fb: FormBuilder,
    private pouchDBServer: PouchdbService,
    private router: Router) {

    // Init default database
    this.pouchDBServer.getDatabaseInfo().then(result => {
      if (result.doc_count === 0) {
        this.pouchDBServer.resetDatabase().then(() => {
          this.refreshFeatureModelList();
        }, error => {
          console.log('Default Constructor (inner): ' + error);
        });
      }
    }, error => {
      console.log('Default Constructor: ' + error);
    });

    this.refreshFeatureModelList();
  }

  /**
   * Add a new feature model.
   */
  addFeatureModel(): void {
    this.pouchDBServer.addFeatureModel(this.featureModelForm.value.name, this.featureModelForm.value.description).then(result => {
      this.refreshFeatureModelList();
    }, error => {
      console.log('AddFeatureModel: ' + error);
    });
  }

  /**
   * Reset the local database.
   */
  resetDatabase(): void {
    console.log('Delete Database');
    this.pouchDBServer.resetDatabase().then(result => {
      this.refreshFeatureModelList();
    }, error => {
      console.log('Default Constructor (inner): ' + error);
    });
  }

  /**
   * Navigate to a component to view the current feature model.
   * @param featureModelId id of the current feature model
   */
  viewFeatureModel(featureModelId: string): void {
    this.router.navigate(['/featuremodelview', featureModelId]);
  }

  /**
   * Navigate to a component to edit the current feature model.
   * @param featureModelId id of the current feature model
   */
  editFeatureModel(featureModelId: string): void {
    this.router.navigate(['/featuremodel', featureModelId]);
  }

  /**
   * Delete the current feature model
   * @param featureModelId id of the current feature model
   */
  deleteFeatureModel(featureModelId: string): void {
    this.pouchDBServer.deleteFeatureModel(featureModelId).then(result => {
      this.refreshFeatureModelList();
    }, error => {
      console.log('DeleteFeatureModel: ' + error);
    });
  }

  /**
   * Save feature model to disk
   * @param featureModelId id of the feature model
   */
  saveFeatureModel(featureModelId: string): void {
    this.pouchDBServer.getFeatureModel(featureModelId).then(result => {
      const model = result as any;
      const saveName = model.name.replace(/\s+/g, '_').toLowerCase() + '.json';
      const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'text/json;charset=utf-8' });
      saveAs(blob, saveName);
    }, error => {
      console.log('SaveFeatureModel: ' + error);
    });
  }

  /**
   * Refresh the feature model list.
   */
  private refreshFeatureModelList(): void {
    this.pouchDBServer.getFeatureModelList().then(result => {
      this.featureModelList = result.docs;
    }, error => {
      console.log('RefreshFeatureModelList: ' + error);
    });
  }
}

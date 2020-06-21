import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Material } from '../models/material';
import { Metadata } from '../models/metadata';
import { PouchdbService } from '../service/pouchdb.service';


@Component({
  selector: 'app-feature-model-detail',
  templateUrl: './feature-model-detail.component.html',
  styleUrls: ['./feature-model-detail.component.css']
})
/**
 * The FeatureModelDetailComponent shows the feature model and allow the adding/updating/deleting of features and dependencies.
 * @author: Sebastian Gottschalk
 */
export class FeatureModelDetailComponent implements OnInit {
  // Variables for the feature model representation
  featureList: any[] = [];
  inheritableFeatures: any[] = [];
  featureModelId: string;
  featureModel: any;
  // Variables for the modal representation
  modalFeature: any;
  modalReference: NgbModalRef;
  modalDependency: any;
  modalSubfeatureIds: any[];
  // References to form groups
  featureModelForm: FormGroup;
  featureForm: FormGroup;
  dependencyForm: FormGroup;
  modalFeatureForm: FormGroup;
  metadataForm: FormGroup;
  materialForm: FormGroup;
  // References for modal children
  @ViewChild('dependencyModal', { static: true }) dependencyModal: any;
  @ViewChild('updateModal', { static: true }) updateModal: any;
  @ViewChild('deleteModal', { static: true }) deleteModal: any;
  @ViewChild('metadataModal', { static: true }) metadataModal: any;
  @ViewChild('materialModal', { static: true }) materialModal: any;

  /**
   * Creates a new instance of the FeatureModelDetailComponent.
   * @param fb FormBuilder
   * @param route ActivatedRoute
   * @param location Location
   * @param pouchDBServer PouchdbService
   * @param modalService NgbModal
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private pouchDBServer: PouchdbService,
    private modalService: NgbModal
  ) { }

  /**
   * Initialize the component.
   */
  ngOnInit() {
    // Save feature model id
    this.featureModelId = this.route.snapshot.paramMap.get('id');
    this.loadFeatureModel(this.featureModelId);
    this.loadForms();
  }

  /**
   * Opens the dependency modal of the current feature.
   * @param featureId id of the current feature
   */
  openDependenciesModal(featureId) {
    this.pouchDBServer.getFeatureWithParent(this.featureModelId, featureId).then(result => {
      this.modalFeature = result;
      this.modalReference = this.modalService.open(this.dependencyModal, { size: 'lg' });
    }, error => {
      console.log('OpenDependencyModal: ' + error);
    });
  }

  /**
   * Opens the update modal of the current feature.
   * @param featureId id of the current feature
   */
  updateFeatureModal(featureId) {
    this.pouchDBServer.getFeatureWithParent(this.featureModelId, featureId).then(result => {
      this.modalFeature = result;
      this.modalSubfeatureIds = this.pouchDBServer.listSubfeatureIdsHelper(this.modalFeature.features);
      this.modalFeatureForm = this.fb.group({
        name: [this.modalFeature.name, Validators.required],
        isMandatory: this.modalFeature.isMandatory,
        hasOrSubfeatures: this.modalFeature.hasOrSubfeatures,
        hasXorSubfeatures: this.modalFeature.hasXorSubfeatures,
        isPhysical: this.modalFeature.isPhysical,
        isMaterial: this.modalFeature.isMaterial,
        subfeatureOf: this.modalFeature.parentId
      });
      this.modalReference = this.modalService.open(this.updateModal, { size: 'lg' });
    }, error => {
      console.log('UpdateFeatureModal: ' + error);
    });
  }

  /**
   * Opens the modal of the current feature.
   * @param featureId id of the current feature
   */
  deleteFeatureModal(featureId) {
    this.pouchDBServer.getFeatureWithParent(this.featureModelId, featureId).then(result => {
      this.modalFeature = result;
      this.modalReference = this.modalService.open(this.deleteModal, { size: 'lg' });
    }, error => {
      console.log('DeleteFeatureModal: ' + error);
    });
  }

  async openMaterialModal(featureId) {
    try {
      this.modalFeature = await this.pouchDBServer.getFeatureWithParent(this.featureModelId, featureId);
      this.modalSubfeatureIds = this.pouchDBServer.listSubfeatureIdsHelper(this.modalFeature.features);

      const material = new Material(this.modalFeature.material);
      this.materialForm = this.fb.group({
        textureFilename: [material.textureFilename, Validators.required],
        price: [material.price, Validators.min(0)],
      });
      this.modalReference = this.modalService.open(this.materialModal, { size: 'lg' });
    } catch (error) {
      console.log('openMaterialModal:', error);
    }
  }

  async openMetadataModal(featureId) {
    try {
      this.modalFeature = await this.pouchDBServer.getFeatureWithParent(this.featureModelId, featureId);
      this.modalSubfeatureIds = this.pouchDBServer.listSubfeatureIdsHelper(this.modalFeature.features);

      const metadata = new Metadata(this.modalFeature.metadata);
      this.metadataForm = this.fb.group({
        modelFilename: [metadata.modelFilename, Validators.required],
        brand: [metadata.brand],
        price: [metadata.price, Validators.min(0)],
        leftSlot: [metadata.leftSlot],
        rightSlot: [metadata.rightSlot],
        upperSlot: [metadata.upperSlot]
      });
      this.modalReference = this.modalService.open(this.metadataModal, { size: 'lg' });
    } catch (error) {
      console.log('openMetadataModal:', error);
    }
  }

  /**
   * Closes the current modal.
   */
  closeModal() {
    this.modalReference.close();
    this.modalFeature = null;

    // Reload views
    this.loadForms();
    this.loadFeatureModel(this.featureModelId);
  }

  /**
   * Delete the dependency between two feature models.
   * @param dependencyType type of the dependency
   * @param fromFeatureId id of the first feature model
   * @param toFeatureId id of the second feature model
   */
  deleteDependency(dependencyType: string, fromFeatureId: number, toFeatureId: number): void {
    this.pouchDBServer.deleteDependency(this.featureModelId, dependencyType, fromFeatureId, toFeatureId).then(() => {
      // Update the modal view
      this.pouchDBServer.getFeatureWithParent(this.featureModelId, this.modalFeature.id).then(result => {
        this.modalFeature = result;
        this.loadFeatureModel(this.featureModelId);
      }, error => {
        console.log('DeleteDependency (new load): ' + error);
      });
    }, error => {
      console.log('DeleteDependency: ' + error);
    });
  }

  /**
   * Update the current feature.
   */
  updateFeature() {
    this.pouchDBServer.updateFeature(
      this.featureModelId,
      this.modalFeature.id,
      this.modalFeatureForm.value.name,
      this.modalFeatureForm.value.isMandatory,
      this.modalFeatureForm.value.hasOrSubfeatures,
      this.modalFeatureForm.value.hasXorSubfeatures,
      this.modalFeatureForm.value.subfeatureOf,
      this.modalFeatureForm.value.isPhysical,
      this.modalFeatureForm.value.isMaterial
    ).then(result => {
      this.closeModal();
    }, error => {
      console.log('UpdateFeature: ' + error);
    });
  }

  /**
   * Delete the current feature.
   * @param featureId id of the current feature
   */
  deleteFeature(featureId) {
    this.pouchDBServer.deleteFeature(this.featureModelId, featureId).then(result => {
      this.closeModal();
    }, error => {
      console.log('DeleteFeature: ' + error);
    });
  }

  async updateMaterial() {
    await this.pouchDBServer.updateMaterial(this.featureModelId, this.modalFeature.id, new Material(this.materialForm.value));
    this.closeModal();
  }

  async updateMetadata() {
    await this.pouchDBServer.updateMetadata(this.featureModelId, this.modalFeature.id, new Metadata(this.metadataForm.value));
    this.closeModal();
  }

  /**
   * Reload the forms
   */
  private loadForms() {
    this.featureModelForm = this.fb.group({ name: ['', Validators.required], description: [''] });
    this.featureForm = this.fb.group({
      featureName: ['', Validators.required],
      isMandatory: false,
      hasOrSubfeatures: false,
      hasXorSubfeatures: false,
      subfeatureOf: ['1'],
      isPhysical: false,
      isMaterial: false
    });
    this.dependencyForm = this.fb.group({ dependencyType: 'requiringDependencyTo', fromFeatureId: ['1'], toFeatureId: ['2'] });
  }

  /**
   * Load the current feature model
   * @param featureModelId id of the feature model
   */
  private loadFeatureModel(featureModelId) {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(result => {
      this.featureModel = result;
      this.featureModelForm.patchValue({ name: this.featureModel.name, description: this.featureModel.description });
      this.featureList = this.getFeaturesAsList();
      this.inheritableFeatures = this.featureList.filter(f => !f.isPhysical && !f.isMaterial);
    }, error => {
      console.log('LoadFeatureModel: ' + error);
    });
  }

  /**
   * Insert a new feature.
   */
  insertFeature(): void {
    this.pouchDBServer.addFeature(
      this.featureModelId,
      this.featureForm.value.featureName,
      this.featureForm.value.isMandatory,
      this.featureForm.value.hasOrSubfeatures,
      this.featureForm.value.hasXorSubfeatures,
      this.featureForm.value.subfeatureOf,
      this.featureForm.value.isPhysical,
      this.featureForm.value.isMaterial
    ).then(result => {
      this.loadForms();
      this.loadFeatureModel(this.featureModelId);
    }, error => {
      console.log('InsertFeature: ' + error);
    });
  }

  /**
   * Insert a new dependency.
   */
  insertDependency(): void {
    this.pouchDBServer.addDependency(
      this.featureModelId,
      this.dependencyForm.value.dependencyType,
      this.dependencyForm.value.fromFeatureId,
      this.dependencyForm.value.toFeatureId
    ).then(result => {
      this.loadForms();
      this.loadFeatureModel(this.featureModelId);
    }, error => {
      console.log('InsertDependency: ' + error);
    });
  }

  /**
   * Update the current feature model.
   */
  updateFeatureModel(): void {
    this.pouchDBServer.updateFeatureModel(
      this.featureModel._id,
      this.featureModelForm.value.name,
      this.featureModelForm.value.description
    ).then(result => {
      // Do nothing
    }, error => {
      console.log('UpdateFeatureModel: ' + error);
    });
  }

  /**
   * Delete the current feature model.
   */
  deleteFeatureModel(): void {
    this.pouchDBServer.deleteFeatureModel(this.featureModel._id).then(result => {
      // Return back to home page
      this.location.back();
    }, error => {
      console.log('DeleteFeatureModel: ' + error);
    });
  }

  /**
   * Create a list of all features.
   */
  getFeaturesAsList(): any[] {
    const featureList: any[] = [];
    const featureStack: any[] = [];

    // Insert first level into the stack
    for (let i = 0; i < this.featureModel.features.length; i++) {
      const model = this.featureModel.features[this.featureModel.features.length - 1 - i];
      model.level = 1;
      featureStack.push(model);
    }

    // Select single feature from the stack
    while (featureStack.length > 0) {
      const f = featureStack.pop();
      featureList.push({
        id: f.id,
        name: f.name,
        levelname: '-'.repeat(f.level) + ' ' + f.name,
        level: f.level,
        isPhysical: f.isPhysical,
        isMaterial: f.isMaterial
      });

      // Add new features to the stack
      if (f.features) {
        for (let i = 0; i < f.features.length; i++) {
          const model = f.features[f.features.length - 1 - i];
          model.level = f.level + 1;
          featureStack.push(model);
        }
      }
    }

    return featureList;
  }
}

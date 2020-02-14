import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

@Injectable({
  providedIn: 'root'
})
/**
 * The PouchdbService handles the complete interaction of the web application with the PouchDB or CouchDB.
 * The specific database can be set in the constructor of the class
 *
 * @author Sebastian Gottschalk
 * @author Eugen Schmidt
 */
export class PouchdbService {
  db: PouchDB.Database;

  // Use 'http://localhost:4200/database' for connecting to a CouchDB specified in the proxy.conf.json
  databaseName = 'arpc-feature-modeler'

  /**
   * Create a new instance of the PouchdbService.
   */
  constructor() {

    // Create a PouchDB connection
    PouchDB.plugin(PouchDBFind)
    // Change to this.db = new PouchDB('http://server:port/yourdatabase'); to connect to a couchdb database
    this.db = new PouchDB(this.databaseName);

    // Check database connection
    this.db.info().then(function (info) {
      console.log('Database connection: ' + JSON.stringify(info));
    })
  }

  getDatabaseInfo() {
    return this.db.info();
  }

  /**
   * Get the list of the feature models.
   */
  getFeatureModelList() {
    return this.db.find({
      selector: {},
      fields: ['_id', 'name', 'description']
    });

    //return this.db.query(function (doc: any, emit) {
    //  emit(doc._id, { name: doc.name, description: doc.description })
    //}, {});
  }

  /**
   * Get the current feature model.
   * @param featureModelId id of the current feature model
   */
  getFeatureModel(featureModelId: string) {
    return this.db.get(featureModelId)
  }

  /**
   * Add a new feature model.
   * @param name name of the feature model
   * @param description description of the feature model
   */
  addFeatureModel(name: string, description: string) {
    var defaultFeatureModel = {
      name: name,
      description: description,
      featureIdCounter: 10,
      features: [
        this.createFeatureByParameter(1, 'Kitchen')
      ],
      featureMap: {
        '1': 'Kitchen'
      }
    }

    return this.db.post(defaultFeatureModel);
  }

  /**
   * Remove the current feature model.
   * @param id id of the current feature model
   */
  async deleteFeatureModel(id: string) {
    const result = await this.db.get(id);
    return this.db.remove(result);
  }

  /**
   * Update name and description of the current feature model.
   * @param id id of the current feature model
   * @param name name of the current feature model
   * @param description description of the current feature model
   */
  async updateFeatureModel(id: string, name: string, description: string) {
    const result = await this.db.get(id);
    result['name'] = name;
    result['description'] = description;
    return this.db.put(result);
  }

  /**
   * Add a dependency to the current feature model.
  * @param featureModelId id of the current feature model
   * @param dependencyType type of the dependency
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   */
  addDependency(featureModelId: string, dependencyType: string, fromFeatureId: number, toFeatureId: number) {
    return this.db.get(featureModelId).then(result => {
      var result = result;

      // Generic function to insert dependencies
      var insertDependency = (array: string, featureDepedencyId: number, result: any): any => {
        var result = result;
        result[array].push(parseInt(featureDepedencyId.toString()));
        return result;
      }
      result = this.dependencyModificationHelper(result, dependencyType, fromFeatureId, toFeatureId, insertDependency);

      return this.db.put(result);
    });
  }

  /**
   * Delete a dependency from the current feature model.
   * @param featureModelId id of the current feature model
   * @param dependencyType type of the dependency
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   */
  deleteDependency(featureModelId: string, dependencyType: string, fromFeatureId: number, toFeatureId: number) {
    return this.db.get(featureModelId).then(result => {
      var result = result;

      // Generic function to delete dependencies
      var deleteDependency = (array: string, featureDepedencyId: number, result: any): any => {
        var result = result;
        result[array] = result[array].filter(function (e) { return e !== featureDepedencyId })
        return result;
      }
      result = this.dependencyModificationHelper(result, dependencyType, fromFeatureId, toFeatureId, deleteDependency);

      return this.db.put(result);

    });
  }

  /**
   * Helper function to modify the dependencies of the current feature model.
   * @param featureModel current feature model
   * @param dependencyType type of the dependency
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   * @param modificationFunction modification function
   */
  private dependencyModificationHelper(featureModel: any, dependencyType: string, fromFeatureId: number, toFeatureId: number, modificationFunction: (array: string, featureDepedencyId: number, result: any) => any): any {
    var featureModel = featureModel;

    if (dependencyType == 'requiringDependencyTo') {
      featureModel = this.updateFeatureHandler(featureModel, toFeatureId, modificationFunction.bind(null, 'requiringDependencyFrom', fromFeatureId))
      //console.log(JSON.stringify(result))
      featureModel = this.updateFeatureHandler(featureModel, fromFeatureId, modificationFunction.bind(null, 'requiringDependencyTo', toFeatureId));
      //console.log(JSON.stringify(result))
    } else if (dependencyType == 'requiringDependencyFrom') {
      featureModel = this.updateFeatureHandler(featureModel, toFeatureId, modificationFunction.bind(null, 'requiringDependencyTo', fromFeatureId));
      featureModel = this.updateFeatureHandler(featureModel, fromFeatureId, modificationFunction.bind(null, 'requiringDependencyFrom', toFeatureId));
    } else {
      featureModel = this.updateFeatureHandler(featureModel, toFeatureId, modificationFunction.bind(null, 'excludingDependency', fromFeatureId));
      featureModel = this.updateFeatureHandler(featureModel, fromFeatureId, modificationFunction.bind(null, 'excludingDependency', toFeatureId));
    }

    return featureModel;

  }
  /**
   * Get the current feature with additional parentId.
   * @param featureModelId id of the current feature model
   * @param featureId id of the current feature
   */
  getFeatureWithParent(featureModelId: string, featureId: string) {
    return this.db.get(featureModelId).then(result => {
      return this.getFeatureWithParentFromModel(result, featureId);
    });
  }

  /**
   * Get the current feature with additional parentId from a feature model.
   * @param featureModel feature model
   * @param featureId id of the current feature
   */
  private getFeatureWithParentFromModel(featureModel: any, featureId: string) {
    var featureStack: any[] = []
    var featureFound: boolean = false;

    // Insert first level into the stack
    for (var i = 0; i < featureModel['features'].length; i++) {
      var model = featureModel['features'][featureModel['features'].length - 1 - i]
      model.parentId = 0
      featureStack.push(model)
    }

    // Select single feature from the stack
    while (featureStack.length > 0 && !featureFound) {
      var f = featureStack.pop()

      if (f.id == featureId) {
        featureFound = true;
        return f
      }

      // Add new features to the stack
      if (f.features) {
        for (var i = 0; i < f.features.length; i++) {
          var model = f.features[f.features.length - 1 - i]
          model.parentId = f.id
          featureStack.push(model)
        }
      }
    }
  }

  /**
   * Delete the current feature with all dependencies.
   * @param featureModelId id of the current feature model
   * @param featureId id of the current feature
   */
  deleteFeature(featureModelId: string, featureId: number) {
    return this.db.get(featureModelId).then(result => {
      var result = result;

      var parentResult = this.getFeatureWithParentFromModel(result, featureId.toString());
      var featureIdList = this.listSubfeatureIdsHelper(parentResult.features)
      featureIdList.push(featureId);
      delete result['featureMap'][featureId]
      result = this.deleteFeatureAndDependeciesHelper(result, featureIdList, featureId);

      return this.db.put(result);
    });
  }

  /**
   * Helper functino to delete the current feature es the dependencies of the subfeatures.
   * @param featureModel the feature model
   * @param featureIdList list of the subfeature ids
   * @param featureId id of the current feature
   */
  private deleteFeatureAndDependeciesHelper(featureModel: any, featureIdList: any[], featureId: any) {
    var result = featureModel;
    var featureStack: any[] = []
    var featureFound: boolean = false;
    var featureIndex = -1;

    // Insert first level into the stack
    for (var i = 0; i < result['features'].length; i++) {
      var model = result['features'][i];
      featureStack.push(model);
    }

    // Select single feature from the stack
    while (featureStack.length > 0 && !featureFound) {
      var f = featureStack.pop();

      // Delete dependencies
      f.requiringDependencyFrom = f.requiringDependencyFrom.filter(function (e) { return !(featureIdList.includes(e)) });
      f.requiringDependencyTo = f.requiringDependencyTo.filter(function (e) { return !(featureIdList.includes(e)) });
      f.excludingDependency = f.excludingDependency.filter(function (e) { return !(featureIdList.includes(e)) });

      // Add new features to the stack
      if (f.features) {

        for (var i = 0; i < f.features.length; i++) {
          var model = f.features[i];

          // Find Feature
          if (model.id == featureId) {
            featureFound = true;
            featureIndex = i;
          } else {
            featureStack.push(model);
          }

          // Delete feature
          if (featureFound) {
            f.features.splice(featureIndex, 1);
            featureFound = false;
          }
        }
      }
    }

    return result;
  }

  /**
   * Lists the ids of the subfeatures.
   * @param featureList feature list
   */
  listSubfeatureIdsHelper(featureList: any[]): number[] {
    var featureStack: any[] = []
    var featureFound: boolean = false;
    var featureIdList = [];

    // Insert first level into the stack
    for (var i = 0; i < featureList.length; i++) {
      var model = featureList[featureList.length - 1 - i];
      featureStack.push(model);
    }

    // Select single feature from the stack
    while (featureStack.length > 0 && !featureFound) {
      var f = featureStack.pop();

      featureIdList.push(f.id);

      // Add new features to the stack
      if (f.features) {
        for (var i = 0; i < f.features.length; i++) {
          var model = f.features[f.features.length - 1 - i];
          featureStack.push(model);
        }
      }
    }

    return featureIdList;
  }

  /**
   * Update the current feature.
   * @param featureModelId id of the current feature model
   * @param featureId id of the current feature
   * @param featureName name of the current feature
   * @param isMandatory is the current feature mandatory
   * @param hasOrSubfeatures has the current feature or subfeatures
   * @param hasXorSubfeatures has the current feature xor subfeatures
   * @param subfeatureOf is a subfeature of
   * @param isPhysical is a physical object
   */
  updateFeature(
    featureModelId: string,
    featureId: number,
    featureName: string,
    isMandatory: boolean,
    hasOrSubfeatures: boolean,
    hasXorSubfeatures: boolean,
    subfeatureOf: number,
    isPhysical: boolean
  ) {
    return this.db.get(featureModelId).then(result => {
      var result = result;
      var parentResult = this.getFeatureWithParentFromModel(result, featureId.toString());

      // Complete updated feature
      var updatedFeature = {
        id: featureId,
        name: featureName,
        isMandatory: this.getBoolean(isMandatory),
        hasOrSubfeatures: this.getBoolean(hasOrSubfeatures),
        hasXorSubfeatures: this.getBoolean(hasXorSubfeatures),
        isDeletable: parentResult.isDeletable,
        isPhysical: this.getBoolean(isPhysical),
        features: parentResult.features,
        requiringDependencyFrom: parentResult.requiringDependencyFrom,
        requiringDependencyTo: parentResult.requiringDependencyTo,
        excludingDependency: parentResult.excludingDependency
      }

      // Gerenic function to update feature
      var updateFeatureInline = (result: any): any => {
        var result = result;
        result.name = featureName;
        result.isMandatory = this.getBoolean(isMandatory);
        result.hasOrSubfeatures = this.getBoolean(hasOrSubfeatures);
        result.hasXorSubfeatures = this.getBoolean(hasXorSubfeatures);
        result.isPhysical = this.getBoolean(isPhysical);

        return result;
      };

      // Generic function to delete feature
      var deleteFeatureInline = (featureId, result: any): any => {
        var result = result;
        result.features = result.features.filter(function (e) { return e.id != featureId });

        return result;
      }

      // Generic function to insert feature
      var insertFeatureInline = (result: any): any => {
        var result = result;
        result.features.push(updatedFeature);
        return result;
      }

      if (parentResult.parentId == subfeatureOf) {
        // No change of category
        result = this.updateFeatureHandler(result, featureId, updateFeatureInline);
      } else {
        // Change of category
        result = this.updateFeatureHandler(result, parentResult.parentId, deleteFeatureInline.bind(null, featureId));
        result = this.updateFeatureHandler(result, subfeatureOf, insertFeatureInline);
      }

      return this.db.put(result);
    });
  }

  /**
   * Add a new feature to the feature model.
   * @param featureModelId id of the feature model
   * @param featureName name of the feature
   * @param isMandatory is the feature mandatory
   * @param hasOrSubfeatures has the feature or subfeatures
   * @param hasXorSubfeatures has the feature xor subfeatures
   * @param subfeatureOf is subfeature of
   * @param isPhysical is a physical object
   */
  addFeature(
    featureModelId: string,
    featureName: string,
    isMandatory: boolean,
    hasOrSubfeatures: boolean,
    hasXorSubfeatures: boolean,
    subfeatureOf: number,
    isPhysical: boolean
  ) {
    return this.db.get(featureModelId).then(result => {
      var result = result;

      var feature = this.createFeatureByParameter(
        result['featureIdCounter'],
        featureName,
        isMandatory,
        hasOrSubfeatures,
        hasXorSubfeatures,
        true,
        isPhysical
      );

      // Generich function to insert feature
      var insertFeature = (result: any): any => {
        var result = result;
        result.features.push(feature);
        return result;
      }

      result = this.updateFeatureHandler(result, subfeatureOf, insertFeature);
      result['featureIdCounter'] = result['featureIdCounter'] + 1;
      result['featureMap'][feature.id] = feature.name;

      return this.db.put(result);
    });
  }

  /**
   * Helper function to update the feature model.
   * @param featureModel feature model
   * @param featureId id of the feature
   * @param modificationFunction function to modify feature
   */
  private updateFeatureHandler(featureModel: any, featureId: number, modificationFunction: (feature: number) => any): any {
    var result = featureModel;
    var featureStack: any[] = []
    var featureFound: boolean = false;


    for (var i = 0; i < result['features'].length; i++) {
      var model = result['features'][result['features'].length - 1 - i];
      featureStack.push(model);
    }

    // Select single feature from the stack
    while (featureStack.length > 0 && !featureFound) {
      var f = featureStack.pop();

      if (f.id == featureId) {
        featureFound = true;
        f = modificationFunction(f);
      }

      // Add new features to the stack
      if (f.features) {
        for (var i = 0; i < f.features.length; i++) {
          var model = f.features[f.features.length - 1 - i];
          featureStack.push(model);
        }
      }
    }

    return result;
  }

  /**
   * Get boolean out of any value.
   * @param value any value
   */
  private getBoolean(value: any): boolean {
    switch (value) {
      case true:
      case 'true':
      case 1:
      case '1':
      case 'on':
      case 'yes':
        return true;
      default:
        return false;
    }
  }

  /**
   * Create a new feature from parameters.
   * @param id id of the feature
   * @param name name of the feature
   * @param isMandatory is the feature mandatory
   * @param hasOrSubfeatures has the feature or subfeatures
   * @param hasXOrSubfature has the feature xor subfeature
   * @param isDeletetable is the feature deletable
   * @param isPhysical does the feature represent a physical object
   * @param requiringDependencyFrom requiring to dependencies of the feature
   * @param requiringDependencyTo requiring to dependencies of the feature
   * @param excludingDependency excluding dependencies of the feature
   * @param features subfeatures of the feature
   */
  private createFeatureByParameter(
    id: number,
    name: string,
    isMandatory: boolean = false,
    hasOrSubfeatures: boolean = false,
    hasXOrSubfature: boolean = false,
    isDeletetable: boolean = false,
    isPhysical: boolean = false,
    requiringDependencyFrom: number[] = [],
    requiringDependencyTo: number[] = [],
    excludingDependency: number[] = [],
    features: any[] = []
  ) {
    return {
      'id': id,
      'name': name,
      'isMandatory': this.getBoolean(isMandatory),
      'hasOrSubfeatures': this.getBoolean(hasOrSubfeatures),
      'hasXorSubfeatures': this.getBoolean(hasXOrSubfature),
      'isDeletable': this.getBoolean(isDeletetable),
      'isPhysical': this.getBoolean(isPhysical),
      'requiringDependencyFrom': requiringDependencyFrom,
      'requiringDependencyTo': requiringDependencyTo,
      'excludingDependency': excludingDependency,
      'features': features
    };
  }

  /**
   * Add default data to the database.
   */
  public async resetDatabase() {
    try {
      await this.db.destroy();
      this.db = new PouchDB(this.databaseName);
      return this.db.bulkDocs([]);
    }
    catch (error) {
      return error;
    }
  }
}

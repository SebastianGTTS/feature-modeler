# AR Feature Modeler
This Angular-based tool allows you to create Feature Models for Augmented Reality and export them as JSON.

## Introduction
This tool provides a browser-based interface to create Feature Models and is based on the [Angular framework](https://angular.io/) and the [PouchDB database](https://pouchdb.com/). It supports the basic set of Feature Model properties such as hierarchical feature trees, excluding and requiring dependencies, mandatory and optional features as well as OR and XOR feature selections. More advanced Feature Model additions like cardinalities are not currently supported. Feature Models created with this modeler can be exported as a JSON file by clicking on the “Save” button in the list of all models.

This software was intended as a support tool for a Master thesis exploring product configuration in Augmented Reality applied to the domain of kitchen furniture. For this purpose, the modeler uses the concept of “Metadata” — a block of information that describes properties of kitchen parts that are relevant for Augmented Reality. The modeler can attach such a block to any feature that corresponds to an actual physical object which is represented in the modeler by the “Is Physical” marker.

## Screenshots

| Startpage of the Feature Modeler | Creating Feature Model |
| ------ | ------ |
| [![alt text](images/startpage.png "Startpage of the Feature Modeler")](images/startpage.png) | [![alt text](images/model-creation.png "Create Feature Model")](images/model-creation.png) |

| Editing a Feature | Editing Feature Metadata |
| ------ | ------ |
| [![alt text](images/edit-feature.png "Derive Business Models")](images/edit-feature.png) | [![alt text](images/edit-metadata.png "Check Conformance")](images/edit-metadata.png) |

## Installation

1. Install [NodeJS](https://nodejs.org) and [AngularCLI](https://cli.angular.io/).
2. Clone the feature modeler repository to your computer.
3. Install all NPM packages with `npm install`.
4. Configure database:

    4.1. Internal database: By default the feature modeler is using PouchDB to store data directly in the web storage of the browser. The database can be changed in `src/app/service/pouchdb.service.ts` within the variable `databaseName` (default: `arpc-feature-modeler`).

    4.2. External database: The feature modeler also allows to use a CouchDB database as a persistent storage. For this, you need to change the `databaseName` in `src/app/service/pouchdb.service.ts` to `http://localhost:4200/database` and specify the url to the CouchDB in `proxy.conf.json` within the variable `target` (default: `http://localhost:5984/arpc-modeler`).

5. Start service:

    5.1. Internal database: Run the web application with `ng serve`.

    5.2. External database: Run the web application with `npm start` to use the proxy for the external database.

6. Have fun with the tool. :)

## License
The AR Feature Modeler is released under the MIT license.

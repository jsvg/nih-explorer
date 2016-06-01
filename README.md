[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ab5f17f922864a5b99da9c455b3fa8a0)](https://www.codacy.com/app/vangiessen_julian/nih-explorer?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jsvg/nih-explorer&amp;utm_campaign=Badge_Grade)

# NIH Explorer

A web application for exploring NIH funding activity.
Consists of three components:
* Python-based scripts for loading [NIH Exporter Data](exporter.nih.gov) into a mongo DB server (localhost used for example)
* A Node.js server wired up to mongo that spits out data in an API complient with the [{json:api}](jsonapi.org) spec
* An Ember.js web app to provide an ambitious means of exploring of the funding data

### Server
__Goal__: Provide a {json:api} compliant REST API

__Major tech components__
* Node / Express: server setup
* Fortune: basic auto-configured resource routes
* JSON-Serializer: for custom routes (search, aggregate)

### Client
__Goal__: Provide an interface rich with interactive data visualizations and complex but intuitive UI faceting

__Major tech components__
* Ember: framework
* C3: quick highly configurable charts

### ETL
__Goal__: Clean and restructure inherently messy public NIH funding data, and load into a mongo db instance

__Major tech components__
* Pandas: data wrangling library, essential to anything data-related
* ipython Notebook: web browser-based python IDE
* pymongo: mongo driver to allow mass data loading into mongo

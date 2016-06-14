[![Build Status](https://travis-ci.org/jsvg/nih-explorer.svg?branch=master)](https://travis-ci.org/jsvg/nih-explorer)
[![Dependency Status](https://gemnasium.com/badges/github.com/jsvg/nih-explorer.svg)](https://gemnasium.com/github.com/jsvg/nih-explorer)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ab5f17f922864a5b99da9c455b3fa8a0)](https://www.codacy.com/app/vangiessen_julian/nih-explorer?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jsvg/nih-explorer&amp;utm_campaign=Badge_Grade)

# NIH Explorer

A web application for exploring NIH funding activity.
Consists of three components:
* Python-based scripts for loading [NIH Exporter Data](exporter.nih.gov) into a Mongo DB server (localhost used for example)
* A Node.js server wired up to a MongoDB instance that provides data in a RESFful API compliant with the [{json:api}](jsonapi.org) spec
* An Ember.js web app to provide an ambitious means of exploring of the funding data

### Demo
![](http://g.recordit.co/Gw4Lg54pUZ.gif)

### Server
__Goal__: Provide a {json:api} compliant REST API

__Tech Components__
* [Node](https://nodejs.org/en/) / [Express](expressjs.com): server setup
* [JSON-Serializer](https://github.com/SeyZ/jsonapi-serializer): for complex aggregation and search functional routes
* [Fortune](fortunejs.com): auto-generated resource routes, configured to comply to {json:api}
* Basic load testing with [artillary.io](https://artillery.io) (results [here](http://htmlpreview.github.com/?https://github.com/jsvg/nih-explorer/blob/master/server/loadtest/report.html))

### Client
__Goal__: Provide an interface rich with interactive data visualizations and complex but intuitive UI faceting

__Tech Components__
* [Ember](http://emberjs.com/): MV* framework
* [C3](c3js.org): quick highly configurable charts
* [Bootstrap](https://github.com/twbs/bootstrap-sass): SASS-modified version of bootstrap

### ETL
__Goal__: Clean and restructure inherently messy public NIH funding data, and load into a mongo db instance

__Tech Components__
* [Pandas](http://pandas.pydata.org/): data wrangling library, essential to anything data-related
* [ipython Notebook](https://ipython.org/notebook.html): web browser-based python IDE
* [pymongo](https://api.mongodb.com/python/current/): mongo driver to allow mass data loading into mongo

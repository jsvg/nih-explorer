## Details

Namespace: api/v1
Host: localhost:8080
Available routes:
* index route @ /
* collection routes @ /collections
* schema based routes

## Route details
Information about route configurations.

#### Index route
Serves index.html file in server/public folder. This file is the result of building the client (ember build --environment=production --output-path=../server/public)

#### Collection routes
These are CRUDy routes that facilitate the use of the user stored collections feature. There are four in total.
* __GET /collections/:uuid__: retrieves all collections for a user
* __POST /collections__: stores a new collection for a user
* __PUT /collections__: overwrites an existing collection
* __DELETE /collections/:id__: removes a collection based on its ObjectID

#### Schema based routes
These are automatically generated routes based on the schema.js file in the server/api folder. The schema objects are consumed by the functional-route.js file (server/api/routes), which creates complex GET routes that allow for:
* attribute type-based filtering
* grouping / aggregation

#### To do
[ ] need to do validation for collection routes

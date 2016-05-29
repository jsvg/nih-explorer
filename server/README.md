# TODO
* Modify get request to include a count on the hasMany attributes, tf let mongo do counting instead of ember (via lazy, heavy promises)
  * Mongo Query: db.getCollection('objective').aggregate([{$project:{objective:1,count:{$size:"$products"}}}])

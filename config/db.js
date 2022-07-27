if (process.env.NODE_ENV == 'production') {
  module.exports = {
    mongoURI:
      'mongodb+srv://nathan_maia:<N4than&thais!>@blogapp-prod.xxrizwj.mongodb.net/?retryWrites=true&w=majority',
  };
} else {
  module.exports = { mongoURI: 'mongodb://localhost/blogapp' };
}

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://nathan_maia:<N4than&thais!>@blogapp-prod.xxrizwj.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

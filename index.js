const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.meaaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("carDoctorDB");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    //load services
    app.get('/services', async (req, res) => {
        const cursor = serviceCollection.find();
        const services = await cursor.toArray();
        res.send(services);
    })

    //load single service
    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId.createFromHexString(id)};
      const service = await serviceCollection.findOne(query);
      res.send(service);
    })

    //load orders
    app.get('/orders', async (req, res) => {
      let query = {};
      if(req.query?.email){
        query.email = req.query?.email;
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })

    //create an order
    app.post('/orders', async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

    //update an order
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const newOrder = req.body;
      const filter = {_id: ObjectId.createFromHexString(id)};
      const updateOrder = {
        $set: {
          status: newOrder.status,
        }
      };
      const result = await orderCollection.updateOne(filter, updateOrder);
      res.send(result);
    })

    //delete an order
    app.delete('/orders/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: ObjectId.createFromHexString(id)};
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running');
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// Middlewere

app.use(cors());
app.use(express.json());

// Mongo Driver

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hlezmce.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // db & Collections

        const database = client.db("carDoctorDB");
        const servicesCollection = database.collection("services");

        // CRUD Operations

        //Get All services
        app.get('/services', async (req, res) => {
            const query = {};
            const options = {
                // Sort returned documents in ascending order by title (A->Z)
                sort: { service_id: 1 },
                // Include only the `title` and `imdb` fields in each returned document
                // projection: { _id: 1, title: 1, service_id: 1, price:1},
            };
            // Execute query 
            const cursor = servicesCollection.find(query, options);
            const services = await cursor.toArray()
            // console.log(services)
            res.send(services)
            // Print a message if no documents were found
            // if ((await servicesCollection.countDocuments()) === 0) {
            //     console.log("No documents found!");
            // }
            // else {
            //     console.log("Founded")
            // }

            // // Print returned documents
            // for await (const service of services) {
            //     console.dir(service);
            // }
            // await services.forEach((service) => {
            //     console.log(service)
            // })
            
        })

        // Get Onle services // services Details

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const cursor = await servicesCollection.findOne(query)
            res.send(cursor)
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// apps

app.get(('/'), (req, res) => {
    res.send("Car Doctor Server Running on Port: " + port);
})

app.listen(port, () => {
    console.log("Server Running on Port " + port)
})


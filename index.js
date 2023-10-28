const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
const cookie = require('cookie-parser') // npm install cookie-parser
const port = process.env.PORT || 5000;
const app = express();

// Middleware

app.use(cors());
app.use(express.json());

// Middleware Custom

const verify = () => {
    
}

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

        // JWT
        app.post('/jwt', async (req, res) => {
            try {
                const body = req.body;

                const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1h'
                })

                res.cookie("token", token, {

                })
                // res.send(body)
            } catch (error) {
                console.log(error)
            }
        })

        // CRUD Operations

        //Get All services
        app.get('/services', async (req, res) => {
            try {
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
            }
            catch (error) {
                console.log(error)
            }

        })

        // Get One services // services Details

        app.get('/services/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const cursor = await servicesCollection.findOne(query)
                res.send(cursor)
            } catch (error) {
                console.log(error)
            }
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


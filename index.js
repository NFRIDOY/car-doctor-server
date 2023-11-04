const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
const cookie = require('cookie-parser'); // npm install cookie-parser
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const app = express();

// Middleware

app.use(cors({
    // ------------------------------------------
    // change Clint Side LInk Before Final Deploy
    // ------------------------------------------
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Middleware Custom
// console.log(process.env.ACCESS_TOKEN_SECRET)
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    // req.cookie?.token
    console.log(req.cookie);
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access, No Token' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {

            return res.status(401).send({ message: 'Unauthorized Access' })
        }
        console.log("verify")
        req.user = decoded;
        next()
    })
}

// Mongo Driver

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

// const uri = "mongodb://localhost:27017"
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hlezmce.mongodb.net/?retryWrites=true&w=majority`;
// const uri = 'mongodb://localhost:27017'

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
        // // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        // // jwt 
        // app.post('/jwt', async (req, res) => {
        //     try {
        //         const user = req.body;
        //         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //             expiresIn: '1h'
        //         })
        //         res
        //             .cookie('token', token, {
        //                 httpOnly: true,
        //                 secure: false, // HTTP => false // HTTPS => true
        //                 sameSite: 'none'
        //             })
        //             .send({ success: true })
        //     } catch (error) {
        //         console.log("error")
        //     }
        // })

        // db & Collections

        const database = client.db("carDoctorDB");
        const servicesCollection = database.collection("services");
        const cartCollection = database.collection("cart");

        // // // JWT
        app.post('/jwt', async (req, res) => {
            try {
                const user = req.body;

                const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: '1h'
                    }
                )

                // console.log("token", token)


                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

                })
                    .send({ message: 'true' })
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
                // console.log(error)
                console.log("error Service Get")
            }

        })

        // Get One services // services Details

        app.get('/services/:id', async (req, res) => {

            // console.log(req.user)

            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const cursor = await servicesCollection.findOne(query)
                res.send(cursor)
            } catch (error) {
                // console.log(error)
            }
        })

        // Set To cart 
        app.post('/cart', async (req, res) => {

            try {
                const bookedService = req.body;
                console.log(bookedService)
                const result = await cartCollection.insertOne(bookedService)
                res.send(result)
            } catch (error) {
                // console.log(error)
            }
        })

        // Get From cart
        app.get('/cart', verifyToken, async (req, res) => {
            try {
                const result = await cartCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.log("error")
            }
        })
        // Delete From cart
        app.delete('/cart/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }; // object id // _id
                // const query = {product_id: new ObjectId(id)}; // product_id
                const result = await cartCollection.deleteOne(query);
                res.send(result)
            } catch (error) {
                // console.log(error)
                console.log("error")
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


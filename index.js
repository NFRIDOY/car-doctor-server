const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// Middlewere

app.use(cors());
app.use(express.json());

// apps

app.get(('/'), (req, res) => {
    res.send("Car Doctor Server Running on Port: "+ port);
})

app.listen(port, () => {
    console.log("Server Running on Port "+ port)
})


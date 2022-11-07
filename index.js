const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 7007;

// -------Middle-Ware-----
app.use(cors());
app.use(express.json());


// -------Database Connection-------
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.vvll70g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnect() {
    try {
        await client.connect();
        console.log('Database Connected');

    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect();


// ------------End-Points-------------

app.get('/', (req, res) => {
    res.send({
        status: 'true',
        message: 'Service Review Server is Running.....'
    })
})


app.listen(port, () => {
    console.log(`Server is Running on Port: ${port}`);
})


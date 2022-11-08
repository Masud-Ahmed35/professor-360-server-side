const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

// -------------Collections-----------
const serviceCollection = client.db('professor-360').collection('services');
const reviewCollection = client.db('professor-360').collection('reviews');


// ------------End-Points-------------
app.get('/services', async (req, res) => {
    try {
        const cursor = serviceCollection.find({});
        const services = await cursor.toArray();

        res.send({
            success: true,
            message: 'Successfully Get The Data.',
            data: services
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/home-services', async (req, res) => {
    try {
        const cursor = serviceCollection.find({});
        const services = await cursor.limit(3).toArray();

        res.send({
            success: true,
            message: 'Successfully Get The Data.',
            data: services
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/service-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceCollection.findOne({ _id: ObjectId(id) });
        res.send({
            success: true,
            message: 'Successfully Get the Data.',
            data: service
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/', (req, res) => {
    try {
        res.send({
            success: true,
            message: 'Service Review Server is Running.....'
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Store Reviews
app.post('/reviews', async (req, res) => {
    try {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send({
            success: true,
            message: 'Your Review Submitted Successfully',
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }

})

// Get all reviews
app.get('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cursor = reviewCollection.find({ serviceId: id });
        const reviews = await cursor.toArray();

        res.send({
            success: true,
            message: 'Successfully Get The Data.',
            data: reviews
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }

})


app.listen(port, () => {
    console.log(`Server is Running on Port: ${port}`);
})


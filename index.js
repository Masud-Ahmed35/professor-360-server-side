const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({
            message: 'Unauthorized Access'
        })
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                message: 'Forbidden Access'
            })
        }
        req.decoded = decoded;
        next();
    })
}

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

// Get all service API
app.get('/services', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const cursor = serviceCollection.find({}).sort({ "time": -1 });
        const services = await cursor.skip(page * size).limit(size).toArray();
        const count = await serviceCollection.estimatedDocumentCount();

        res.send({
            success: true,
            message: 'Successfully Get The Data.',
            data: services,
            count: count
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Get service API using 'limit(3)'
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

// Get service-details API by ID
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

//  Root API
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

// Create review API with query (email)
app.get('/reviews', verifyJWT, async (req, res) => {
    try {

        const decoded = req.decoded;
        if (decoded.email !== req.query.email) {
            res.status(403).send({ message: 'Forbidden Access' })
        }

        let query = {};
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }

        const cursor = reviewCollection.find(query).sort({ "time": -1 });
        const reviews = await cursor.toArray();
        res.send({
            success: true,
            message: 'Get all the Reviews successfully',
            data: reviews
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Create Review API
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

// Get all reviews API
app.get('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cursor = reviewCollection.find({ serviceId: id }).sort({ "time": -1 });
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

// Create services API
app.post('/add-service', async (req, res) => {
    try {
        const service = req.body;
        const result = await serviceCollection.insertOne(service);
        res.send({
            success: true,
            message: 'Your Service Submitted Successfully',
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// get a single review API
app.get('/single-review/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const review = await reviewCollection.findOne({ _id: ObjectId(id) });
        res.send({
            success: true,
            message: 'Get the data',
            data: review
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Review Update API
app.patch('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const review = req.body;
        const query = { _id: ObjectId(id) };

        const updatedReview = {
            $set: {
                ratings: review.ratings,
                message: review.message,
                time: review.time
            }
        }

        const result = await reviewCollection.updateOne(query, updatedReview);
        res.send({
            success: true,
            message: 'Updated Successfully',
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Delete review API
app.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reviewCollection.deleteOne({ _id: ObjectId(id) });
        res.send({
            success: true,
            message: 'Deleted Successfully',
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// JWT API Token
app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
    res.send({ token })
})

app.listen(port, () => {
    console.log(`Server is Running on Port: ${port}`);
})


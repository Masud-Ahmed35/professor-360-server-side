const express = require('express');
const cors = require('cors');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7007;

// -------Middle-Ware-----
app.use(cors());
app.use(express.json());

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


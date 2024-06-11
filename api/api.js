const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const { TrxClient } = require('./trxClient.js');
const { Buffer } = require('buffer');
const BufferLayout = require('buffer-layout');

const app = express ();
app.use(bodyParser.urlencoded({ extended: false }), cors());

const PORT = 3099;

app.listen(PORT, () => {
    console.log("Express server Listening on PORT:", PORT);
});

app.get("/alive", (request, response) => {
    const status = {
        "status": "Running"
    };
    response.json(status);
});

app.post('/createBuffer', (request, response) => {
    const body = request.body;
    const amount = body.amount;

    // Create the data buffer
    const dataLayout = BufferLayout.struct([
        BufferLayout.u32('instruction'), // Instruction index
        BufferLayout.ns64('lamports')    // Amount to transfer in lamports
    ]);
    
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 2, // Transfer instruction index in the system program
        lamports: amount
    }, data);

    response.json({
        data: data,
    });
});
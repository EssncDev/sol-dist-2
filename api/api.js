const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const { Buffer } = require('buffer');
const BufferLayout = require('buffer-layout');
const { Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { TrxClient } = require("./trxClient");
const BN = require('bn.js'); 


const app = express ();
app.use(bodyParser.urlencoded({ extended: false }), cors());

const PORT = 3099;

const connection = new Connection('https://lively-floral-spring.solana-mainnet.quiknode.pro/cf5637abc2df49d46ad20957e38725c30bf70381/');
const trxClient = new TrxClient();

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
    const amount = parseInt(body.amount);
    
    const dataLayout = Buffer.alloc(9); // Allocate buffer of 9 bytes
    dataLayout[0] = 1;  // Instruction discriminator for Transfer (1)
    new BN(amount).toArrayLike(Buffer, 'le', 8).copy(dataLayout, 1);  // Encode amount in little endian
  
    response.json({
        data: dataLayout,
    });
});

app.post('/getTokenInfo', (request, response) => {
    const body = request.body;
    const tokenAddress = body.tokenAddress;
    const walletAddress = body.walletAddress;

    trxClient.getAssociatedTokenInfo(connection, walletAddress, tokenAddress)
    .then(
        (result) => {
            if (!result) {
                response.json({
                    data: false,
                });
            } else {
                response.json({
                    data: result,
                });
            }
            return;
        }
    )
});

app.post('/transferInstructionSol', (request, response) => {
    const body = request.body;
    const sender = body.sender;
    const receiver = body.receiver;
    const transferAmount = body.transferAmount;

    trxClient.transactionInstructionsSol(sender, receiver, transferAmount)
    .then(
        (result) => {
            if (!result) {
                response.json({
                    data: false,
                });
            } else {
                response.json({
                    data: result,
                });
            }
            return;
        }
    )
})

app.post('/transferInstructionSpl', (request, response) => {
    const body = request.body;
    const sender = body.sender;
    const senderAta = body.senderAta;
    const receiverAta = body.receiverAta;
    const transferAmount = body.transferAmount;

    trxClient.transactionInstructionsSpl(sender, senderAta, receiverAta, transferAmount)
    .then(
        (result) => {
            if (!result) {
                response.json({
                    data: false,
                });
            } else {
                response.json({
                    data: result,
                });
            }
            return;
        }
    )
})

app.post('/transferInstructionWithAtaCreation', (request, response) => {
    const body = request.body;
    const sender = body.sender;
    const senderAta = body.senderAta;
    const receiver = body.receiver;
    const receiverAta = body.receiverAta;
    const tokenAddress = body.tokenAddress;
    const transferAmout = body.transferAmount;

    trxClient.transactionInstructionsWithAtaCreation(sender, senderAta, receiverAta, receiver, tokenAddress, transferAmout)
    .then(
        (result) => {
            if (!result) {
                response.json({
                    data: false,
                });
            } else {
                response.json({
                    data: result,
                });
            }
            return;
        }
    )
})
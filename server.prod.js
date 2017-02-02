const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const spawn = require('child_process').spawn

app.use(bodyParser.json())
app.use(express.static('./static_prod'))

app.post('/_github_update', (req, res)=> {
    spawn('git', ['pull'])
    res.send('OK')
})

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})

const braintree = require("braintree");

app.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

app.post("/checkout", function (req, res) {
    const nonceFromTheClient = req.body.payment_method_nonce;
    // Use payment method nonce here
});

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "useYourMerchantId",
    publicKey: "useYourPublicKey",
    privateKey: "useYourPrivateKey"
});
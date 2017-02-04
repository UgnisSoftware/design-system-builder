const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const spawn = require('child_process').spawn
const braintree = require("braintree");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('./static_prod'))

app.post('/_github_update', (req, res)=> {
    spawn('git', ['pull'])
    res.send('OK')
})

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})


const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "svvgfsykg7vqjwcy",
    publicKey: "23r75bdpc4zf9m77",
    privateKey: "63d81bcb59bb5c4f9ebe6e8cb749d44a"
});

app.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

app.post("/checkout", function (req, res) {
    const nonceFromTheClient = req.body.payment_method_nonce;
    gateway.transaction.sale({
        amount: "10.00",
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    }, function (err, result) {
        console.log(err, result)
        if (result.success || result.transaction) {
            res.redirect('welcome' + result.transaction.id);
        } else {
            const transactionErrors = result.errors.deepErrors();
            req.flash('error', {msg: formatErrors(transactionErrors)});
            res.redirect('checkouts/new');
        }
    });
});

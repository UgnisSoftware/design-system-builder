const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const spawn = require('child_process').spawn
const braintree = require("braintree");
const uuid = require('node-uuid')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./static_prod'))

app.post('/_github_update', (req, res)=> {
    spawn('git', ['pull'])
    res.send('OK')
})

app.post('/save', (req, res)=> {
    fs.writeFile("./ugnis_components/app-" + uuid.v4() + '.json', JSON.stringify(req.body, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    res.send('OK')
})

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "svvgfsykg7vqjwcy",
    publicKey: "23r75bdpc4zf9m77",
    privateKey: "63d81bcb59bb5c4f9ebe6e8cb749d44a"
});

// lol best database ever
var users = {}
var currentToken = ''

app.post('/login', (req, res)=> {
    if(req.body.email === 'test@ugnis.com' && req.body.password === 'test'){
        currentToken = uuid.v4()
        if(!users[currentToken]){
            users[currentToken] = {token: currentToken, email:req.body.email}
        }
        res.json(users[currentToken])
    } else{
        return res.status(422).send({
            message: 'No such email or wrong password'
        });
    }
})

app.get('/user-data/:token', (req, res)=>{
    if(users[req.params.token]){
        return res.json(users[req.params.token])
    }
    res.status(422).send({
        message: 'No such user'
    });
})

app.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

app.post("/checkout", function (req, res) {

    const nonceFromTheClient = req.body.payment_method_nonce;

    gateway.customer.create({
        email: "example@ugnis.com",
    }, function (err, result) {
        gateway.paymentMethod.create({
            customerId: result.customer.id,
            paymentMethodNonce: nonceFromTheClient
        }, function (err, result) {
            gateway.subscription.create({
                paymentMethodToken: result.paymentMethod.token,
                planId: "f282"
            }, function (err, result) {
                if (result.success || result.transaction) {
                    users[currentToken].subscribed = true
                    res.redirect('_dev/confirmation?id=' + result.subscription.id);
                } else {
                    res.redirect('_dev/error');
                }
            });
        });
    });
});

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})
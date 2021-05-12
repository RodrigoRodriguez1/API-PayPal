const express    = require("express");
const bodyParser = require("body-parser");
var   fs       = require("fs");
var   paypal     = require('paypal-rest-sdk');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const dirname = path.join(__dirname, '/html/pagamento.html');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AYmxz0Ofabf6JYI5GvHw1D50EAh0fDwXMS9EpDQaGJzT9KqyJNkILLBfjlT_gNrApy7jNKiHKIwTTn5z',
    'client_secret': 'EFFqUYbQBRxOUJuWbqkqjQ7rDiBm2BfTIFwDQ9eFMBkprOBsfK9fxp-zzt6Snv7uWkW7sjK4G5lZLN5p'
  });
  


app.get('/', (req, res) =>{
    res.status(200).send(JSON.stringify({message: "Api NodeJS com integração para pagamento com paypal", autor: "Rodrigo Rodriguez"}));
});

app.post('/pay', (req,  res) => {

    console.log(req.body);

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "hhttps://API-PayPal.demarchiti.repl.co/success",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": req.body.name,
                    "sku": "item",
                    "price": req.body.preco,
                    "currency": "BRL",
                    "quantity": "1",
                }]
            },
            "amount": {
                "currency": "BRL",
                "total": req.body.preco
            },
            "description": "This is the payment description."
        }]
    };


    paypal.payment.create(create_payment_json, function(error, payment){
        if (error) {
            throw error;
        } else {

            //  payment.links.forEach(links => {
            //      if(links.rel == 'approval_url'){
            //          res.status(200).send({link: links.href});
            //      }
            //  })
            console.log(payment.links)

            for(let i = 0; i <   payment.links.length; i++){
                if(payment.links[i].rel  == 'approval_url'){
                    res.status(200).send({link: payment.links[i].href});
                }
            }
        }
    });

});

app.get('/success', (req, res) => {

    var execute_payment_json = {
        "payer_id": req.query.PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    }

    var paymentId = req.query.paymentId;
    var authid;
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
        console.log(JSON.stringify(payment));
        if(error){
            console.log(error.response);
        }else{
           
           if (payment.state === 'approved'){
                // Capture authorization.
               

                fs.readFile(dirname, (error, data) => {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data)
                })

            } else {
                console.log('payment not successful');
            }
        }
    })

    
});


app.get('/order', (req, res) => {
    // Set capture details.
    var capture_details = {
        amount: {
            "currency": "USD",
            "total": "1.00"
        },
        is_final_capture: false
    };
         console.log(req.query.id);
         paypal.order.get(req.query.id, capture_details,  (error, capture) =>{
                if (error) {
                    console.error(JSON.stringify(error));
                } else {
                    console.log(JSON.stringify(capture));
                }
            })
    })


app.listen(process.env.PORT || 3000); 
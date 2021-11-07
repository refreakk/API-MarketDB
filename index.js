const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const request = require('request')
const app = express();
const key = process.env.TOKEN;

app.get('/get/:id', function (req, res) {
    let id = Number(req.params.id);

    const options = {
        url: `https://api.marketdb.ru/v1/product/${id}`,
        headers: {
            'Authorization': `Bearer ${key}`
        }
    };
    async function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(body);
            const skuid = obj.items.map(element => {
                return element.id;
            });
            new Promise(async function(resolve, reject) {
                let arr = [];
                skuid.map(sku => {
                    const options = {
                        url: `https://api.marketdb.ru/v1/product/${id}/sku/${sku}/sales?from_time=2021-10-09T00:00:00.000-03:00&to_time=2021-11-06T23:59:59.000-03:00`,
                        headers: {
                            'Authorization': `Bearer ${key}`
                        }
                    };
                    function callback(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            const obj = JSON.parse(body);
                            const order = obj.result.map(order => {
                                return order.orderAmount;
                            });
                            const sum = order.reduce((sum, elem) => {
                                return sum + elem;
                            }, 0);
                            arr.push(sum);
                            resolve(arr);
                        }
                    }
                    request(options, callback);
                });
            }).then((data) => {
                setTimeout(() => {
                    res.send(data);
                }, 2000);
            });
        } else {
            console.log('error');
        }
    }
    request(options, callback);
});


app.listen(3000)
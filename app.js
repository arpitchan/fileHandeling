const http = require('http');
const express = require('express')
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');



const hostname = '127.0.0.1';
const port = process.env.PORT || 4000;

app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.send('hello bro!')
})

app.get('/setEnvironment/:process/:key/:value', (req, res) => {
    const process = req.params.process; // provide process name
    const key = req.params.key; // provide key 
    const value = req.params.value; // provide value

    if (!fs.existsSync(process)) {
        fs.mkdirSync(process);
    }
    fs.appendFile(`${process}/.env`, `${key}=${value}\n`, function (err) {
        res.send("saved !");
    });
})

app.get('/getEnvironment/:process', async (req, res) => {
    const process = req.params.process; // given process
    const Obj = {}; // will hold key value pair for the given process
    try {
        let contents = fs.readFileSync('sample-config.txt', 'utf8');

        if (!contents) {
            throw "Nothing to read"
        }

        
        contents = contents.split("\n").map(element => {
            return element.split("=")
        })


        contents.forEach(el => {
            Obj[el[0]] = el[1];
        })

        const envVars = dotenv.config({ path: Obj[process] })

        if (envVars.error) {
            throw result.error
        }

        res.send(JSON.stringify({[process]:envVars.parsed}));


    } catch (error) {
        res.send(error)
    }


})

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

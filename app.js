const http = require('http');
const express = require('express')
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

const hostname = '127.0.0.1';
const port = process.env.PORT || 4000;

const getFilePath = (process) => {
    Obj = {};
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

    console.log("getFilePath", Obj[process]);
    return Obj[process];
}

const readEnvFile = (process) => {
    const envVars = dotenv.config({ path: getFilePath(process) }) // process id for file path
    if (envVars.error) {
        throw result.error
    }
    console.log("readEnvFile", envVars.parsed)
    return envVars.parsed; // will return Obj with env vars
}


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hello bro!')
})

app.get('/setEnvironment/:process/:key/:value', async (req, res) => {
    const process = req.params.process; // provide process name
    const key = req.params.key; // provide key 
    const value = req.params.value; // provide value
    const filePath = await getFilePath(process); // path env file
    const envVars = await readEnvFile(process); // object of env vars

    try {

        if (Object.keys(envVars).length === 0) { // env file is empty
            fs.writeFileSync(`${filePath}`, `${key}=${value}\n`);
            console.log("created")
        } else if (key in envVars) { // if key exist update the value
            envVars[key] = value;
            let data = "";
            for (let key in envVars) {
                data += `${key}=${envVars[key]}\n`;
            }
            fs.writeFileSync(`${filePath}`, data);
            console.log("updated")
        } else {
            fs.appendFileSync(`${filePath}`, `${key}=${value}\n`);
            console.log("appended")
        }
        res.send(readEnvFile(process));
    } catch (error) {
        console.log(error);
        res.send(error);
    }

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

        res.send(JSON.stringify({ [process]: envVars.parsed }));


    } catch (error) {
        res.send(error)
    }


})

const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

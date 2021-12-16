const express = require('express')
const app = express()
const port = process.env.PORT || 1337;
const {parse} = require("./parser");
const {translate} = require("./translate");

app.use(express.json());

app.post('/parse', (req, res) => {
    const {statement} = req.body;
    res.send(parse(statement || "") || {});
})

app.post('/translate', (req, res) => {
    const {statement} = req.body;
    const {ast} = parse(statement || "") || {};
    const translated = translate(ast);
    const {verb} = translated;
    switch (verb) {
        case "find": {
            const {first, second} = translated;
            res.send(`db.${verb}(${JSON.stringify(first)},${JSON.stringify(second)})`);
            break;
        }
        case "createCollection" : {
            const {first, second} = translated;
            res.send(`db.${verb}("${first}")`);
            break;
        }
        case "insertOne" :
        case "insertMany" : {
            const {first} = translated;
            res.send(`db.${verb}(${JSON.stringify(first)})`);
            break;
        }

    }
})


app.listen(port, () => {
        console.log(`
            Example
            app
            listening
            at
            http://localhost:${port}`)
    }
)

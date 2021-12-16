const {Parser} = require('node-sql-parser/build/postgresql');
const parser = new Parser()

module.exports = {
    parse: parser.parse,
};
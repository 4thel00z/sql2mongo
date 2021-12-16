const translate = (ast) => {
    let {type} = ast;
    if (!type) type = ast[0].type;
    switch (type) {
        case "select":
            return translateSelect(ast);
        case "insert": {
            const {columns, values, table} = ast[0];
            const columnsDict = values.map((val, i) => {
                let res = {};
                val.forEach((innerVal, i) => {
                    res[columns[i]] = innerVal.value;
                });
                return res;
            });

            return translateInsert({table: table[0].table, values: columnsDict})
        }
        case "create":
            const {table} = ast;
            if (!table && table.length > 0) {
                throw new Error("Illegal create table statement");
            }
            return translateCreateTable({table: table[0].table});
    }
};


const translateCreateTable = ({table}) => {
    return {
        verb: "createCollection",
        first: table,
    }
}

const translateInsert = ({table, values}) => {
    if (values.length === 0) {
        return {
            table,
            verb: "insertOne",
            first: values[0],
        }
    }
    return {
        table,
        verb: "insertMany",
        first: values,
    }
}


const translateSelect = ({table, columns, where, limit}) => {
    if (columns === "*") return translateSelectAllColumns(table, where, limit);
    const translatedConditions = where ? translateWhere(where) : {};
    const translatedColumns = translateColumns(columns) || {};

    return {
        table,
        verb: "find",
        first: translatedColumns,
        second: translatedConditions,
        limit
    };
}
const translateSelectAllColumns = (table, where, limit) => {
    const translatedConditions = where? translateWhere(where) : {};
    return {
        table,
        verb: "find",
        first: {},
        second: translatedConditions,
    };
}


const translateColumns = (columns) => {
    const result = {};
    columns.forEach((val, i) => {
        result[value] = 1;
    })
    return result;

}
const translateWhere = (where, conditions) => {

    const {type, left, right, operator} = where;

    const container = conditions || {};
    switch (type) {
        case  "binary_expr":
            switch (operator) {
                //TODO: add recursion for right/left value
                case "=": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "double_quote_string":
                        case "number":
                            container[leftColumn] = rightValue;
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }
                case ">": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "number":
                            container[leftColumn] = {"$gt": rightValue};
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }
                case "<": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "number":
                            container[leftColumn] = {"$lt": rightValue};
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }
                case "<=": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "number":
                            container[leftColumn] = {"$lte": rightValue};
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }
                case ">=": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "number":
                            container[leftColumn] = {"$gte": rightValue};
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }
                case "LIKE": {
                    const leftColumn = left.column;
                    const rightValue = right.value;
                    const rightType = right.type;

                    switch (rightType) {
                        case "double_quote_string":
                            //TODO: translate rightValue, for now just replace %
                            container[leftColumn] = {
                                "$regex": `/${rightValue.replaceAll("%", "")}/`
                            };
                            break;
                        default:
                            throw new Error(`Do not know subtype of right value: ${rightType}`);
                    }
                    break;
                }

                case "AND":
                    translateWhere(left, container);
                    translateWhere(right, container);
                    break
                case "OR":
                    const leftTranslatedCondition = translateWhere(left, {});
                    const rightTranslatedCondition = translateWhere(right, {});
                    container["$or"] = [leftTranslatedCondition, rightTranslatedCondition];
                    break
            }
            break;


    }
    return container;
}


module.exports = {translate};

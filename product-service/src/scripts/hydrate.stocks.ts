const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});
var mockProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mocks/stocks.JSON'), 'utf8'));

export const populateProducts = async (item) => {
    try {
        await dynamoDb.put(item).promise();
    } catch (err) {
        console.log(err);
    }
}

mockProducts.forEach((product) => {
    let params = {
        Item: {
            product_id: product.id,
            count: product.count,
        },
        TableName: 'stocks'
    };
    populateProducts(params);
});
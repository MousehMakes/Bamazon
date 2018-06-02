/*require("dotenv").config();
var fs = require('fs');

//Allows for linking to files in same directory
var path = require('path');

var Personal = require('personal');
var personalPW = new Personal(keys.personal);

//Link Key File
var keys = require(path.resolve(__dirname, "./keys.js")); */


var mysql = require("mysql");
var inquirer = require("inquirer");

//vars to use when checking quantities pre-order for the user
var numInDB = 0;
var newDBNum = 0;
var numWanted = 0;
var wantedID = 0;

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: 'INSERT PASSWORD HERE',
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    listItems();
    promptChoice();
});

//Function to list all of the items for sale, their IDs, and their prices
function listItems() {
    //Query the database for all items available for sale
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log("");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Items For Sale:");
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("");
        for (var i = 0; i < results.length; i++) {

            console.log("Product ID: " + results[i].item_id + "," + '\n' + "Product Name: " + results[i].product_name + "," + '\n' + "Price: $" + results[i].price + "," + '\n' + "Number In Stock: " + results[i].stock_quantity);
            console.log("");
        }
    });
}

//Function to prompt the user for their choice of what they would like to buy
//and how much of that item they would like to buy
function promptChoice() {
    //Query DB for all items up for sale.
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        //Ask user what item they would like to buy
        inquirer
            .prompt([
                {
                    name: "itemChoice",
                    type: "input",
                    message: "What item would you like to buy(please enter the item ID as listed above)?"
                }
            ])
            .then(function (choice) {
                inquirer
                    .prompt([
                        {
                            name: "quantityChoice",
                            type: "input",
                            message: "What quantity would you like to buy?"
                        }
                    ])
                    .then(function (quantity) {
                        //Test to see if the quantity of the item in 
                        //the database is insufficient for what the
                        //user wants
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].item_id == choice.itemChoice) {
                                wantedID = results[i].item_id;
                                numInDB = results[i].stock_quantity;
                                numWanted = quantity.quantityChoice;
                            }
                        }

                        //If statement when there is insufficient quantity
                        //Else assumes the quantity the user wants is in our DB
                        if (numWanted > numInDB) {
                            console.log("");
                            console.log("Insufficient quantity! We only have " + numInDB + " of this item. Please try again.");
                            console.log("");
                            connection.end();
                        } else {
                            newDBNum = numInDB - numWanted;
                            var newQueryStr = 'UPDATE products SET stock_quantity = ' + newDBNum + ' WHERE item_id = ' + wantedID;
                            connection.query(newQueryStr, function (err, result) {
                                if (err) throw err;
                                connection.end();
                            });
                        }
                    });
            });
    });
}
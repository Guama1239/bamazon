var mysql = require("mysql");
var inquirer = require("inquirer");
var sTable = require("console.table");
var totalcost = 0;
// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

function readInventory() {
    connection.query("SELECT item_id, product_name, department_name, price , stock_quantity FROM products WHERE stock_quantity>0", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewlowInventory(){
    connection.query("SELECT item_id, product_name, department_name, price , stock_quantity FROM products WHERE stock_quantity<5", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    })
}

function addtoInventory() {
    inquirer.prompt ([
        {
            name: "itemNumber",
            type: "input",
            message: "Input the Item Number of the product to add to inventory"
        },
        {
            name: "increaseStockby",
            type: "input",
            message: `How many units of item selected would you like to add? `
        }
     ])
     .then (function(answer) {
         connection.query("SELECT * FROM products WHERE item_id = " + answer.itemNumber, function (err, results) {
                 //console.log(results);
                 var stockQuantity = results[0].stock_quantity;
                 updateDatabase(answer.itemNumber, stockQuantity, answer.increaseStockby)
});
});
}

function start() {
    // connection.query("SELECT * FROM bamazon_DB", function (err, results) {
    //  if (err) throw err; // once you have the data, itirate on the item index .    
    inquirer.prompt(
        {
            name: "L_options",
            type: "rawlist",
            message: " Welcome to bamazon Manager access !! Please select an option",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "EXIT"]
        })
        .then (function(answer) {
            if(answer.L_options === "View Products for Sale")
            {readInventory()}
            else if (answer.L_options === "View Low Inventory")
            {viewlowInventory()}
            else if (answer.L_options === "Add to Inventory")
            {addtoInventory()}
            else if (answer.L_options === "Add New Product")
            {addnewProduct()}
            else (connection.end())
        });
}




function addnewProduct() {
    // prompt for info about the new item to be added
    inquirer
        .prompt([
            {
                name: "productName",
                type: "input",
                message: "What is the name of new item you would like to submit?"
            },
            {
                name: "depName",
                type: "input",
                message: "What department name would you like to place new item in?"
            },
            {
                name: "itemPrice",
                type: "input",
                message: "What is the price of new item?"
            },
            {
                name: "stockQ",
                type: "input",
                message: "What is the stock quantity of new item?"
            },
        ])
.then(function (ans) {
connection.query(
    "INSERT INTO products SET ?",
    {
        product_name: ans.productName,
        department_name: ans.depName,
        price: parseInt(ans.itemPrice),
        stock_quantity: parseInt(ans.stockQ)
    },
    function (err) {
        if (err) throw err;
        console.log("New Item added to inventory ");
        start();
    }
);
})
}
function updateDatabase(id, stockQ, userquantity) {
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: stockQ + parseInt(userquantity)
            },
            {
                item_id: id
            }
        ],
        function (err, results) {
            //console.table(results);
            console.log("database updated");
            start()
        }
    )
}

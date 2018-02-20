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
    password: "password",
    database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    readInventory();
});

function readInventory() {
    connection.query("SELECT item_id, product_name, department_name, price , stock_quantity FROM products WHERE stock_quantity>0", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();    
    });
}

function start() {
   // connection.query("SELECT * FROM bamazon_DB", function (err, results) {
     //  if (err) throw err; // once you have the data, itirate on the item index .    
    inquirer .prompt ([
        {
            name: "item",
            type: "input",
            message: " Welcome to bamazon!! Please select the ID of the product you would like to buy.",
        },
        {
            name: "units",
            type: "input",
            message: "How many units would you like to buy ? ",
              
        }
    ])
        .then(function(answer) {
            connection.query("SELECT * FROM products WHERE item_id= " + answer.item, function (err, results) {
                //console.log(results);
                var stockQuantity = results[0].stock_quantity;
                if (parseInt(answer.units) > stockQuantity)
                {
                    console.log(`insufficient quantity of item: ${answer.item} item description: ${results[0].product_name} currently available ${stockQuantity}`);
                    start();
                }
                else {
                updateDatabase(answer.item, stockQuantity, answer.units, results[0].price);
               // totalCost(answer.units, results[0].price);
                }
            })
               
        });
}

function updateDatabase (id, stockQ, userquantity, priceI) {
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: stockQ - parseInt(userquantity)
            },
            {
                item_id: id
            }
        ],
        function (err, results) {
            //console.table(results);
            console.log("database updated");
            totalCost(userquantity, priceI)
            }
        )
}
        
function totalCost(userquantity, priceI) {
    totalcost = totalcost + (parseInt(userquantity) * priceI);
    console.log(`Your purchase total cost so far is $${totalcost} `);
    inquirer .prompt ([
        { 
            name : "choice",
            type : "input",
            message : " Would like to continue shopping ? Y or N "
        }
    ])
    .then (function(answer) {
        if (answer.choice === "y" | "Y"){
            start();
        }else{
            console.log(`Thank you for shopping at bamazon your total purchase is $${totalcost}  have a nice day`);
            connection.end()
        }
    })
}

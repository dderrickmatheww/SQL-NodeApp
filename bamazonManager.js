var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Blind5656!",
    database: "bamazon"
});


connection.connect(function (err) {

    if (err) throw err;
    questions();
});



function questions() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What do you want to do Mr. Manager?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                name: "actions"
            }

        ]).then(function (answer) {
            switch (answer.actions) {
                case "View Products for Sale":
                    table();
                    break;

                case "View Low Inventory":
                    lowInventory()
                    break;

                case "Add to Inventory":
                    addToInventory()
                    break;

                case "Add New Product":
                    addNewProduct()
                    break;

                case "Exit":
                    exit()
                    break;
            }
        })
}

function table() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log('\n\n')
        console.table(res);
        console.log('\n\n')
        questions()
    })
}

function lowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity BETWEEN ? AND ?";
    connection.query(query, [0, 5], function (err, result) {
        if (err) throw err;
        if (result === []) {
            console.log('\n\n')
            console.log('There are no low stock products!')
        } else {
            console.log('\n\n')
            console.table(result)
        }
        console.log('\n\n')
        questions()
    })
}

function addToInventory() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) console.log(err);
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "What product do you want to increase stock?",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].product_name);
                        }
                        return choiceArray;
                    },
                    name: "stock"
                },
                {
                    type: "number",
                    message: "How many units should we get?",
                    name: "about"
                }

            ]).then(function (answer) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name === answer.stock) {
                        chosenItem = res[i];
                      }
                }
                console.log('\n\n')
                console.log(chosenItem.product_name+"'s updated stock quantity: " + chosenItem.stock_quantity)
                
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenItem.stock_quantity + parseInt(answer.about)
                        },
                        {
                            product_name: answer.stock
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        console.log('\n\n')
                        console.log("Inventory updated successfully!");
                        console.log('\n\n')
                        questions()
                    }

                );
            })
    })
}

function addNewProduct(){
    inquirer
    .prompt([
      {
        name: "product_name",
        type: "input",
        message: "What is the product you would like to submit?"
      },
      {
        name: "department_name",
        type: "input",
        message: "What department would you like to place your product in?"
      },
      {
        name: "price",
        type: "number",
        message: "How much is your product?"
      },
      {
        name: "stock_quantity",
        type: "number",
        message: "How much do you have of your product?"
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.product_name,
          department_name: answer.department_name,
          price: answer.price,
          stock_quantity: answer.stock_quantity || 0
        },
        function(err) {
          if (err) throw err;
          console.log('\n\n')
          console.log("Your auction was created successfully!");
          console.log('\n\n')
          // re-prompt the user for if they want to bid or post
          questions();
        }
      );
    });
}

function exit(){
    connection.end()
}


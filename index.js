//dependencies
const mysql = require('mysql2');
const inquirer = require("inquirer");
const consoleTable = require("console.table");

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'epmloyeeCMS'
});

connection.connect(err => {
    if (err) throw err;

    //start main fuction 
    console.log('\n Welcome to EmployeeCMS \n');
    mainMenu();
});

const choices = ["View all departments.", "View all roles.", "View all employees.", "Add a department.", "Add a role.", "Add an employee.", "Update an employee role.", "EXIT APP"]

//main menu function
function mainMenu() {
    inquirer.prompt
        (
            {
                name: "selection",
                type: "list",
                message: "MAIN MENU",
                choices: choices
            }
        )
        .then(({ selection }) => {
            if (selection === choices[0]) {
                viewDepartments();
            }
            else if (selection === choices[1]) {
                viewRoles();
            }
            else if (selection === choices[2]) {
                viewEmployees();
            }
            else if (selection === choices[3]) {
                addDepartment();
            }
            else if (selection === choices[4]) {
                addRole();
            }
            else if (selection === choices[5]) {
                addEmployee();
            }
            else if (selection === choices[6]) {
                updateEmployee();
            }
            else if (selection === choices[7]) {
                quit();
            }
        })
}



function quit() {
    console.log("Thanks for using the EmployeeCMS App. Goodbye!");
    process.exit();
}
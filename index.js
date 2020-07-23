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
    database: 'employeeCMS'
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

//function to view all departments
function viewDepartments() {
    connection.promise().query('SELECT * FROM department')
        .then(([rows, fields]) => {
            console.table(rows);
            promptReturn();
        })
}

//function to view all roles
function viewRoles() {
    connection.promise().query('SELECT role.id, role.title, department.name AS \"department"\, role.salary FROM role INNER JOIN department ON role.department_id=department.id')
        .then(([rows, fields]) => {
            console.table(rows);
            promptReturn();
        })
}

//function to view all employees
function viewEmployees() {
    connection.promise().query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id")
        .then(([rows, fields]) => {
            console.table(rows);
            promptReturn();
        })
}

//function to add a department
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        message: 'Enter department name.',
        name: 'department'
    })
        .then(function (res) {
            connection.promise().query('INSERT INTO department SET ?',
                { name: res.department },
                function (err) {
                    if (err) {
                        throw err;
                    }
                }
            )
            console.log("The " + res.department + " has been added to deparments!")
            promptReturn();
        });
}

//function to add a role
function addRole() {

    //grab and hold all of the departments
    const departmentArr = [];
    function selectDepartment() {
        connection.promise().query("SELECT * FROM department", function (err, res) {
            if (err) throw err
            for (var i = 0; i < res.length; i++) {
                departmentArr.push(res[i].name);
            }
        })
        return departmentArr;
    }

    connection.promise().query("SELECT role.title AS Title, role.salary AS Salary FROM role", function (err, res) {
        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "What is the title of the role?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary of the role?"
            },
            {
                name: "department",
                type: "list",
                message: "What department does this role belong to?",
                choices: selectDepartment()
            }
        ]).then(function (res) {
            let department = selectDepartment().indexOf(res.department) + 1
            connection.promise().query("INSERT INTO role SET ?",
                {
                    title: res.title,
                    salary: res.salary,
                    department_id: department
                },
                function (err) {
                    if (err) {
                        throw err;
                    }
                })
            console.table(res.title + " with a salary of " + res.salary + " has been added to roles!");
            promptReturn();
        })
    });
}


//function to add a new employee
function addEmployee() {

    const managersArr = [];
    function selectManager() {
        connection.promise().query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                managersArr.push(res[i].first_name + ' ' + res[i].last_name);
            }
        })
        return managersArr;
    }

    const roleArr = [];
    function selectRole() {
        connection.promise().query("SELECT * FROM role", function (err, res) {
            if (err) throw err
            for (var i = 0; i < res.length; i++) {
                roleArr.push(res[i].title);
            }
        })
        return roleArr;
    }

    inquirer.prompt([
        {
            name: "firstname",
            type: "input",
            message: "Enter employee's first name."
        },
        {
            name: "lastname",
            type: "input",
            message: "Enter employee's last name. "
        },
        {
            name: "role",
            type: "list",
            message: "What is their role? ",
            choices: selectRole()
        },
        {
            name: "manager",
            type: "list",
            message: "Whats their managers name?",
            choices: selectManager()
        }
    ]).then(function (answer) {
        let role = selectRole().indexOf(answer.role) + 1
        let manager = selectManager().indexOf(answer.manager) + 1
        connection.query("INSERT INTO employee SET ?",
            {
                first_name: answer.firstname,
                last_name: answer.lastname,
                role_id: role,
                manager_id: manager
            },
            function (err) {
                if (err) throw err;
            })
        console.table(answer.firstname + ' ' + answer.lastname + " has been added to the employees list!")
        promptReturn();
    })
}
// function to update role on an employee
function updateEmployee() {
    var employeeQuery = `SELECT employee.id, first_name, last_name, role.title FROM employee JOIN role ON employee.role_id = role.id`;

    connection.query(employeeQuery, function (err, res) {
        if (err) throw err;

        const employeeChoices = res.map(({ id, first_name, last_name }) => ({
            value: id, name: `${first_name} ${last_name}`
        }));
        var roleQuery = `SELECT id, title FROM role`
        let roleChoices;

        connection.query(roleQuery, function (err, res) {
            if (err) throw err;

            roleChoices = res.map(({ id, title }) => ({
                value: id + " " + title
            }));

            inquirer.prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Which employee do you want to set with the role?",
                    choices: employeeChoices
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "Which role do you want to update?",
                    choices: roleChoices
                },
            ])
                .then(function (answer) {

                    role = answer.roleId.split(" ");

                    var query = `UPDATE employee SET role_id = ? WHERE id = ?`
                    // when finished prompting, insert a new item into the db with that info
                    connection.query(query,
                        [role[0],
                        answer.employeeId
                        ],
                        function (err, res) {
                            if (err) throw err;
                            promptReturn();
                        });
                });
        });
    })
}

//function to return user to the main menu if desired.
const promptReturn = () => {
    inquirer.prompt
        (
            {
                name: "returnMainMenu",
                type: "confirm",
                message: "Would you like to return to the main menu?",
                default: true
            }
        )
        .then(({ returnMainMenu }) => {
            if (returnMainMenu === true) {
                mainMenu();
            } else {
                quit()
            }
        })
}


function quit() {
    console.log("Thanks for using the EmployeeCMS App. Goodbye!");
    process.exit();
}
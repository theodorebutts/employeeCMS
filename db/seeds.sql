USE employeeCMS;

INSERT INTO department (name)
VALUES ("Sales"), ("Marketing"), ("Finance"),('Human Resources');

INSERT INTO role (title, salary, department_id)
VALUES
("VP Sales", 100000, 1),
("Salesperson", 80000, 1),
("Marketing Director", 150000, 2), 
("Designer", 120000, 2),
("Accountant", 125000, 3),
('VP Human Resources', 190000, 4), 
('Human Resource Generalist', 65000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Bob", "Marley", 2, null), 
("John", "Doe", 3, null),
("Catra", "Meowmeow", 4, 2),
("Finn", "Meowmeow", 6, null),
("Steve", "Rogers", 2, 1),
("Mark", "Nutt", 2, 1);
import inquirer from 'inquirer';
import { pool, connectToDb} from './connection.js';
import dotenv from 'dotenv';
dotenv.config();



async function connectDB() {
    await dbClient.connect();
}

async function viewDepartments() {
    const result = await pool.query('SELECT * FROM department');
    console.table(result.rows);
}

async function viewRoles() {
    const result = await pool.query('SELECT * FROM role');
    console.table(result.rows);
}

async function viewEmployees() {
    const result = await pool.query('SELECT * FROM employee');
    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the department name:',
    });

    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added successfully.`);
}

async function addRole() {
    const departmentChoices = await pool.query('SELECT id, name FROM department');
    const departmentOptions = departmentChoices.rows.map(row => ({
        value: row.id,
        name: row.name,
    }));

    const { name, salary, department_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the role name:',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the role salary:',
            validate: (value) => {
                if (isNaN(value) || value <= 0) {
                    return 'Salary must be a positive number.';
                }
                return true;
            },
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Choose the department for the role:',
            choices: departmentOptions,
        },
    ]);

    await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [name, salary, department_id]);
    console.log(`Role "${name}" added successfully.`);
}

async function updateEmployeeRole() {
    const employeeChoices = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeOptions = employeeChoices.rows.map(row => ({
        value: row.id,
        name: `${row.first_name} ${row.last_name}`,
    }));

    const roleChoices = await pool.query('SELECT id, title FROM role');
    const roleOptions = roleChoices.rows.map(row => ({
        value: row.id,
        name: row.title,
    }));

    const { employee_id, new_role_id } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Choose the employee to update:',
            choices: employeeOptions,
        },
        {
            type: 'list',
            name: 'new_role_id',
            message: 'Choose the new role for the employee:',
            choices: roleOptions,
        }
    ]);
    
    await pool.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [new_role_id, employee_id]
    );

    console.log(`Updated employee role for ${employeeOptions.find(option => option.value === employee_id).name}.`);
}

async function menu() {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    });

    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            await pool.end();
            console.log('Disconnected from the database.');
            return; // Exit the function to prevent re-entering the menu
        default:
            console.log('Invalid option. Please try again.');
    }
    await menu(); // Loop back to the menu after completing the action
}

async function start() {
    await connectToDb();
    await menu();
}

start().catch(err => console.error('Error starting application:', err));
import inquirer from 'inquirer';
import { pool, connectToDb} from './connection.js';
import dotenv from 'dotenv';
dotenv.config();



async function connectDB() {
    await dbClient.connect();
}

async function viewDepartments() {
    const result = await pool.query('SELECT * FROM departments');
    console.table(result.rows);
}

async function viewRoles() {
    const result = await pool.query('SELECT * FROM roles');
    console.table(result.rows);
}

async function viewEmployees() {
    const result = await pool.query('SELECT * FROM employees');
    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the department name:',
    });

    await pool.query('INSERT INTO departments (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added successfully.`);
}

async function addRole() {
    const departmentChoices = await pool.query('SELECT id, name FROM departments');
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

    await pool.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [name, salary, department_id]);
    console.log(`Role "${name}" added successfully.`);
}

async function addEmployee() {
    const roleChoices = await pool.query('SELECT id, title FROM roles');
    const roleOptions = roleChoices.rows.map(row => ({
        value: row.id,
        name: row.title,
    }));
    const managerChoices = await pool.query('SELECT id, first_name, last_name FROM employees WHERE manager_id is null');
    const managerOptions = managerChoices.rows.map(row => ({
        value: row.id,
        name: `${row.first_name} ${row.last_name}`,
    }));
    managerOptions.push({value:null, name: 'I AM Manager'})
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter your first name:',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter your last name:',
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Choose the role:',
            choices: roleOptions,
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Choose who is their manager:',
            choices: managerOptions,
        },
    ]);

    await pool.query('INSERT INTO employees ( first_name, last_name, role_id, manager_id ) VALUES ($1, $2, $3, $4)', [ first_name, last_name, role_id, manager_id ]);
    console.log(`${first_name}" added successfully.`);
}

async function updateEmployeeRole() {
    const employeeChoices = await pool.query('SELECT id, first_name, last_name FROM employees');
    const employeeOptions = employeeChoices.rows.map(row => ({
        value: row.id,
        name: `${row.first_name} ${row.last_name}`,
    }));

    const roleChoices = await pool.query('SELECT id, title FROM roles');
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
        'UPDATE employees SET role_id = $1 WHERE id = $2',
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
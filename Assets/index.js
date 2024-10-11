const client = new client ({
    user: 'your_username',
    host: 'localhost',
    database: 'tracker_db',
    password: 'your_password',
    port: 5432,
});

async function connectDB() {
    await client.connect();
}

async function viewDepartments() {
    const result = await client.query('SELECT * FROM departments');
    console.table(result.rows);
}

async function viewRoles() {
    const result = await client.query('SELECT * FROM roles');
    console.table(result.rows);
}

async function viewEmployees() {
    const result = await client.query('SELECT * FROM employees');
    console.table(result.rows);
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the department name:',
    });

    const result = await client.query('INSERT INTO departments (name) VALUES ($1)', [name]);
    console.log(`Department "${name}" added successfully.`);
}

async function addRole() {
    const departmentChoices = await client.query('SELECT id, name FROM departments');
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
            name:'salary',
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

    const result = await client.query
}
async function addEmployee() {
    // Fetch departments and roles from the database
    const departmentChoices = await client.query('SELECT id, name FROM departments');
    const departmentOptions = departmentChoices.rows.map(row => ({
        value: row.id,
        name: row.name,
    }));

    const roleChoices = await client.query('SELECT id, title FROM role'); // Changed to 'title' to match the schema
    const roleOptions = roleChoices.rows.map(row => ({
        value: row.id,
        name: row.title, // Use 'title' for roles
    }));

    // Prompt user for employee details
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the employee first name:',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the employee last name:',
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Choose the role for the employee:',
            choices: roleOptions,
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Choose the manager for the employee (or select "None"):',
            choices: [
                ...departmentOptions,
                { value: null, name: 'None' } // Option for no manager
            ],
        }
    ]);

    // Insert the new employee into the database
    await client.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
        [first_name, last_name, role_id, manager_id]
    );

    console.log(`Added employee ${first_name} ${last_name} to the database.`);
}

async function updateEmployeeRole() {
    const employeeChoices = await client.query('SELECT id, first_name, last_name FROM employee');
    const employeeOptions = employeeChoices.rows.map(row => ({
        value: row.id,
        name: `${row.first_name} ${row.last_name}`,
    }));

    const roleChoices = await client.query('SELECT id, title FROM role');
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
    await client.query(
        'UPDATE employee SET role_id = $1 WHERE id = $2',
        [new_role_id, employee_id]
    );

    console.log(`Updated employee role for ${employeeOptions.find(option => option.value === employee_id).name}`);ß
}



async function menu() {
    await inquirer.prompt({
        tyoe: 'list',
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
            client.end();
            break;
        default:
            console.log('Invalid option. Please try again.');
    }
    menu();
}

async function start() {
    await connectDB();
    menu();
}

start();
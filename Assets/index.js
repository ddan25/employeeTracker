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
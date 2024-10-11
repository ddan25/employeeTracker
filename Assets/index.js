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
}
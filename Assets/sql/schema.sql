DROP DATABASE IF EXISTS tracker_db;
CREATE DATABASE tracker_db;

CREATE TABLE departments (
    id SERIAL PRIMAARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- DROP DATABASE IF EXISTS courses_db;
-- CREATE DATABASE courses_db;

-- \c courses_db;

-- CREATE TABLE departments (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(30) NOT NULL
-- );

-- CREATE TABLE course_names (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(30) NOT NULL,
--   department INTEGER,
--   FOREIGN KEY (department)
--   REFERENCES department(id)
--   ON DELETE SET NULL
-- );



       SELECT *
FROM course_names
JOIN departments ON course_names.department = departments.id;

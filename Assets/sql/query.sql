--        SELECT *
-- FROM course_names
-- JOIN departments ON course_names.department = departments.id;

SELECT * FROM departments

SELECT * FROM roles

SELECT * FROM employees

INSERT INTO departments (name) VALUES ($1)

SELECT id, name FROM departments
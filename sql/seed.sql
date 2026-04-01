CREATE EXTENSION IF NOT EXISTS pgcrypto;

TRUNCATE TABLE enrollments, courses, users RESTART IDENTITY CASCADE;

INSERT INTO users (full_name, login, password_hash, role)
VALUES
    (
        'Admin User',
        'admin',
        crypt('admin123', gen_salt('bf')),
        'admin'
    ),
    (
        'Іван Петренко',
        'teacher_ivan',
        crypt('teacher123', gen_salt('bf')),
        'teacher'
    ),
    (
        'Олена Коваль',
        'teacher_olena',
        crypt('teacher123', gen_salt('bf')),
        'teacher'
    ),
    (
        'Анна Мельник',
        'student_anna',
        crypt('student123', gen_salt('bf')),
        'student'
    ),
    (
        'Максим Бондар',
        'student_max',
        crypt('student123', gen_salt('bf')),
        'student'
    ),
    (
        'Софія Литвин',
        'student_sofia',
        crypt('student123', gen_salt('bf')),
        'student'
    ),
    (
        'Андрій Шевчук',
        'student_andriy',
        crypt('student123', gen_salt('bf')),
        'student'
    );

INSERT INTO courses (title, description, teacher_id)
VALUES
    (
        'Web Development Basics',
        'Основи веброзробки: HTML, CSS, JavaScript.',
        (SELECT id FROM users WHERE login = 'teacher_ivan')
    ),
    (
        'Database Fundamentals',
        'Базові принципи роботи з реляційними базами даних та SQL.',
        (SELECT id FROM users WHERE login = 'teacher_olena')
    ),
    (
        'Node.js for Beginners',
        'Вступ до серверної розробки на Node.js.',
        (SELECT id FROM users WHERE login = 'teacher_ivan')
    ),
    (
        'UI/UX Basics',
        'Основи зручного інтерфейсу та користувацького досвіду.',
        (SELECT id FROM users WHERE login = 'teacher_olena')
    );

INSERT INTO enrollments (student_id, course_id, status, grade, review)
VALUES
    (
        (SELECT id FROM users WHERE login = 'student_anna'),
        (SELECT id FROM courses WHERE title = 'Web Development Basics'),
        'completed',
        95,
        'Відмінна робота, добре засвоєно матеріал.'
    ),
    (
        (SELECT id FROM users WHERE login = 'student_anna'),
        (SELECT id FROM courses WHERE title = 'Database Fundamentals'),
        'in_progress',
        NULL,
        NULL
    ),
    (
        (SELECT id FROM users WHERE login = 'student_max'),
        (SELECT id FROM courses WHERE title = 'Web Development Basics'),
        'completed',
        82,
        'Хороший результат, але варто більше уваги приділяти практиці.'
    ),
    (
        (SELECT id FROM users WHERE login = 'student_sofia'),
        (SELECT id FROM courses WHERE title = 'Node.js for Beginners'),
        'enrolled',
        NULL,
        NULL
    ),
    (
        (SELECT id FROM users WHERE login = 'student_andriy'),
        (SELECT id FROM courses WHERE title = 'UI/UX Basics'),
        'completed',
        88,
        'Добре виконав завдання, має хороше розуміння принципів UX.'
    ),
    (
        (SELECT id FROM users WHERE login = 'student_max'),
        (SELECT id FROM courses WHERE title = 'Database Fundamentals'),
        'in_progress',
        NULL,
        NULL
    ),
    (
        (SELECT id FROM users WHERE login = 'student_sofia'),
        (SELECT id FROM courses WHERE title = 'UI/UX Basics'),
        'enrolled',
        NULL,
        NULL
    );
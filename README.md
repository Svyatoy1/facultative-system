# Facultative System

Server-side web application for managing facultative courses.  
The project was developed as a laboratory work in JavaScript without using high-level backend frameworks.

## Project idea

The system allows:
- students to view available courses;
- students to enroll in courses;
- teachers to view their own courses;
- teachers to manage enrolled students;
- teachers to assign course status, grade, and review.

Authentication is implemented with login/password, sessions, and cookies.

## Main requirements covered

This project includes:
- custom HTTP routing;
- custom MVC-style structure;
- DAO pattern;
- manual SQL queries without ORM;
- HTML forms for create/update actions;
- authentication with session + cookie;
- role-based access;
- logging;
- unit tests;
- `.gitignore`;
- remote Git repository support.

## Technologies

- Node.js
- native `http` module
- PostgreSQL
- `pg`
- EJS
- Jest
- ESLint
- Prettier

## Project structure

```text
facultative-system/
├── logs/
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── CourseController.js
│   │   └── TeacherController.js
│   ├── core/
│   │   ├── http/
│   │   │   └── BodyParser.js
│   │   ├── router/
│   │   │   └── Router.js
│   │   ├── session/
│   │   │   ├── CookieHelper.js
│   │   │   └── SessionManager.js
│   │   └── view/
│   │       └── ViewRenderer.js
│   ├── dao/
│   │   ├── CourseDao.js
│   │   ├── EnrollmentDao.js
│   │   └── UserDao.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── CourseService.js
│   │   └── TeacherService.js
│   ├── utils/
│   │   └── logger.js
│   └── views/
│       ├── auth/
│       ├── student/
│       ├── teacher/
│       └── partials/
├── tests/
│   └── services/
│       ├── AuthService.test.js
│       ├── CourseService.test.js
│       └── TeacherService.test.js
├── .env
├── .env.example
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
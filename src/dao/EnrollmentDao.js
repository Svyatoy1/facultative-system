const pool = require('../config/db');

class EnrollmentDao {
  async findByStudentAndCourse(studentId, courseId) {
    const query = `
      SELECT *
      FROM enrollments
      WHERE student_id = $1 AND course_id = $2
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [studentId, courseId]);
    return rows[0] || null;
  }

  async createEnrollment(studentId, courseId) {
    const query = `
      INSERT INTO enrollments (student_id, course_id, status)
      VALUES ($1, $2, 'enrolled')
      RETURNING *
    `;

    const { rows } = await pool.query(query, [studentId, courseId]);
    return rows[0];
  }

  async findByStudentId(studentId) {
    const query = `
      SELECT
        e.id,
        e.status,
        e.grade,
        e.review,
        e.enrolled_at,
        c.id AS course_id,
        c.title,
        c.description,
        t.full_name AS teacher_name
      FROM enrollments e
      JOIN courses c
        ON c.id = e.course_id
      JOIN users t
        ON t.id = c.teacher_id
      WHERE e.student_id = $1
      ORDER BY e.id
    `;

    const { rows } = await pool.query(query, [studentId]);
    return rows;
  }

  async findByCourseId(courseId) {
    const query = `
      SELECT
        e.id,
        e.status,
        e.grade,
        e.review,
        e.enrolled_at,
        u.id AS student_id,
        u.full_name AS student_name,
        u.login AS student_login
      FROM enrollments e
      JOIN users u
        ON u.id = e.student_id
      WHERE e.course_id = $1
      ORDER BY e.id
    `;

    const { rows } = await pool.query(query, [courseId]);
    return rows;
  }

  async findById(enrollmentId) {
    const query = `
      SELECT
        e.id,
        e.student_id,
        e.course_id,
        e.status,
        e.grade,
        e.review,
        u.full_name AS student_name,
        u.login AS student_login,
        c.title AS course_title,
        c.teacher_id
      FROM enrollments e
      JOIN users u
        ON u.id = e.student_id
      JOIN courses c
        ON c.id = e.course_id
      WHERE e.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [enrollmentId]);
    return rows[0] || null;
  }

  async updateResult(enrollmentId, grade, review, status) {
    const query = `
      UPDATE enrollments
      SET
        grade = $2,
        review = $3,
        status = $4
      WHERE id = $1
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      enrollmentId,
      grade,
      review,
      status
    ]);

    return rows[0] || null;
  }
}

module.exports = EnrollmentDao;
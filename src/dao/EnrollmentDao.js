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
}

module.exports = EnrollmentDao;
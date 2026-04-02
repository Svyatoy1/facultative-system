const pool = require('../config/db');

class CourseDao {
  async findAllForStudent(studentId) {
    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        t.full_name AS teacher_name,
        e.id AS enrollment_id,
        e.status AS enrollment_status
      FROM courses c
      JOIN users t
        ON t.id = c.teacher_id
      LEFT JOIN enrollments e
        ON e.course_id = c.id
       AND e.student_id = $1
      ORDER BY c.id
    `;

    const { rows } = await pool.query(query, [studentId]);
    return rows;
  }

  async findByTeacherId(teacherId) {
    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.created_at
      FROM courses c
      WHERE c.teacher_id = $1
      ORDER BY c.id
    `;

    const { rows } = await pool.query(query, [teacherId]);
    return rows;
  }

  async findById(courseId) {
    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.teacher_id,
        t.full_name AS teacher_name
      FROM courses c
      JOIN users t
        ON t.id = c.teacher_id
      WHERE c.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [courseId]);
    return rows[0] || null;
  }

  async findByIdAndTeacherId(courseId, teacherId) {
    const query = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.teacher_id
      FROM courses c
      WHERE c.id = $1 AND c.teacher_id = $2
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [courseId, teacherId]);
    return rows[0] || null;
  }
}

module.exports = CourseDao;
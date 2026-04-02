class TeacherController {
  constructor(teacherService) {
    this.teacherService = teacherService;
  }

  async showCourseStudents(req, res) {
    const result = await this.teacherService.getCourseStudents(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Error</h1>
        <p>${result.message}</p>
        <p><a href="/teacher/courses">Back to my courses</a></p>
      `);
      return;
    }

    const studentsHtml = result.students
      .map((student) => {
        return `
          <tr>
            <td>${student.student_name}</td>
            <td>${student.student_login}</td>
            <td>${student.status}</td>
            <td>${student.grade ?? '—'}</td>
            <td>
              <a href="/teacher/enrollments/${student.id}/edit">Edit result</a>
            </td>
          </tr>
        `;
      })
      .join('');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Students for: ${result.course.title}</h1>
      <p><a href="/teacher/courses">Back to my courses</a></p>

      ${
        result.students.length
          ? `
            <table border="1" cellpadding="8" cellspacing="0">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Login</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${studentsHtml}
              </tbody>
            </table>
          `
          : '<p>No students enrolled in this course yet.</p>'
      }
    `);
  }

  async showEditEnrollmentForm(req, res) {
    const result = await this.teacherService.getEnrollmentForEdit(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Error</h1>
        <p>${result.message}</p>
        <p><a href="/teacher/courses">Back to my courses</a></p>
      `);
      return;
    }

    const { enrollment } = result;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Edit Result</h1>
      <p><strong>Course:</strong> ${enrollment.course_title}</p>
      <p><strong>Student:</strong> ${enrollment.student_name}</p>
      <p><strong>Login:</strong> ${enrollment.student_login}</p>

      <form method="POST" action="/teacher/enrollments/${enrollment.id}/update">
        <div style="margin-bottom: 12px;">
          <label for="status">Status:</label><br />
          <select id="status" name="status">
            <option value="enrolled" ${
              enrollment.status === 'enrolled' ? 'selected' : ''
            }>enrolled</option>
            <option value="in_progress" ${
              enrollment.status === 'in_progress' ? 'selected' : ''
            }>in_progress</option>
            <option value="completed" ${
              enrollment.status === 'completed' ? 'selected' : ''
            }>completed</option>
          </select>
        </div>

        <div style="margin-bottom: 12px;">
          <label for="grade">Grade (0-100):</label><br />
          <input
            id="grade"
            type="number"
            name="grade"
            min="0"
            max="100"
            value="${enrollment.grade ?? ''}"
          />
        </div>

        <div style="margin-bottom: 12px;">
          <label for="review">Review:</label><br />
          <textarea id="review" name="review" rows="5" cols="50">${
            enrollment.review ?? ''
          }</textarea>
        </div>

        <button type="submit">Save</button>
      </form>

      <p style="margin-top: 16px;">
        <a href="/teacher/courses/${enrollment.course_id}/students">Back to students</a>
      </p>
    `);
  }

  async updateEnrollment(req, res) {
    const result = await this.teacherService.updateEnrollmentResult(
      req.user.id,
      req.params.id,
      req.body
    );

    if (!result.ok) {
      res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Update Error</h1>
        <p>${result.message}</p>
        <p><a href="/teacher/courses">Back to my courses</a></p>
      `);
      return;
    }

    res.writeHead(302, {
      Location: `/teacher/courses/${result.enrollment.course_id}/students`
    });
    res.end();
  }
}

module.exports = TeacherController;
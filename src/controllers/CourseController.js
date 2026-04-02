class CourseController {
  constructor(courseService) {
    this.courseService = courseService;
  }

  async showAllCourses(req, res) {
    const courses = await this.courseService.getStudentCourseCatalog(req.user.id);

    const courseCards = courses
      .map((course) => {
        const actionHtml = course.enrollment_id
          ? `<p><strong>Status:</strong> ${course.enrollment_status}</p>
             <p style="color: green;">You are already enrolled.</p>`
          : `
            <form method="POST" action="/courses/${course.id}/enroll" style="margin-top: 10px;">
              <button type="submit">Enroll</button>
            </form>
          `;

        return `
          <div style="border: 1px solid #ccc; padding: 16px; margin-bottom: 16px; border-radius: 8px;">
            <h3>${course.title}</h3>
            <p>${course.description || 'No description'}</p>
            <p><strong>Teacher:</strong> ${course.teacher_name}</p>
            ${actionHtml}
          </div>
        `;
      })
      .join('');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>All Courses</h1>
      <p><a href="/dashboard">Back to dashboard</a></p>
      ${courseCards || '<p>No courses found.</p>'}
    `);
  }

  async enroll(req, res) {
    const result = await this.courseService.enrollStudent(
      req.user.id,
      req.params.id
    );

    if (!result.ok) {
      res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Enrollment error</h1>
        <p>${result.message}</p>
        <p><a href="/courses">Back to courses</a></p>
      `);
      return;
    }

    res.writeHead(302, { Location: '/my-courses' });
    res.end();
  }

  async showMyCourses(req, res) {
    const enrollments = await this.courseService.getMyCourses(req.user.id);

    const items = enrollments
      .map((item) => {
        return `
          <div style="border: 1px solid #ccc; padding: 16px; margin-bottom: 16px; border-radius: 8px;">
            <h3>${item.title}</h3>
            <p>${item.description || 'No description'}</p>
            <p><strong>Teacher:</strong> ${item.teacher_name}</p>
            <p><strong>Status:</strong> ${item.status}</p>
            <p><strong>Grade:</strong> ${item.grade ?? 'Not assigned yet'}</p>
            <p><strong>Review:</strong> ${item.review ?? 'No review yet'}</p>
          </div>
        `;
      })
      .join('');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>My Courses</h1>
      <p><a href="/dashboard">Back to dashboard</a></p>
      ${items || '<p>You are not enrolled in any courses yet.</p>'}
    `);
  }

  async showTeacherCourses(req, res) {
    const courses = await this.courseService.getTeacherCourses(req.user.id);

    const items = courses
      .map((course) => {
        return `
          <div style="border: 1px solid #ccc; padding: 16px; margin-bottom: 16px; border-radius: 8px;">
            <h3>${course.title}</h3>
            <p>${course.description || 'No description'}</p>
          </div>
        `;
      })
      .join('');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Teacher Courses</h1>
      <p><a href="/dashboard">Back to dashboard</a></p>
      ${items || '<p>No courses assigned to you yet.</p>'}
    `);
  }
}

module.exports = CourseController;
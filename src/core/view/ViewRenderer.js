const path = require('path');
const ejs = require('ejs');

class ViewRenderer {
  constructor(viewsPath = path.join(process.cwd(), 'src', 'views')) {
    this.viewsPath = viewsPath;
  }

  async render(res, template, data = {}, statusCode = 200) {
    const templatePath = path.join(this.viewsPath, `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, data);

    res.writeHead(statusCode, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    res.end(html);
  }
}

module.exports = ViewRenderer;
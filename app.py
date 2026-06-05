import os
import re
from flask import Flask, render_template, Response

app = Flask(__name__)


@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    return response

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/download")
def download():
    base = app.root_path
    with open(os.path.join(base, 'templates', 'index.html'), 'r', encoding='utf-8') as f:
        html = f.read()

    js_files = ['utils.js', 'menu-deco.js', 'ttt.js', 'othello.js', 'dandelions.js', 'dotsandboxes.js', 'taxcollector.js', 'statecapitals.js']
    scripts = []
    for js_file in js_files:
        with open(os.path.join(base, 'static', 'js', js_file), 'r', encoding='utf-8') as f:
            scripts.append(f.read())

    inline = '<script>\n' + '\n\n'.join(scripts) + '\n</script>'

    html = re.sub(
        r'\s*<script src="\{\{ url_for\(\'static\', filename=\'js/utils\.js\'\) \}\}"></script>'
        r'.*?'
        r'<script src="\{\{ url_for\(\'static\', filename=\'js/statecapitals\.js\'\) \}\}"></script>',
        '\n  ' + inline,
        html,
        flags=re.DOTALL,
    )

    return Response(
        html,
        mimetype='text/html',
        headers={'Content-Disposition': 'attachment; filename="simple-games.html"'},
    )

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "0") == "1")

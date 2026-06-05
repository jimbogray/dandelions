import logging
import os
import re
from flask import Flask, render_template, Response

app = Flask(__name__)
logger = logging.getLogger(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/download")
def download():
    base = app.root_path

    template_path = os.path.join(base, 'templates', 'index.html')
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        logger.error("Template not found: %s", template_path)
        return "Download unavailable: template file is missing.", 500
    except OSError as exc:
        logger.error("Failed to read template %s: %s", template_path, exc)
        return "Download unavailable: could not read template file.", 500

    js_files = ['utils.js', 'menu-deco.js', 'ttt.js', 'othello.js', 'dandelions.js', 'dotsandboxes.js', 'taxcollector.js', 'statecapitals.js']
    scripts = []
    for js_file in js_files:
        js_path = os.path.join(base, 'static', 'js', js_file)
        try:
            with open(js_path, 'r', encoding='utf-8') as f:
                scripts.append(f.read())
        except FileNotFoundError:
            logger.error("JS file not found: %s", js_path)
            return f"Download unavailable: missing script {js_file}.", 500
        except OSError as exc:
            logger.error("Failed to read JS file %s: %s", js_path, exc)
            return f"Download unavailable: could not read script {js_file}.", 500

    inline = '<script>\n' + '\n\n'.join(scripts) + '\n</script>'

    pattern = (
        r'\s*<script src="\{\{ url_for\(\'static\', filename=\'js/utils\.js\'\) \}\}"></script>'
        r'.*?'
        r'<script src="\{\{ url_for\(\'static\', filename=\'js/statecapitals\.js\'\) \}\}"></script>'
    )
    replacement = '\n  ' + inline
    new_html = re.sub(pattern, lambda _: replacement, html, flags=re.DOTALL)

    if new_html == html:
        logger.warning(
            "Script-tag pattern did not match in index.html; "
            "the downloaded file may contain unresolved template tags"
        )

    return Response(
        new_html,
        mimetype='text/html',
        headers={'Content-Disposition': 'attachment; filename="simple-games.html"'},
    )

@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_error(e):
    logger.error("Internal server error: %s", e)
    return render_template("500.html"), 500

if __name__ == "__main__":
    app.run(debug=True)

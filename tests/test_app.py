"""Unit tests for the Flask application (app.py)."""


# ── Index route ────────────────────────────────────────────────────

class TestIndexRoute:
    def test_returns_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200

    def test_content_type_html(self, client):
        resp = client.get("/")
        assert "text/html" in resp.content_type

    def test_contains_title(self, client):
        resp = client.get("/")
        assert b"Simple Games" in resp.data

    def test_contains_game_buttons(self, client):
        resp = client.get("/")
        html = resp.data.decode()
        assert "btn-ttt" in html
        assert "btn-othello" in html
        assert "btn-dandelions" in html
        assert "btn-dotsandboxes" in html
        assert "btn-taxcollector" in html
        assert "btn-statecapitals" in html

    def test_references_js_files(self, client):
        resp = client.get("/")
        html = resp.data.decode()
        for js in ["utils.js", "ttt.js", "othello.js", "dandelions.js",
                    "dotsandboxes.js", "taxcollector.js", "statecapitals.js",
                    "menu-deco.js"]:
            assert js in html, f"{js} not referenced in index.html"


# ── Security headers ──────────────────────────────────────────────

class TestSecurityHeaders:
    def test_x_content_type_options(self, client):
        resp = client.get("/")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"

    def test_x_frame_options(self, client):
        resp = client.get("/")
        assert resp.headers.get("X-Frame-Options") == "SAMEORIGIN"

    def test_security_headers_on_404(self, client):
        resp = client.get("/nonexistent")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "SAMEORIGIN"


# ── 404 handler ────────────────────────────────────────────────────

class TestNotFoundHandler:
    def test_returns_404(self, client):
        resp = client.get("/nonexistent-page")
        assert resp.status_code == 404

    def test_404_contains_message(self, client):
        resp = client.get("/this-does-not-exist")
        html = resp.data.decode()
        assert "404" in html
        assert "Page not found" in html

    def test_404_has_home_link(self, client):
        resp = client.get("/missing")
        html = resp.data.decode()
        assert 'href="/"' in html

    def test_404_content_type(self, client):
        resp = client.get("/nope")
        assert "text/html" in resp.content_type


# ── 500 handler ────────────────────────────────────────────────────

class TestInternalErrorHandler:
    def test_500_handler_renders_template(self, client):
        resp = client.get("/trigger-500")
        assert resp.status_code == 500
        html = resp.data.decode()
        assert "500" in html
        assert "Something went wrong" in html

    def test_500_has_home_link(self, client):
        resp = client.get("/trigger-500")
        html = resp.data.decode()
        assert 'href="/"' in html


# ── Static files ───────────────────────────────────────────────────

class TestStaticFiles:
    def test_js_files_served(self, client):
        js_files = [
            "utils.js", "menu-deco.js", "ttt.js", "othello.js",
            "dandelions.js", "dotsandboxes.js", "taxcollector.js",
            "statecapitals.js",
        ]
        for js in js_files:
            resp = client.get(f"/static/js/{js}")
            assert resp.status_code == 200, f"/static/js/{js} not found"
            assert "javascript" in resp.content_type or "text" in resp.content_type


# ── Edge cases ─────────────────────────────────────────────────────

class TestEdgeCases:
    def test_post_to_index_not_allowed(self, client):
        resp = client.post("/")
        assert resp.status_code == 405

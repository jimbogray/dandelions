import pytest
from app import app as flask_app


@pytest.fixture
def app():
    flask_app.config["TESTING"] = True
    flask_app.config["PROPAGATE_EXCEPTIONS"] = False

    # Register a route that triggers a 500 error for testing.
    if "trigger_500" not in {r.endpoint for r in flask_app.url_map.iter_rules()}:
        @flask_app.route("/trigger-500")
        def trigger_500():
            raise RuntimeError("test explosion")

    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()

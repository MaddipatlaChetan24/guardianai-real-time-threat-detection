# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")  
def client():
    """Create test API client"""
    return TestClient(app)

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_authentication_required(client):
    """Test that protected endpoints require auth"""
    # Try accessing a protected route without token  
    response = client.get("/api/v1/dashboard/live-stats") 
    assert response.status_code == 401

# Additional API tests would go here

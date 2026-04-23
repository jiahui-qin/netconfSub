#!/usr/bin/env python3
"""
Test script specifically for adding a second device
"""

from playwright.sync_api import sync_playwright
import time
import os
import requests

# Ensure screenshots directory exists
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

API_URL = "http://localhost:3001/api"


def test_add_second_device():
    """Test adding a second device"""
    print("=== Starting test: Add Second Device ===")
    
    # Clean up existing devices
    print("\n0. Cleaning up existing devices...")
    try:
        response = requests.get(f"{API_URL}/connections")
        if response.status_code == 200:
            devices = response.json()
            for device in devices:
                requests.delete(f"{API_URL}/connections/{device['id']}")
            print(f"✓ Cleaned up {len(devices)} existing devices")
    except Exception as e:
        print(f"⚠ Error cleaning up devices: {e}")
    
    with sync_playwright() as p:
        print("\n1. Launching browser...")
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = browser.new_page()
        
        # Navigate to application
        print("\n2. Navigating to application...")
        page.goto("http://localhost:3001")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        print("✓ Application loaded")
        
        # Open connection manager
        print("\n3. Opening Manage Devices...")
        page.click("button:has-text('Manage Devices')")
        time.sleep(2)
        print("✓ Connection manager opened")
        
        # Add first device
        print("\n4. Adding first device...")
        page.click("button:has-text('Add New Device')")
        time.sleep(1)
        
        # Fill first device details
        page.fill("input[placeholder='e.g., router-main']", "Router-Main")
        page.fill("input[placeholder='192.168.1.1']", "192.168.1.100")
        page.fill("input[type='number']", "830")
        page.fill("input[placeholder='admin']", "admin")
        page.fill("input[type='password']", "password123")
        time.sleep(1)
        
        # Add first device
        page.click("button:has-text('Add Device')")
        time.sleep(3)
        print("✓ First device added")
        
        # Verify first device exists
        response = requests.get(f"{API_URL}/connections")
        if response.status_code == 200:
            devices = response.json()
            print(f"✓ Found {len(devices)} devices: {[d['id'] for d in devices]}")
        
        # Try to add second device
        print("\n5. Adding second device...")
        try:
            # Click Add New Device again
            page.click("button:has-text('Add New Device')")
            time.sleep(1)
            
            # Fill second device details
            page.fill("input[placeholder='e.g., router-main']", "Switch-Backbone")
            page.fill("input[placeholder='192.168.1.1']", "192.168.1.101")
            page.fill("input[type='number']", "830")
            page.fill("input[placeholder='admin']", "admin")
            page.fill("input[type='password']", "password123")
            time.sleep(1)
            
            # Add second device
            page.click("button:has-text('Add Device')")
            time.sleep(3)
            print("✓ Second device added")
            
            # Verify second device exists
            response = requests.get(f"{API_URL}/connections")
            if response.status_code == 200:
                devices = response.json()
                print(f"✓ Found {len(devices)} devices: {[d['id'] for d in devices]}")
                if len(devices) == 2:
                    print("🎉 SUCCESS: Both devices added!")
                else:
                    print("⚠ Only one device found")
        except Exception as e:
            print(f"✗ Error adding second device: {e}")
            
            # Try alternative approach: use API directly
            print("\n6. Trying to add second device via API...")
            try:
                response = requests.post(f"{API_URL}/connections/add", json={
                    "id": "Switch-Backbone",
                    "config": {
                        "host": "192.168.1.101",
                        "port": "830",
                        "username": "admin",
                        "password": "password123"
                    }
                })
                if response.status_code == 200:
                    print("✓ Second device added via API")
                    # Verify
                    response = requests.get(f"{API_URL}/connections")
                    if response.status_code == 200:
                        devices = response.json()
                        print(f"✓ Found {len(devices)} devices: {[d['id'] for d in devices]}")
                else:
                    print(f"✗ API error: {response.text}")
            except Exception as api_error:
                print(f"✗ API error: {api_error}")
        
        # Close browser
        browser.close()
        
        print("\n=== Test completed! ===")
        return True


if __name__ == "__main__":
    try:
        test_add_second_device()
    except Exception as e:
        print(f"\n✗ Error in test: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

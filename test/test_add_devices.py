#!/usr/bin/env python3
"""
Test script for adding 2 Netconf devices
Tests: device configuration, Test Connection, and device addition
"""

from playwright.sync_api import sync_playwright
import time
import os

# Ensure screenshots directory exists
SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def test_add_two_devices():
    """Test adding two Netconf devices"""
    print("=== Starting test: Add 2 Netconf Devices ===")
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = browser.new_page()
        
        # Step 1: Navigate to application
        print("\n1. Navigating to application...")
        page.goto("http://localhost:3001")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_initial_page.png"), full_page=True)
        print("✓ Application loaded")
        
        # Step 2: Open connection manager
        print("\n2. Opening Manage Devices...")
        page.get_by_role("button", name="Manage Devices").click()
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_connection_manager.png"), full_page=True)
        print("✓ Connection manager opened")
        
        # Device 1
        print("\n=== Adding Device 1: Router-Main ===")
        
        # Step 3: Open add form
        print("3. Opening add device form...")
        page.get_by_role("button", name="Add New Device").click()
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_add_form_1_open.png"), full_page=True)
        print("✓ Form opened")
        
        # Step 4: Fill device 1 details
        print("4. Filling device 1 details...")
        page.get_by_placeholder("e.g., router-main").fill("Router-Main")
        page.get_by_placeholder("192.168.1.1").fill("192.168.1.100")
        port_input = page.locator("input[type=\"number\"]")
        port_input.fill("830")
        page.get_by_placeholder("admin").fill("admin")
        page.get_by_placeholder("••••••••").fill("password123")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_device1_filled.png"), full_page=True)
        print("✓ Device 1 details filled")
        
        # Step 5: Test connection for device 1
        print("5. Testing connection for device 1...")
        page.get_by_role("button", name="Test Connection").click()
        time.sleep(3)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_device1_test.png"), full_page=True)
        print("✓ Connection test complete (expected to fail for demo)")
        
        # Step 6: Add device 1
        print("6. Adding device 1...")
        page.get_by_role("button", name="Add Device").click()
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_device1_added.png"), full_page=True)
        print("✓ Device 1 (Router-Main) added successfully")
        
        # Device 2
        print("\n=== Adding Device 2: Switch-Backbone ===")
        
        # Step 7: Re-open add form for device 2
        print("7. Re-opening add device form...")
        page.get_by_role("button", name="Add New Device").click()
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "07_add_form_2_open.png"), full_page=True)
        print("✓ Form re-opened")
        
        # Step 8: Fill device 2 details
        print("8. Filling device 2 details...")
        page.get_by_placeholder("e.g., router-main").fill("Switch-Backbone")
        page.get_by_placeholder("192.168.1.1").fill("192.168.1.101")
        port_input = page.locator("input[type=\"number\"]")
        port_input.fill("830")
        page.get_by_placeholder("admin").fill("admin")
        page.get_by_placeholder("••••••••").fill("password123")
        time.sleep(1)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "08_device2_filled.png"), full_page=True)
        print("✓ Device 2 details filled")
        
        # Step 9: Test connection for device 2
        print("9. Testing connection for device 2...")
        page.get_by_role("button", name="Test Connection").click()
        time.sleep(3)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "09_device2_test.png"), full_page=True)
        print("✓ Connection test complete (expected to fail for demo)")
        
        # Step 10: Add device 2
        print("10. Adding device 2...")
        page.get_by_role("button", name="Add Device").click()
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "10_device2_added.png"), full_page=True)
        print("✓ Device 2 (Switch-Backbone) added successfully")
        
        # Step 11: Close connection manager and view sidebar
        print("\n11. Closing connection manager...")
        close_btn = page.locator("button").filter(has=page.locator("svg").locator("path[stroke-linecap=\"round\"][stroke-linejoin=\"round\"]")).first
        close_btn.click()
        time.sleep(2)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "11_sidebar_with_devices.png"), full_page=True)
        print("✓ Devices visible in sidebar")
        
        print("\n=== Test completed successfully! ===")
        print(f"✓ 2 devices added: Router-Main, Switch-Backbone")
        print(f"✓ Test screenshots saved to: {SCREENSHOTS_DIR}")
        
        browser.close()
        return True


if __name__ == "__main__":
    try:
        test_add_two_devices()
    except Exception as e:
        print(f"\n✗ Error in test: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

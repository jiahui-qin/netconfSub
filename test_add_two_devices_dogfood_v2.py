#!/usr/bin/env python3
"""
Dogfood Testing Script - Test adding two devices in the frontend
"""
from playwright.sync_api import sync_playwright
import os
import time

OUTPUT_DIR = "/workspace/dogfood-output"
SCREENSHOTS_DIR = f"{OUTPUT_DIR}/screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def take_screenshot(page, name):
    """Take a screenshot and save it"""
    filepath = f"{SCREENSHOTS_DIR}/{name}.png"
    page.screenshot(path=filepath, full_page=True)
    print(f"📸 Screenshot saved: {filepath}")
    return filepath

def main():
    results = {
        "success": False,
        "device1_added": False,
        "device2_added": False,
        "errors": [],
        "screenshots": []
    }

    print("🚀 Starting Dogfood Testing: Add Two Devices")
    print("=" * 60)

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the application
            print("\n📍 Step 1: Navigating to http://localhost:5173/")
            page.goto('http://localhost:5173/', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=10000)

            # Take initial screenshot
            take_screenshot(page, "01_initial_page")
            results["screenshots"].append("01_initial_page.png")

            # Wait for page to fully load
            page.wait_for_timeout(2000)

            # Try to find and close any modal overlay first
            print("\n📍 Step 2: Looking for modal overlay to close")
            close_buttons = page.locator('button:has-text("X"), button:has-text("Close"), button:has-text("Cancel")')
            for i in range(close_buttons.count()):
                try:
                    close_buttons.nth(i).click(timeout=1000)
                    print("✅ Closed a modal/overlay")
                    page.wait_for_timeout(500)
                except:
                    pass

            # Look for the "Add Device" button directly
            print("\n📍 Step 3: Looking for 'Add Device' button")
            add_device_button = page.locator('button:has-text("Add")').filter(has_text="Device").first

            if add_device_button.count() > 0:
                try:
                    add_device_button.click(timeout=5000)
                    print("✅ Clicked 'Add Device' button")
                    page.wait_for_timeout(1000)
                    take_screenshot(page, "02_add_device_form_opened")
                    results["screenshots"].append("02_add_device_form_opened.png")
                except Exception as e:
                    print(f"⚠️ Could not click first Add button: {e}")
                    # Try finding any Add button
                    any_add_btn = page.locator('button:has-text("Add")').first
                    try:
                        any_add_btn.click(timeout=5000)
                        print("✅ Clicked 'Add' button (any)")
                        page.wait_for_timeout(1000)
                        take_screenshot(page, "02_add_device_form_opened")
                        results["screenshots"].append("02_add_device_form_opened.png")
                    except Exception as e2:
                        print(f"❌ Could not click any Add button: {e2}")
                        take_screenshot(page, "02_add_device_failed")
                        results["screenshots"].append("02_add_device_failed.png")
                        raise Exception(f"Failed to find Add Device button: {e2}")

            page.wait_for_timeout(2000)

            # Fill in first device information
            print("\n📍 Step 4: Filling in first device information")
            inputs = page.locator('input')

            # Common field names for device connection
            field_values = [
                ('Device-1', 'name'),
                ('localhost', 'host'),
                ('127.0.0.1', 'ip'),
                ('830', 'port'),
                ('admin', 'username'),
            ]

            device1_data = {}
            input_count = inputs.count()
            print(f"  Found {input_count} input fields")

            # Fill inputs by index (more reliable than placeholder matching)
            for i, (value, field_name) in enumerate(field_values):
                if i < input_count:
                    try:
                        inputs.nth(i).fill(value)
                        device1_data[field_name] = value
                        print(f"  ✅ Filled field {i+1} ({field_name}): {value}")
                    except Exception as e:
                        print(f"  ⚠️ Could not fill field {i+1}: {e}")

            take_screenshot(page, "03_device1_filled")
            results["screenshots"].append("03_device1_filled.png")

            # Look for Test Connection button
            print("\n📍 Step 5: Testing first device connection")
            test_buttons = page.locator('button:has-text("Test")')

            if test_buttons.count() > 0:
                try:
                    test_buttons.first.click(timeout=5000)
                    print("✅ Clicked 'Test Connection' button")
                    page.wait_for_timeout(3000)  # Wait for connection test
                    take_screenshot(page, "04_device1_test_result")
                    results["screenshots"].append("04_device1_test_result.png")
                except Exception as e:
                    print(f"⚠️ Could not click Test button: {e}")

            # Look for Save/Add button
            print("\n📍 Step 6: Adding first device")
            save_buttons = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")')

            if save_buttons.count() > 0:
                try:
                    save_buttons.first.click(timeout=5000)
                    print("✅ Clicked to save/add device")
                    page.wait_for_timeout(2000)
                    take_screenshot(page, "05_device1_added")
                    results["screenshots"].append("05_device1_added.png")
                    results["device1_added"] = True
                except Exception as e:
                    print(f"⚠️ Could not click Save button: {e}")

            page.wait_for_timeout(2000)

            # Now add second device
            print("\n📍 Step 7: Adding second device")
            add_device_button2 = page.locator('button:has-text("Add")').filter(has_text="Device").first

            if add_device_button2.count() > 0:
                try:
                    add_device_button2.click(timeout=5000)
                    print("✅ Clicked 'Add Device' button for second device")
                    page.wait_for_timeout(1000)
                    take_screenshot(page, "06_add_device2_form_opened")
                    results["screenshots"].append("06_add_device2_form_opened.png")
                except:
                    # Try any Add button
                    try:
                        any_add = page.locator('button:has-text("Add")').first
                        any_add.click(timeout=5000)
                        print("✅ Clicked 'Add' button for second device")
                        page.wait_for_timeout(1000)
                        take_screenshot(page, "06_add_device2_form_opened")
                        results["screenshots"].append("06_add_device2_form_opened.png")
                    except Exception as e:
                        print(f"⚠️ Could not find Add button for second device: {e}")

            page.wait_for_timeout(2000)

            # Fill in second device information
            print("\n📍 Step 8: Filling in second device information")
            inputs2 = page.locator('input')

            device2_data = {}
            input_count2 = inputs2.count()
            print(f"  Found {input_count2} input fields")

            # Fill with different values for device 2
            field_values2 = [
                ('Device-2', 'name'),
                ('127.0.0.1', 'host'),
                ('127.0.0.2', 'ip'),
                ('831', 'port'),
                ('admin2', 'username'),
            ]

            for i, (value, field_name) in enumerate(field_values2):
                if i < input_count2:
                    try:
                        inputs2.nth(i).fill(value)
                        device2_data[field_name] = value
                        print(f"  ✅ Filled field {i+1} ({field_name}): {value}")
                    except Exception as e:
                        print(f"  ⚠️ Could not fill field {i+1}: {e}")

            take_screenshot(page, "07_device2_filled")
            results["screenshots"].append("07_device2_filled.png")

            # Test second device
            print("\n📍 Step 9: Testing second device connection")
            test_buttons2 = page.locator('button:has-text("Test")')

            if test_buttons2.count() > 0:
                try:
                    test_buttons2.first.click(timeout=5000)
                    print("✅ Clicked 'Test Connection' button for device 2")
                    page.wait_for_timeout(3000)
                    take_screenshot(page, "08_device2_test_result")
                    results["screenshots"].append("08_device2_test_result.png")
                except Exception as e:
                    print(f"⚠️ Could not click Test button for device 2: {e}")

            # Save second device
            print("\n📍 Step 10: Adding second device")
            save_buttons2 = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")')

            if save_buttons2.count() > 0:
                try:
                    save_buttons2.first.click(timeout=5000)
                    print("✅ Clicked to save second device")
                    page.wait_for_timeout(2000)
                    take_screenshot(page, "09_device2_added")
                    results["screenshots"].append("09_device2_added.png")
                    results["device2_added"] = True
                except Exception as e:
                    print(f"⚠️ Could not click Save button for device 2: {e}")

            page.wait_for_timeout(2000)

            # Take final screenshot showing both devices
            print("\n📍 Step 11: Taking final screenshot")
            take_screenshot(page, "10_final_state_both_devices")
            results["screenshots"].append("10_final_state_both_devices.png")

            # Check sidebar for devices
            sidebar = page.locator('aside, sidebar, [class*="sidebar"]')
            if sidebar.count() > 0:
                take_screenshot(page, "11_sidebar_with_devices")
                results["screenshots"].append("11_sidebar_with_devices.png")

            results["success"] = results["device1_added"] and results["device2_added"]

        except Exception as e:
            print(f"\n❌ Error during testing: {e}")
            results["errors"].append(str(e))
            take_screenshot(page, "99_error_state")

        finally:
            browser.close()

    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"✅ Success: {results['success']}")
    print(f"  - Device 1 added: {results['device1_added']}")
    print(f"  - Device 2 added: {results['device2_added']}")
    print(f"\n📸 Screenshots saved: {len(results['screenshots'])}")
    for screenshot in results['screenshots']:
        print(f"  - {screenshot}")

    if results['errors']:
        print(f"\n❌ Errors encountered: {len(results['errors'])}")
        for error in results['errors']:
            print(f"  - {error[:200]}...")  # Print first 200 chars

    print("=" * 60)

    # Save results to file
    import json
    results_file = f"{OUTPUT_DIR}/test_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Results saved to: {results_file}")

    return results

if __name__ == "__main__":
    results = main()
    exit(0 if results['success'] else 1)

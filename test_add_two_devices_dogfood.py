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

            # Check for console errors
            page.wait_for_timeout(2000)  # Wait for any async errors

            # Look for the "Manage Devices" button
            print("\n📍 Step 2: Looking for 'Manage Devices' button")
            manage_button = page.locator('button:has-text("Manage"), button:has-text("Devices")')

            if manage_button.count() > 0:
                manage_button.first.click()
                print("✅ Clicked 'Manage Devices' button")
                page.wait_for_timeout(1000)
                take_screenshot(page, "02_connection_manager_opened")
                results["screenshots"].append("02_connection_manager_opened.png")
            else:
                # Try to find it in navbar
                navbar_buttons = page.locator('nav button, header button')
                for i in range(navbar_buttons.count()):
                    btn_text = navbar_buttons.nth(i).text_content()
                    if btn_text and ('Device' in btn_text or 'Manage' in btn_text):
                        navbar_buttons.nth(i).click()
                        print(f"✅ Clicked navbar button: {btn_text}")
                        page.wait_for_timeout(1000)
                        take_screenshot(page, "02_connection_manager_opened")
                        results["screenshots"].append("02_connection_manager_opened.png")
                        break

            page.wait_for_timeout(2000)

            # Look for "Add Device" button or form
            print("\n📍 Step 3: Looking for 'Add Device' form")
            add_device_button = page.locator('button:has-text("Add"), button:has-text("Device")')

            if add_device_button.count() > 0:
                add_device_button.first.click()
                print("✅ Clicked 'Add Device' button")
                page.wait_for_timeout(1000)
                take_screenshot(page, "03_add_device_form_opened")
                results["screenshots"].append("03_add_device_form_opened.png")
            else:
                # Check if form is already visible
                form_inputs = page.locator('input[name], input[type="text"], input[type="number"]')
                if form_inputs.count() > 0:
                    print("✅ Form appears to be visible")
                    take_screenshot(page, "03_form_visible")

            page.wait_for_timeout(2000)

            # Fill in first device information
            print("\n📍 Step 4: Filling in first device information")
            inputs = page.locator('input')

            # Common field names for device connection
            field_names = [
                ('name', 'Device-1'),
                ('host', 'localhost'),
                ('ip', '127.0.0.1'),
                ('port', '830'),
                ('username', 'admin'),
                ('user', 'admin')
            ]

            device1_data = {}
            for input_field in inputs.all():
                try:
                    placeholder = input_field.get_attribute('placeholder') or ''
                    name_attr = input_field.get_attribute('name') or ''

                    # Try to fill based on placeholder
                    for field_name, value in field_names:
                        if field_name.lower() in placeholder.lower() or field_name.lower() in name_attr.lower():
                            input_field.fill(value)
                            device1_data[field_name] = value
                            print(f"  ✅ Filled {field_name}: {value}")
                            break
                except Exception as e:
                    print(f"  ⚠️ Could not fill input: {e}")

            take_screenshot(page, "04_device1_filled")
            results["screenshots"].append("04_device1_filled.png")

            # Look for Test Connection button
            print("\n📍 Step 5: Testing first device connection")
            test_button = page.locator('button:has-text("Test")')

            if test_button.count() > 0:
                test_button.first.click()
                print("✅ Clicked 'Test Connection' button")
                page.wait_for_timeout(3000)  # Wait for connection test
                take_screenshot(page, "05_device1_test_result")
                results["screenshots"].append("05_device1_test_result.png")

            # Look for Save/Add button
            print("\n📍 Step 6: Adding first device")
            save_button = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")')

            if save_button.count() > 0:
                save_button.first.click()
                print("✅ Clicked to save/add device")
                page.wait_for_timeout(2000)
                take_screenshot(page, "06_device1_added")
                results["screenshots"].append("06_device1_added.png")
                results["device1_added"] = True

            page.wait_for_timeout(2000)

            # Now add second device
            print("\n📍 Step 7: Adding second device")
            add_device_button2 = page.locator('button:has-text("Add"), button:has-text("Device")')

            if add_device_button2.count() > 0:
                for i in range(add_device_button2.count()):
                    btn = add_device_button2.nth(i)
                    btn_text = btn.text_content()
                    if btn_text and 'Add' in btn_text:
                        btn.click()
                        print("✅ Clicked 'Add Device' button for second device")
                        break
            else:
                # Try to find any button that opens the form
                any_button = page.locator('button')
                for i in range(any_button.count()):
                    btn = any_button.nth(i)
                    btn_text = btn.text_content()
                    if btn_text and 'Add' in btn_text:
                        btn.click()
                        print(f"✅ Clicked button: {btn_text}")
                        break

            page.wait_for_timeout(1000)
            take_screenshot(page, "07_add_device2_form_opened")
            results["screenshots"].append("07_add_device2_form_opened.png")

            # Fill in second device information
            print("\n📍 Step 8: Filling in second device information")
            inputs2 = page.locator('input')

            device2_data = {}
            for input_field in inputs2.all():
                try:
                    placeholder = input_field.get_attribute('placeholder') or ''
                    name_attr = input_field.get_attribute('name') or ''

                    # Try to fill based on placeholder
                    for field_name, value in field_names:
                        if field_name.lower() in placeholder.lower() or field_name.lower() in name_attr.lower():
                            # Use different values for device 2
                            if field_name == 'name':
                                value = 'Device-2'
                            elif field_name == 'port':
                                value = '831'
                            elif field_name == 'host':
                                value = '127.0.0.1'

                            input_field.fill(value)
                            device2_data[field_name] = value
                            print(f"  ✅ Filled {field_name}: {value}")
                            break
                except Exception as e:
                    print(f"  ⚠️ Could not fill input: {e}")

            take_screenshot(page, "08_device2_filled")
            results["screenshots"].append("08_device2_filled.png")

            # Test second device
            print("\n📍 Step 9: Testing second device connection")
            test_button2 = page.locator('button:has-text("Test")')

            if test_button2.count() > 0:
                test_button2.first.click()
                print("✅ Clicked 'Test Connection' button for device 2")
                page.wait_for_timeout(3000)
                take_screenshot(page, "09_device2_test_result")
                results["screenshots"].append("09_device2_test_result.png")

            # Save second device
            print("\n📍 Step 10: Adding second device")
            save_button2 = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")')

            if save_button2.count() > 0:
                save_button2.first.click()
                print("✅ Clicked to save second device")
                page.wait_for_timeout(2000)
                take_screenshot(page, "10_device2_added")
                results["screenshots"].append("10_device2_added.png")
                results["device2_added"] = True

            page.wait_for_timeout(2000)

            # Take final screenshot showing both devices
            print("\n📍 Step 11: Taking final screenshot")
            take_screenshot(page, "11_final_state_both_devices")
            results["screenshots"].append("11_final_state_both_devices.png")

            # Check sidebar for devices
            sidebar = page.locator('aside, sidebar, [class*="sidebar"]')
            if sidebar.count() > 0:
                take_screenshot(page, "12_sidebar_with_devices")
                results["screenshots"].append("12_sidebar_with_devices.png")

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
            print(f"  - {error}")

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

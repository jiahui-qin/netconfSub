#!/usr/bin/env python3
"""
Dogfood Testing Script - Enhanced version with better element detection
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
        "screenshots": [],
        "page_snapshot": None
    }

    print("🚀 Starting Enhanced Dogfood Testing: Add Two Devices")
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

            # Wait for any dynamic content to load
            page.wait_for_timeout(3000)

            # Take initial screenshot
            take_screenshot(page, "01_initial_page")
            results["screenshots"].append("01_initial_page.png")

            # Get page content to understand structure
            print("\n📍 Step 2: Analyzing page structure")
            all_buttons = page.locator('button').all()
            print(f"  Found {len(all_buttons)} buttons on the page")

            for i, btn in enumerate(all_buttons):
                try:
                    text = btn.text_content()
                    if text:
                        print(f"    Button {i+1}: '{text.strip()[:50]}'")
                except:
                    pass

            all_inputs = page.locator('input').all()
            print(f"  Found {len(all_inputs)} input fields on the page")

            # Take a snapshot to understand layout
            print("\n📍 Step 3: Taking page snapshot")
            try:
                snapshot = page.locator('body').inner_html()
                results["page_snapshot"] = snapshot[:1000]  # First 1000 chars
                print(f"  Page snapshot length: {len(snapshot)} chars")
            except Exception as e:
                print(f"  ⚠️ Could not get page snapshot: {e}")

            # Look for "Manage Devices" or "Add Device" button
            print("\n📍 Step 4: Looking for device management buttons")

            # Try to find "Manage" or "Devices" button
            manage_buttons = page.locator('button')
            target_buttons = []

            for i in range(manage_buttons.count()):
                try:
                    btn = manage_buttons.nth(i)
                    text = btn.text_content()
                    if text and ('Manage' in text or 'Devices' in text or 'Device' in text or 'Add' in text):
                        target_buttons.append((i, text.strip()))
                        print(f"  Found button: '{text.strip()}'")
                except:
                    pass

            # Click the first relevant button
            if target_buttons:
                btn_index, btn_text = target_buttons[0]
                print(f"\n📍 Step 5: Clicking '{btn_text}' button")
                try:
                    manage_buttons.nth(btn_index).click(timeout=5000)
                    page.wait_for_timeout(2000)
                    take_screenshot(page, "02_after_first_click")
                    results["screenshots"].append("02_after_first_click.png")
                except Exception as e:
                    print(f"  ❌ Failed to click button: {e}")
                    raise

            # Now look for Add Device form
            print("\n📍 Step 6: Looking for 'Add Device' form")
            page.wait_for_timeout(2000)

            # Try to find any "Add" button
            add_buttons = page.locator('button:has-text("Add")').all()
            print(f"  Found {len(add_buttons)} 'Add' buttons")

            if len(add_buttons) > 0:
                for i, btn in enumerate(add_buttons):
                    try:
                        text = btn.text_content()
                        print(f"    Add button {i+1}: '{text.strip()}'")
                    except:
                        pass

                # Click the first Add button
                try:
                    print(f"\n📍 Step 7: Clicking 'Add' button")
                    add_buttons[0].click(timeout=5000)
                    page.wait_for_timeout(2000)
                    take_screenshot(page, "03_add_form_opened")
                    results["screenshots"].append("03_add_form_opened.png")
                except Exception as e:
                    print(f"  ❌ Failed to click Add button: {e}")
                    raise

            # Now fill in device information
            print("\n📍 Step 8: Looking for input fields")
            page.wait_for_timeout(1000)

            inputs = page.locator('input').all()
            print(f"  Found {len(inputs)} input fields")

            if len(inputs) == 0:
                # Try textarea
                textareas = page.locator('textarea').all()
                print(f"  Found {len(textareas)} textarea fields")

            # Fill in first device
            if len(inputs) >= 5:
                print("\n📍 Step 9: Filling first device information")

                # Try to fill by placeholder or name
                device1_values = ['Device-1', 'localhost', '830', 'admin', 'admin123']
                for i, value in enumerate(device1_values):
                    try:
                        if i < len(inputs):
                            # Check for different input types
                            input_el = inputs[i]
                            placeholder = input_el.get_attribute('placeholder') or ''
                            input_type = input_el.get_attribute('type') or 'text'

                            # Clear and fill
                            input_el.clear()
                            input_el.fill(value)
                            print(f"  ✅ Filled input {i+1} with '{value}' (placeholder: '{placeholder}', type: {input_type})")
                    except Exception as e:
                        print(f"  ⚠️ Could not fill input {i+1}: {e}")

                take_screenshot(page, "04_device1_filled")
                results["screenshots"].append("04_device1_filled.png")

                # Try to find and click Test button
                print("\n📍 Step 10: Looking for Test button")
                test_buttons = page.locator('button:has-text("Test")').all()
                if test_buttons:
                    try:
                        test_buttons[0].click(timeout=3000)
                        print("  ✅ Clicked Test button")
                        page.wait_for_timeout(3000)
                        take_screenshot(page, "05_test_result")
                        results["screenshots"].append("05_test_result.png")
                    except Exception as e:
                        print(f"  ⚠️ Could not click Test: {e}")

                # Try to find and click Save/Add button
                print("\n📍 Step 11: Looking for Save button")
                save_buttons = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")').all()
                if save_buttons:
                    try:
                        save_buttons[0].click(timeout=3000)
                        print("  ✅ Clicked Save button")
                        page.wait_for_timeout(2000)
                        take_screenshot(page, "06_device1_saved")
                        results["screenshots"].append("06_device1_saved.png")
                        results["device1_added"] = True
                    except Exception as e:
                        print(f"  ⚠️ Could not click Save: {e}")

                page.wait_for_timeout(2000)

                # Now add second device
                print("\n📍 Step 12: Adding second device")

                # Look for Add button again (form should be reset)
                add_buttons2 = page.locator('button:has-text("Add")').all()
                if add_buttons2:
                    try:
                        add_buttons2[0].click(timeout=3000)
                        print("  ✅ Clicked Add button for second device")
                        page.wait_for_timeout(2000)
                        take_screenshot(page, "07_device2_form")
                        results["screenshots"].append("07_device2_form.png")
                    except Exception as e:
                        print(f"  ⚠️ Could not click Add for device 2: {e}")

                # Fill second device
                inputs2 = page.locator('input').all()
                if len(inputs2) >= 5:
                    print("\n📍 Step 13: Filling second device information")
                    device2_values = ['Device-2', '127.0.0.1', '831', 'admin', 'admin123']

                    for i, value in enumerate(device2_values):
                        try:
                            if i < len(inputs2):
                                input_el = inputs2[i]
                                input_el.clear()
                                input_el.fill(value)
                                print(f"  ✅ Filled input {i+1} with '{value}'")
                        except Exception as e:
                            print(f"  ⚠️ Could not fill input {i+1}: {e}")

                    take_screenshot(page, "08_device2_filled")
                    results["screenshots"].append("08_device2_filled.png")

                    # Save second device
                    print("\n📍 Step 14: Saving second device")
                    save_buttons2 = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Connect")').all()
                    if save_buttons2:
                        try:
                            save_buttons2[0].click(timeout=3000)
                            print("  ✅ Clicked Save button for device 2")
                            page.wait_for_timeout(2000)
                            take_screenshot(page, "09_device2_saved")
                            results["screenshots"].append("09_device2_saved.png")
                            results["device2_added"] = True
                        except Exception as e:
                            print(f"  ⚠️ Could not click Save for device 2: {e}")

                page.wait_for_timeout(2000)

            # Final screenshot
            print("\n📍 Step 15: Taking final screenshot")
            take_screenshot(page, "10_final_state")
            results["screenshots"].append("10_final_state.png")

            results["success"] = results["device1_added"] and results["device2_added"]

        except Exception as e:
            print(f"\n❌ Error during testing: {e}")
            import traceback
            traceback.print_exc()
            results["errors"].append(str(e))
            take_screenshot(page, "99_error_state")
            results["screenshots"].append("99_error_state.png")

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
            print(f"  - {error[:200]}...")

    print("=" * 60)

    # Save results to file
    import json
    results_file = f"{OUTPUT_DIR}/test_results_enhanced.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n💾 Results saved to: {results_file}")

    return results

if __name__ == "__main__":
    results = main()
    exit(0 if results['success'] else 1)

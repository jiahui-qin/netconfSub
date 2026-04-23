#!/usr/bin/env python3
"""
Reconnaissance script to inspect the current page state
"""

from playwright.sync_api import sync_playwright
import os
import time

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def inspect_page():
    """Inspect the page to find the correct selectors
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = browser.new_page()
        
        print("Navigating...")
        page.goto("http://localhost:3001")
        
        # Longer wait
        print("Waiting for application to initialize...")
        page.wait_for_timeout(10000)
        print("Done waiting")
        
        screenshot_path = os.path.join(SCREENSHOTS_DIR, "recon_page.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")
        
        # Save HTML
        html_path = os.path.join(SCREENSHOTS_DIR, "recon_page.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(page.content())
        print(f"HTML saved to {html_path}")
        
        # Find all elements with text
        print("\n=== All Elements with Text ===")
        elements = page.locator("*").all()
        count = 0
        for elem in elements:
            try:
                text = elem.text_content().strip() if elem.text_content() else ""
                if text and len(text) > 0:
                    print(f"  {count}: '{text}' (tag: {elem.evaluate('el => el.tagName')})")
                    count += 1
            except:
                pass
            if count > 50:
                break
        
        # Find all buttons
        print("\n=== All Buttons ===")
        buttons = page.locator("button").all()
        for i, btn in enumerate(buttons):
            try:
                txt = btn.inner_text()
                print(f"  Button {i}: '{txt.strip()}'")
            except:
                print(f"  Button {i}: (error reading)")
        
        browser.close()


if __name__ == "__main__":
    inspect_page()

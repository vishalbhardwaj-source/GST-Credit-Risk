import time
from playwright.sync_api import sync_playwright

def test_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto("http://127.0.0.1:4173")
        page.wait_for_timeout(2000)
        
        print("1. Switching to Executive Pitch & Overview...")
        page.locator("button:has-text('Executive Pitch & Overview')").click()
        page.wait_for_timeout(1000)
        
        # Scroll down through overview
        page.evaluate("window.scrollTo({ top: 600, behavior: 'smooth' })")
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo({ top: 1200, behavior: 'smooth' })")
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo({ top: 1800, behavior: 'smooth' })")
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
        page.wait_for_timeout(1000)
        
        print("2. Switching to Live Triage Console...")
        page.locator("button:has-text('Live Triage Console')").click()
        page.wait_for_timeout(1500)
        
        print("3. Running Pipeline Routing...")
        page.locator("button:has-text('Run Pipeline Routing')").first.click()
        page.wait_for_timeout(2500)
        
        print("4. Filtering by SAFE TO HOLD...")
        page.locator("button:has-text('SAFE TO HOLD')").click()
        page.wait_for_timeout(1500)
        
        print("5. Filtering by CHASE NOW...")
        page.locator("button:has-text('CHASE NOW')").click()
        page.wait_for_timeout(1500)
        
        print("6. Opening Invoice Detail Panel for first row...")
        rows = page.locator("tbody tr")
        print(f"Total rows in CHASE NOW: {rows.count()}")
        if rows.count() > 0:
            rows.first.click()
            page.wait_for_timeout(2000)
            
            # Check close button on detail panel
            close_btn = page.locator("button[aria-label='Close panel'], button:has-text('✕'), button:has-text('Close')")
            if close_btn.count() > 0:
                print("Closing detail panel...")
                close_btn.first.click()
                page.wait_for_timeout(1000)
            else:
                page.keyboard.press("Escape")
                page.wait_for_timeout(1000)
                
        print("7. Opening AI Tax Copilot drawer...")
        copilot_fab = page.locator("button:has-text('Ask AI Copilot')")
        if copilot_fab.count() > 0:
            copilot_fab.click()
            page.wait_for_timeout(2000)
            
            # Check if prompt chip exists
            chip = page.locator("button:has-text('Rule 37A'), button:has-text('Explain Score')")
            if chip.count() > 0:
                print(f"Clicking prompt chip: {chip.first.inner_text()}")
                chip.first.click()
                page.wait_for_timeout(3000)
                
            # Close copilot
            page.keyboard.press("Escape")
            page.wait_for_timeout(1000)
            
        print("8. Opening ML Diagnostics & Audit...")
        page.locator("button:has-text('ML Diagnostics & Audit')").click()
        page.wait_for_timeout(2000)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)
        
        print("9. Opening Test Any GSTIN...")
        page.locator("button:has-text('Test Any GSTIN')").click()
        page.wait_for_timeout(2000)
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)
        
        browser.close()
        print("Full test flow completed successfully!")

if __name__ == "__main__":
    test_flow()

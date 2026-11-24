from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
OUT_PDF = HERE.parent / "SirenOpt_Presentation_Vlad_Powerman.pdf"
PREVIEW = HERE / "preview"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 675}, device_scale_factor=1.5)
    page.goto((HERE / "deck.html").as_uri())
    page.wait_for_function("window.__ready === true", timeout=15000)

    PREVIEW.mkdir(exist_ok=True)
    for i, slide in enumerate(page.query_selector_all(".slide"), start=1):
        slide.screenshot(path=str(PREVIEW / f"slide{i}.png"))

    page.pdf(path=str(OUT_PDF), width="1200px", height="675px", print_background=True,
             margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
    browser.close()

print(OUT_PDF)

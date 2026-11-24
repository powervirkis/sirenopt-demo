from pathlib import Path

import fitz
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

# SumatraPDF shows Chrome's raw PDF output as a blank page; a MuPDF rewrite fixes it.
doc = fitz.open(OUT_PDF)
tmp = OUT_PDF.with_suffix(".tmp.pdf")
doc.save(tmp, garbage=4, deflate=True, clean=True)
doc.close()
tmp.replace(OUT_PDF)

print(OUT_PDF)

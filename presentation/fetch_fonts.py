import re
import urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
URL = "https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Patrick+Hand&display=swap"
OUT = Path(__file__).parent / "assets"

css = urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": UA})).read().decode()
pattern = r"/\* ([\w-]+) \*/\s*@font-face \{[^}]*font-family: '([^']+)';[^}]*font-weight: (\d+);[^}]*url\(([^)]+)\)"
for subset, family, weight, url in re.findall(pattern, css):
    if subset == "latin":
        name = f"{family.replace(' ', '')}-{weight}.woff2"
        (OUT / name).write_bytes(urllib.request.urlopen(url).read())
        print(name)

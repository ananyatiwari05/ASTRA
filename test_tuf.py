import requests
import json
import re

headers = {'User-Agent': 'Mozilla/5.0'}
r = requests.get("https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", headers=headers)
match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', r.text)
if match:
    data = json.loads(match.group(1))
    print(list(data.keys()))
else:
    print("No __NEXT_DATA__ found")

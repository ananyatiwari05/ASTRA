import requests

try:
    headers = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get("https://www.tle-eliminators.com/api/cp-sheet", headers=headers, timeout=5)
    print("TLE API:", r.status_code, r.text[:200])
except Exception as e:
    print(e)

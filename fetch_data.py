#!/usr/bin/env python3
"""
fetch_data.py — Comprehensive Wikidata fetcher for the histography clone.
Fetches wars, disasters, science, politics, film, music, art, sports + images.

Usage:
    python3 fetch_data.py [--resume]

Requirements:
    pip install requests
"""

import json
import os
import sys
import time
import argparse
import requests

SPARQL_URL  = "https://query.wikidata.org/sparql"
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "events.json")
CHECKPOINT  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", ".fetch_checkpoint.json")

HEADERS = {
    "Accept": "application/sparql-results+json",
    "User-Agent": "HistographyClone/1.0 (local educational project)",
}

# ── Query catalogue ────────────────────────────────────────────────────────────
# (category, type_id, date_property, require_wiki_article, total_limit, label)
QUERIES = [
    # Wars & conflicts  — P585 = point in time
    ("war",         "Q198",      "P585", False, 1500, "Wars"),
    ("war",         "Q178561",   "P585", False, 1500, "Battles"),
    ("war",         "Q188055",   "P585", False,  600, "Military offensives"),
    ("war",         "Q134949",   "P585", False,  400, "Sieges"),
    ("war",         "Q831663",   "P585", False,  400, "Military campaigns"),
    # Disasters
    ("disaster",    "Q3839081",  "P585", False,  600, "Natural disasters"),
    ("disaster",    "Q7944",     "P585", False,  700, "Earthquakes"),
    ("disaster",    "Q8065",     "P585", False,  500, "Volcanic eruptions"),
    ("disaster",    "Q8072",     "P585", False,  400, "Floods"),
    ("disaster",    "Q8092",     "P585", False,  300, "Famines"),
    ("disaster",    "Q28604",    "P585", False,  400, "Epidemics"),
    ("disaster",    "Q18123741", "P585", False,  150, "Pandemics"),
    ("disaster",    "Q8076",     "P585", False,  300, "Tsunamis"),
    ("disaster",    "Q8090",     "P585", False,  200, "Wildfires"),
    # Science & technology
    ("science",     "Q7930614",  "P585", False, 1200, "Scientific discoveries"),
    ("science",     "Q386724",   "P585", False, 1200, "Inventions"),
    ("science",     "Q2007602",  "P585", False,  400, "Space missions"),
    ("science",     "Q4027765",  "P585", False,  300, "Scientific expeditions"),
    # Politics
    ("politics",    "Q131569",   "P585", False,  800, "Treaties"),
    ("politics",    "Q10931552", "P585", False,  500, "Revolutions"),
    ("politics",    "Q625994",   "P585", False,  500, "Coups d'état"),
    ("politics",    "Q3882219",  "P585", False,  500, "Assassinations"),
    ("politics",    "Q16917",    "P585", False,  400, "Elections (notable)"),
    # Exploration
    ("exploration", "Q2095549",  "P585", False,  400, "Expeditions"),
    ("exploration", "Q43229",    "P585", False,  300, "Exploration voyages"),
    # Religion
    ("religion",    "Q15290105", "P585", False,  300, "Religious events"),
    ("religion",    "Q1801516",  "P585", False,  200, "Religious conflicts"),
    # Film  — P577 = publication date, require Wikipedia article
    ("film",        "Q11424",    "P577", True,  3000, "Films"),
    # Music  — albums with Wikipedia articles
    ("music",       "Q482994",   "P577", True,  2000, "Music albums"),
    ("music",       "Q208569",   "P577", True,  1000, "Studio albums"),
    # Art  — P571 = inception date, require Wikipedia article
    ("art",         "Q3305213",  "P571", True,   800, "Paintings"),
    ("art",         "Q860861",   "P571", True,   400, "Sculptures"),
    ("art",         "Q838948",   "P571", True,   400, "Works of art"),
    # Sports  — P585 = point in time
    ("sports",      "Q16510064", "P585", False,  800, "Sports events"),
    ("sports",      "Q13406463", "P585", False,  600, "Sports competitions"),
    ("sports",      "Q27020041", "P585", False,  400, "Sports seasons"),
]


# ── SPARQL query builders ──────────────────────────────────────────────────────

EVENT_QUERY = """
SELECT ?item ?itemLabel ?date ?image ?desc ?article WHERE {{
  ?item wdt:P31 wd:{type_id} .
  ?item wdt:{date_prop} ?date .
  OPTIONAL {{ ?item wdt:P18 ?image . }}
  OPTIONAL {{
    ?item schema:description ?desc .
    FILTER(LANG(?desc) = "en")
  }}
  OPTIONAL {{
    ?article schema:about ?item .
    ?article schema:isPartOf <https://en.wikipedia.org/> .
  }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
}}
ORDER BY ?date
LIMIT {limit}
OFFSET {offset}
"""

WIKI_REQUIRED_QUERY = """
SELECT ?item ?itemLabel ?date ?image ?desc ?article WHERE {{
  ?item wdt:P31 wd:{type_id} .
  ?item wdt:{date_prop} ?date .
  ?article schema:about ?item .
  ?article schema:isPartOf <https://en.wikipedia.org/> .
  OPTIONAL {{ ?item wdt:P18 ?image . }}
  OPTIONAL {{
    ?item schema:description ?desc .
    FILTER(LANG(?desc) = "en")
  }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
}}
ORDER BY ?date
LIMIT {limit}
OFFSET {offset}
"""


def run_sparql(type_id, date_prop, require_wiki, limit, offset, retries=4):
    template = WIKI_REQUIRED_QUERY if require_wiki else EVENT_QUERY
    query = template.format(
        type_id=type_id, date_prop=date_prop,
        limit=limit, offset=offset
    )
    delay = 5
    for attempt in range(retries):
        try:
            resp = requests.get(
                SPARQL_URL,
                params={"query": query, "format": "json"},
                headers=HEADERS,
                timeout=90,
            )
            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", delay))
                print(f" [rate-limited, waiting {wait}s]", end="", flush=True)
                time.sleep(wait)
                delay = min(delay * 2, 120)
                continue
            resp.raise_for_status()
            return resp.json()["results"]["bindings"]
        except requests.Timeout:
            if attempt < retries - 1:
                print(f" [timeout, retry {attempt+1}]", end="", flush=True)
                time.sleep(delay)
                delay = min(delay * 2, 60)
            else:
                raise
        except requests.RequestException:
            raise
    return []


def fetch_all(type_id, date_prop, require_wiki, total_limit, label, batch=500):
    """Paginate through results, returning all rows up to total_limit."""
    rows = []
    offset = 0
    while offset < total_limit:
        size = min(batch, total_limit - offset)
        try:
            batch_rows = run_sparql(type_id, date_prop, require_wiki, size, offset)
        except requests.RequestException as e:
            print(f" [ERROR: {e}]", end="", flush=True)
            break
        if not batch_rows:
            break
        rows.extend(batch_rows)
        if len(batch_rows) < size:
            break  # no more results
        offset += size
        if offset < total_limit:
            time.sleep(1.2)  # polite delay between pages
    return rows


# ── Parsing helpers ────────────────────────────────────────────────────────────

def parse_year(date_str):
    if not date_str:
        return None
    s = date_str.strip()
    sign = -1 if s.startswith("-") else 1
    s = s.lstrip("+-")
    for sep in ("-", "T"):
        idx = s.find(sep)
        if idx > 0:
            s = s[:idx]
            break
    try:
        return int(s.lstrip("0") or "0") * sign
    except ValueError:
        return None


def format_image(raw_url):
    if not raw_url:
        return ""
    url = raw_url.replace("http://", "https://")
    if "?" not in url:
        url += "?width=400"
    return url


def wiki_slug(url):
    if url and "/wiki/" in url:
        return url.split("/wiki/")[-1]
    return ""


def process_rows(rows, cat, seen_ids):
    events = []
    for row in rows:
        item_url = row.get("item", {}).get("value", "")
        qid = item_url.rsplit("/", 1)[-1] if item_url else ""
        if not qid or qid in seen_ids:
            continue

        year = parse_year(row.get("date", {}).get("value", ""))
        if year is None:
            continue

        title = row.get("itemLabel", {}).get("value", "")
        if not title or title == qid:
            continue

        events.append({
            "id":   qid,
            "year": year,
            "title": title,
            "desc": row.get("desc",    {}).get("value", ""),
            "cat":  cat,
            "wiki": wiki_slug(row.get("article", {}).get("value", "")),
            "img":  format_image(row.get("image", {}).get("value", "")),
        })
        seen_ids.add(qid)
    return events


# ── Main ───────────────────────────────────────────────────────────────────────

def main(resume=False):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    all_events = []
    seen_ids   = set()
    start_idx  = 0

    # Load checkpoint for resume
    if resume and os.path.exists(CHECKPOINT):
        with open(CHECKPOINT) as f:
            ck = json.load(f)
        start_idx = ck.get("next_idx", 0)
        if os.path.exists(OUTPUT_FILE):
            with open(OUTPUT_FILE) as f:
                all_events = json.load(f)
            seen_ids = {e["id"] for e in all_events}
        print(f"Resuming from query {start_idx}/{len(QUERIES)}, {len(all_events)} events so far.\n")

    total = len(QUERIES)
    for i, (cat, type_id, date_prop, req_wiki, limit, label) in enumerate(QUERIES):
        if i < start_idx:
            continue

        pct = f"[{i+1}/{total}]"
        print(f"{pct} {label} ({type_id}, date={date_prop}) … ", end="", flush=True)

        rows = fetch_all(type_id, date_prop, req_wiki, limit, label)
        new_events = process_rows(rows, cat, seen_ids)
        all_events.extend(new_events)
        print(f"+{len(new_events)} events  (total: {len(all_events)})")

        # Save checkpoint and partial results
        all_events.sort(key=lambda e: e["year"])
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_events, f, ensure_ascii=False, separators=(",", ":"))
        with open(CHECKPOINT, "w") as f:
            json.dump({"next_idx": i + 1}, f)

        # Polite delay between queries (Wikidata asks for ~5s between requests)
        time.sleep(5.0)

    # Final sort & clean checkpoint
    all_events.sort(key=lambda e: e["year"])
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_events, f, ensure_ascii=False, separators=(",", ":"))
    if os.path.exists(CHECKPOINT):
        os.remove(CHECKPOINT)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\nDone. {len(all_events)} events saved to {OUTPUT_FILE} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--resume", action="store_true",
                        help="Resume from last checkpoint if interrupted")
    args = parser.parse_args()
    print("Fetching historical events from Wikidata…\n")
    main(resume=args.resume)

#!/usr/bin/env python3
"""Aggregates per-item JSON files under content/<name>/ into the single
content/<name>.json files the front-end fetches. Runs as the Netlify build
command so admins can manage each post as its own file (folder collection)
in the CMS, while the site keeps loading one JSON file per page."""

import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(ROOT, "content")


def build(folder_name, wrapper_key, sort_key=None, reverse=True):
    folder = os.path.join(CONTENT_DIR, folder_name)
    items = []
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("id", os.path.splitext(os.path.basename(path))[0])
        items.append(data)

    if sort_key:
        items.sort(key=lambda item: item.get(sort_key, ""), reverse=reverse)

    out_path = os.path.join(CONTENT_DIR, f"{folder_name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({wrapper_key: items}, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{folder_name}: {len(items)}개 항목 -> {out_path}")


if __name__ == "__main__":
    build("notices", "notices", sort_key="date")
    build("education", "items", sort_key="date")
    build("board", "members")

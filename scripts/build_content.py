#!/usr/bin/env python3
"""Aggregates per-item JSON files under content/<name>/ into the single
content/<name>.json files the front-end fetches. Runs as the Netlify build
command so admins can manage each post as its own file (folder collection)
in the CMS, while the site keeps loading one JSON file per page.

Post bodies are written as Markdown in the CMS and rendered to HTML here, so
the browser never has to parse Markdown and untrusted markup can't reach a page.
"""

import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from markdown_lite import render as render_markdown  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(ROOT, "content")


def normalise_attachments(data):
    """Drop blank rows and keep a predictable {name, file} shape."""
    out = []
    for item in data.get("attachments") or []:
        if not isinstance(item, dict):
            continue
        path = (item.get("file") or "").strip()
        if not path:
            continue
        out.append({"name": (item.get("name") or "").strip() or os.path.basename(path),
                    "file": path})
    return out


def build(folder_name, wrapper_key, sort_key=None, reverse=True, render_body=True):
    folder = os.path.join(CONTENT_DIR, folder_name)
    items = []
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("id", os.path.splitext(os.path.basename(path))[0])

        if render_body:
            data["bodyHtml"] = render_markdown(data.get("body", ""))
            # The raw Markdown is only needed by the CMS, not the site.
            data.pop("body", None)
            data["attachments"] = normalise_attachments(data)
            data["pinned"] = bool(data.get("pinned"))

        items.append(data)

    if sort_key:
        items.sort(key=lambda item: item.get(sort_key, ""), reverse=reverse)

    out_path = os.path.join(CONTENT_DIR, f"{folder_name}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({wrapper_key: items}, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{folder_name}: {len(items)}개 항목 -> {out_path}")


if __name__ == "__main__":
    # site.json stays exactly as the CMS writes it - it is both source and
    # output, so nothing generated may be written back into it.
    build("notices", "notices", sort_key="date")
    build("education", "items", sort_key="date")
    build("resources", "items", sort_key="date")
    build("board", "members", render_body=False)

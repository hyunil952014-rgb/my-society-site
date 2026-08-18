"""A small, dependency-free Markdown subset renderer.

Only the constructs an editor realistically needs in a notice are supported:
headings, bold, italic, inline code, links, images, blockquotes, horizontal
rules, and ordered/unordered lists.

Everything is HTML-escaped *before* any markup is generated, so text typed in
the CMS can never inject raw HTML into a page.
"""

import re

_ESCAPES = (("&", "&amp;"), ("<", "&lt;"), (">", "&gt;"), ('"', "&quot;"), ("'", "&#39;"))

# Only these URL schemes may appear in a link/image; anything else (javascript:,
# data:, ...) is dropped so a pasted link cannot become a script trigger.
_SAFE_URL = re.compile(r"^(https?://|mailto:|/|\./|\.\./|#)", re.IGNORECASE)


def escape(text):
    for a, b in _ESCAPES:
        text = text.replace(a, b)
    return text


def _safe_url(url):
    url = url.strip()
    return url if _SAFE_URL.match(url) else ""


def _inline(text):
    """Apply inline markup to an already-escaped string."""
    # Images first so their "!" prefix isn't eaten by the link rule.
    def image(m):
        url = _safe_url(m.group(2))
        if not url:
            # Unsupported scheme: fall back to the caption so nothing dangerous
            # (and no half-parsed syntax) reaches the page.
            return m.group(1)
        return f'<img src="{url}" alt="{m.group(1)}" loading="lazy" />'

    def link(m):
        url = _safe_url(m.group(2))
        if not url:
            return m.group(1)
        external = url.startswith("http")
        extra = ' target="_blank" rel="noopener noreferrer"' if external else ""
        return f'<a href="{url}"{extra}>{m.group(1)}</a>'

    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", image, text)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    # A bare URL on its own becomes a link too - editors paste these constantly.
    text = re.sub(
        r"(?<!\"|>|=)(https?://[^\s<]+)",
        r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>',
        text,
    )
    return text


def render(md):
    """Render a Markdown subset to an HTML string."""
    if not md:
        return ""

    lines = escape(str(md).replace("\r\n", "\n").replace("\r", "\n")).split("\n")
    html = []
    list_stack = []  # open list tags, innermost last

    def close_lists(down_to=0):
        while len(list_stack) > down_to:
            html.append(f"</{list_stack.pop()}>")

    for raw in lines:
        line = raw.rstrip()

        if not line.strip():
            close_lists()
            continue

        heading = re.match(r"^(#{1,4})\s+(.*)$", line)
        if heading:
            close_lists()
            level = len(heading.group(1)) + 1  # page <h1> is the title
            level = min(level, 6)
            html.append(f"<h{level}>{_inline(heading.group(2).strip())}</h{level}>")
            continue

        if re.match(r"^(-{3,}|\*{3,}|_{3,})$", line.strip()):
            close_lists()
            html.append("<hr />")
            continue

        # Text is escaped before parsing, so a quote marker arrives as "&gt;".
        quote = re.match(r"^(?:&gt;|>)\s?(.*)$", line)
        if quote:
            close_lists()
            html.append(f"<blockquote>{_inline(quote.group(1).strip())}</blockquote>")
            continue

        bullet = re.match(r"^\s*[-*+]\s+(.*)$", line)
        number = re.match(r"^\s*\d+[.)]\s+(.*)$", line)
        if bullet or number:
            want = "ul" if bullet else "ol"
            if not list_stack:
                list_stack.append(want)
                html.append(f"<{want}>")
            elif list_stack[-1] != want:
                close_lists()
                list_stack.append(want)
                html.append(f"<{want}>")
            body = (bullet or number).group(1).strip()
            html.append(f"<li>{_inline(body)}</li>")
            continue

        close_lists()
        html.append(f"<p>{_inline(line.strip())}</p>")

    close_lists()
    return "\n".join(html)

#!/usr/bin/env python3
"""Convert .docx files to markdown, preserving headings, lists, bold/italic,
tables, and extracting embedded images to an ./assets/ folder."""
import os
import re
import sys
import zipfile

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph


def extract_media(docx_path, media_dir):
    """Extract images referenced by word/media/* to media_dir.
    Returns {rId: filename}."""
    media_map = {}
    try:
        with zipfile.ZipFile(docx_path) as z:
            try:
                rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
            except KeyError:
                return media_map
            rid2target = dict(
                re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels)
            )
            for name in z.namelist():
                if name.startswith("word/media/"):
                    base = os.path.basename(name)
                    for rid, target in rid2target.items():
                        if target.endswith(base):
                            with z.open(name) as f:
                                data = f.read()
                            out = os.path.join(media_dir, base)
                            with open(out, "wb") as fo:
                                fo.write(data)
                            media_map[rid] = base
                            break
    except zipfile.BadZipFile:
        pass
    return media_map


def render_paragraph(para, media_map):
    """Render one paragraph element to markdown line(s)."""
    blips = para._p.findall(".//" + qn("a:blip"))
    images = []
    for blip in blips:
        rid = blip.get(qn("r:embed"))
        if rid in media_map:
            images.append(f"![{media_map[rid]}](assets/{media_map[rid]})")

    style = para.style.name
    text = "".join(render_run(r) for r in para.runs).strip()

    lines = list(images)
    if not text:
        return lines

    if style.startswith("Title"):
        lines.append("# " + text)
    elif style.startswith("Heading"):
        try:
            n = int(style.split()[-1])
        except ValueError:
            n = 1
        lines.append("#" * min(n, 6) + " " + text)
    elif "List Bullet" in style:
        indent = max(0, style.count("2") + style.count("3"))
        lines.append("    " * indent + "- " + text)
    elif "List Number" in style:
        lines.append("1. " + text)
    elif "Caption" in style:
        lines.append(f"*{text}*")
    elif "Quote" in style:
        lines.append("> " + text)
    else:
        lines.append(text)
    return lines


def render_run(run):
    t = run.text
    if not t:
        return ""
    if run.bold and run.italic:
        return f"***{t}***"
    if run.bold:
        return f"**{t}**"
    if run.italic:
        return f"*{t}*"
    return t


def render_table(table):
    rows = []
    for row in table.rows:
        cells = [
            " ".join(p.text.strip() for p in cell.paragraphs).replace("|", "\\|")
            for cell in row.cells
        ]
        rows.append(cells)
    if not rows:
        return []
    lines = ["| " + " | ".join(rows[0]) + " |"]
    lines.append("|" + "---|" * len(rows[0]))
    for r in rows[1:]:
        lines.append("| " + " | ".join(r) + " |")
    return lines


def convert(docx_path, md_path):
    doc = Document(docx_path)
    media_dir = os.path.join(os.path.dirname(md_path), "assets")
    os.makedirs(media_dir, exist_ok=True)
    media_map = extract_media(docx_path, media_dir)

    lines = []
    body = doc.element.body
    for child in body:
        if child.tag == qn("w:p"):
            para = Paragraph(child, doc)
            lines.extend(render_paragraph(para, media_map))
        elif child.tag == qn("w:tbl"):
            lines.extend(render_table(Table(child, doc)))
            lines.append("")

    # Collapse multiple blank lines, trim trailing whitespace
    out = []
    blank = 0
    for ln in lines:
        if not ln.strip():
            blank += 1
            if blank > 1:
                continue
            out.append("")
        else:
            blank = 0
            out.append(ln.rstrip())
    text = "\n".join(out).rstrip() + "\n"

    with open(md_path, "w", encoding="utf-8") as f:
        f.write(text)
    n_img = len(media_map)
    print(f"OK  {os.path.basename(docx_path)} -> {md_path}  ({len(text)} chars, {n_img} images)")


def main():
    if len(sys.argv) < 2:
        print("usage: convert_docx_to_md.py <file.docx> [<file2.docx> ...]")
        sys.exit(1)
    for p in sys.argv[1:]:
        md = os.path.splitext(p)[0] + ".md"
        convert(p, md)


if __name__ == "__main__":
    main()

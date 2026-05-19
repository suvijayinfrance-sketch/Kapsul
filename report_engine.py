"""Kapsul ReportLab PDF engine — branded academic course reports."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from io import BytesIO
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def clean_markdown(text: str) -> str:
    """
    Convert raw Markdown text to clean plain text safe for ReportLab Paragraph rendering.

    ReportLab Paragraph supports only a small subset of XML tags:
    <b>, <i>, <u>, <br/>, <bullet>. It does NOT support Markdown syntax.
    This function strips all Markdown and returns clean readable text.
    """
    if not text:
        return ""

    text = re.sub(r'\n---+\n', '\n', text)
    text = re.sub(r'\n\*\*\*+\n', '\n', text)
    text = re.sub(r'\n___+\n', '\n', text)

    text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)

    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = re.sub(r'!\[.*?\]\(.+?\)', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def extract_bullets_from_markdown(text: str) -> tuple[list[str], str]:
    """
    Extract bullet point lines from Markdown text.
    Returns (bullets_list, remaining_text_without_bullets).
    """
    bullets = []
    remaining_lines = []

    for line in text.split('\n'):
        bullet_match = re.match(r'^\s*[-*+■]\s+(.+)', line)
        numbered_match = re.match(r'^\s*\d+\.\s+(.+)', line)

        if bullet_match:
            bullets.append(clean_markdown(bullet_match.group(1).strip()))
        elif numbered_match:
            bullets.append(clean_markdown(numbered_match.group(1).strip()))
        else:
            remaining_lines.append(line)

    remaining = clean_markdown('\n'.join(remaining_lines))
    return bullets, remaining


def parse_markdown_to_sections(md_text: str) -> list[dict]:
    """
    Parse a Markdown document into a list of sections.
    Each section: { title, content, bullets, subsections: [{title, content, bullets}] }
    """
    sections = []
    current_section = None
    current_subsection = None
    current_lines = []

    def flush_subsection():
        nonlocal current_subsection, current_lines
        if current_subsection and current_section:
            bullets, content = extract_bullets_from_markdown('\n'.join(current_lines))
            current_subsection['content'] = content
            current_subsection['bullets'] = bullets
            current_section['subsections'].append(current_subsection)
        current_subsection = None
        current_lines = []

    def flush_section():
        nonlocal current_section, current_lines, current_subsection
        flush_subsection()
        if current_section:
            if current_lines:
                bullets, content = extract_bullets_from_markdown('\n'.join(current_lines))
                current_section['content'] = current_section.get('content', '') + content
                current_section['bullets'] = current_section.get('bullets', []) + bullets
            sections.append(current_section)
        current_section = None
        current_lines = []

    for line in md_text.split('\n'):
        if re.match(r'^#\s+', line):
            continue
        elif re.match(r'^##\s+', line):
            flush_section()
            title = re.sub(r'^##\s+', '', line).strip()
            title = clean_markdown(title)
            current_section = {
                'title': title,
                'content': '',
                'bullets': [],
                'subsections': []
            }
            current_lines = []
        elif re.match(r'^###\s+', line):
            flush_subsection()
            if current_section:
                if current_lines:
                    bullets, content = extract_bullets_from_markdown('\n'.join(current_lines))
                    current_section['content'] += content
                    current_section['bullets'] += bullets
                    current_lines = []
                sub_title = re.sub(r'^###\s+', '', line).strip()
                sub_title = clean_markdown(sub_title)
                current_subsection = {
                    'title': sub_title,
                    'content': '',
                    'bullets': []
                }
        elif re.match(r'^####\s+', line):
            current_lines.append(re.sub(r'^####\s+', '', line).strip())
        else:
            current_lines.append(line)

    flush_section()
    return sections


@dataclass
class SchoolConfig:
    school_name: str = "SKEMA Business School"
    primary: str = "#7C3AED"
    logo_initials: str = "SK"
    secondary: str = "#1E1B4B"
    accent: str = "#06B6D4"
    muted: str = "#64748B"
    border: str = "#E2E8F0"
    school_subtitle: str = "École de commerce internationale"
    school_website: str = "www.skema.edu"
    footer_left: str = "Kapsul AI Platform"


SKEMA_CONFIG = SchoolConfig()


@dataclass
class ReportSection:
    title: str
    content: str = ""
    bullets: list[str] = field(default_factory=list)
    table: Optional[list[list[str]]] = None
    subsections: list[ReportSection] = field(default_factory=list)


@dataclass
class ReportData:
    title: str
    subtitle: str = ""
    student: str = ""
    course: str = ""
    professor: str = ""
    doc_sources: list[str] = field(default_factory=list)
    sections: list[ReportSection] = field(default_factory=list)


def _hex(color: str) -> colors.Color:
    c = color.lstrip("#")
    if len(c) == 6:
        return colors.HexColor(f"#{c}")
    return colors.HexColor("#7C3AED")


class KapsulReportEngine:
    """Builds a multi-page PDF from ReportData and SchoolConfig."""

    def __init__(self, school_config: SchoolConfig | None = None):
        self.cfg = school_config or SKEMA_CONFIG
        self.primary = _hex(self.cfg.primary)
        self.secondary = _hex(self.cfg.secondary)
        self.accent = _hex(self.cfg.accent)
        self.muted = _hex(self.cfg.muted)
        self.border = _hex(self.cfg.border)

    def generate(self, report: ReportData) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2.2 * cm,
            bottomMargin=2 * cm,
            title=report.title,
            author=self.cfg.footer_left,
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "KTitle",
            parent=styles["Title"],
            fontSize=22,
            leading=28,
            textColor=self.secondary,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
        subtitle_style = ParagraphStyle(
            "KSubtitle",
            parent=styles["Normal"],
            fontSize=12,
            leading=16,
            textColor=self.muted,
            alignment=TA_CENTER,
            spaceAfter=8,
        )
        h1_style = ParagraphStyle(
            "KH1",
            parent=styles["Heading1"],
            fontSize=16,
            leading=20,
            textColor=self.primary,
            spaceBefore=16,
            spaceAfter=8,
        )
        h2_style = ParagraphStyle(
            "KH2",
            parent=styles["Heading2"],
            fontSize=13,
            leading=17,
            textColor=self.secondary,
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "KBody",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1F2937"),
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        )
        bullet_style = ParagraphStyle(
            "KBullet",
            parent=body_style,
            leftIndent=14,
            bulletIndent=6,
            spaceAfter=4,
        )
        meta_style = ParagraphStyle(
            "KMeta",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=self.muted,
            alignment=TA_LEFT,
        )

        story: list = []

        # Cover block
        story.append(Spacer(1, 2.5 * cm))
        story.append(
            Paragraph(
                f'<font color="{self.cfg.primary}"><b>{self._esc(self.cfg.logo_initials)}</b></font>',
                ParagraphStyle(
                    "Logo",
                    fontSize=28,
                    alignment=TA_CENTER,
                    textColor=self.primary,
                ),
            )
        )
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph(self._esc(self.cfg.school_name), subtitle_style))
        story.append(Paragraph(self._esc(self.cfg.school_subtitle), meta_style))
        story.append(Spacer(1, 1.2 * cm))
        story.append(Paragraph(self._esc(clean_markdown(report.title)), title_style))
        if report.subtitle:
            for line in self._wrap_subtitle_lines(clean_markdown(report.subtitle)):
                story.append(Paragraph(self._esc(line), subtitle_style))

        meta_lines = []
        if report.student:
            meta_lines.append(f"<b>Étudiant :</b> {self._esc(report.student)}")
        if report.course:
            meta_lines.append(f"<b>Cours :</b> {self._esc(report.course)}")
        if report.professor:
            meta_lines.append(f"<b>Professeur :</b> {self._esc(report.professor)}")
        if meta_lines:
            story.append(Spacer(1, 0.8 * cm))
            for line in meta_lines:
                story.append(Paragraph(line, meta_style))

        if report.doc_sources:
            story.append(Spacer(1, 0.6 * cm))
            sources = ", ".join(self._esc(f) for f in report.doc_sources[:8])
            story.append(Paragraph(f"<b>Sources :</b> {sources}", meta_style))

        story.append(PageBreak())

        # Body sections
        for section in report.sections:
            self._add_section(story, section, h1_style, h2_style, body_style, bullet_style)

        if not report.sections:
            story.append(Paragraph("Aucune section disponible.", body_style))

        doc.build(
            story,
            onFirstPage=lambda c, d: self._draw_header_footer(c, d, report),
            onLaterPages=lambda c, d: self._draw_header_footer(c, d, report),
        )
        return buffer.getvalue()

    def _add_section(
        self,
        story: list,
        section: ReportSection,
        h1_style: ParagraphStyle,
        h2_style: ParagraphStyle,
        body_style: ParagraphStyle,
        bullet_style: ParagraphStyle,
    ) -> None:
        story.append(Paragraph(self._esc(clean_markdown(section.title)), h1_style))
        if section.content:
            for para in section.content.split("\n\n"):
                text = clean_markdown(para.strip())
                if text:
                    story.append(Paragraph(self._esc(text), body_style))
        for bullet in section.bullets:
            story.append(
                Paragraph(f"• {self._esc(clean_markdown(bullet))}", bullet_style)
            )
        if section.table and len(section.table) > 1:
            story.append(self._build_table(section.table))
            story.append(Spacer(1, 0.3 * cm))
        for sub in section.subsections:
            story.append(Paragraph(self._esc(clean_markdown(sub.title)), h2_style))
            if sub.content:
                for para in sub.content.split("\n\n"):
                    text = clean_markdown(para.strip())
                    if text:
                        story.append(Paragraph(self._esc(text), body_style))
            for bullet in sub.bullets:
                story.append(
                    Paragraph(f"• {self._esc(clean_markdown(bullet))}", bullet_style)
                )
            if sub.table and len(sub.table) > 1:
                story.append(self._build_table(sub.table))
                story.append(Spacer(1, 0.3 * cm))

    def _build_table(self, rows: list[list[str]]) -> Table:
        data = [[self._esc(cell) for cell in row] for row in rows]
        col_count = max(len(r) for r in data)
        col_width = (A4[0] - 4 * cm) / max(col_count, 1)
        table = Table(data, colWidths=[col_width] * col_count)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), self.primary),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.5, self.border),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        return table

    def _draw_header_footer(self, canvas, doc, report: ReportData) -> None:
        canvas.saveState()
        w, h = A4
        canvas.setStrokeColor(self.primary)
        canvas.setLineWidth(2)
        canvas.line(2 * cm, h - 1.5 * cm, w - 2 * cm, h - 1.5 * cm)
        canvas.setFont("Helvetica-Bold", 9)
        canvas.setFillColor(self.secondary)
        canvas.drawString(2 * cm, h - 1.2 * cm, self.cfg.school_name[:60])
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(self.muted)
        canvas.drawRightString(w - 2 * cm, h - 1.2 * cm, report.title[:50])
        canvas.setStrokeColor(self.border)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, 1.4 * cm, w - 2 * cm, 1.4 * cm)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(2 * cm, 0.9 * cm, self.cfg.footer_left)
        canvas.drawString(2 * cm, 0.5 * cm, self.cfg.school_website)
        canvas.drawRightString(w - 2 * cm, 0.9 * cm, f"Page {doc.page}")
        canvas.restoreState()

    @staticmethod
    def _wrap_subtitle_lines(subtitle: str, max_chars: int = 72) -> list[str]:
        """Word-wrap subtitle for cover page (flowable layout)."""
        words = subtitle.split()
        if not words:
            return []
        lines: list[str] = []
        current: list[str] = []
        for word in words:
            test = " ".join(current + [word]).strip()
            if len(test) <= max_chars:
                current.append(word)
            else:
                if current:
                    lines.append(" ".join(current))
                current = [word]
        if current:
            lines.append(" ".join(current))
        return lines

    @staticmethod
    def _esc(text: str) -> str:
        return (
            str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )

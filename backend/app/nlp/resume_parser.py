import re
import pdfplumber
import spacy
from app.nlp.skills_list import SKILLS

nlp = spacy.load("en_core_web_sm")


def extract_text_from_pdf(file_path):
    """Extract all text from a PDF file."""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def extract_skills(text):
    """
    Match skills using whole-word regex matching.
    Avoids false positives like 'r' matching inside 'Karachi'.
    """
    text_lower = text.lower()
    found_skills = set()

    for skill in SKILLS:
        # Escape special chars (e.g. "c++", "react.js")
        escaped = re.escape(skill.lower())
        # \b = word boundary; handles multi-word skills too
        pattern = r'\b' + escaped + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.lower())

    return sorted(list(found_skills))


def parse_resume(file_path):
    """Full pipeline: PDF → text → skills list."""
    text = extract_text_from_pdf(file_path)
    skills = extract_skills(text)
    return {
        "raw_text_length": len(text),
        "skills": skills,
        "skill_count": len(skills)
    }
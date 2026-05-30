from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).parent.parent / "knowledge"

def load_knowledge(filename: str) -> str:
    path = KNOWLEDGE_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""

def load_all_knowledge() -> str:
    all_content = []
    for file in KNOWLEDGE_DIR.glob("*.md"):
        content = file.read_text(encoding="utf-8")
        all_content.append(f"## {file.name}\n\n{content}")
    return "\n\n---\n\n".join(all_content)
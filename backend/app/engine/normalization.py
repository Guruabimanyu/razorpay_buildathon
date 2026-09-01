import re
from typing import Dict, Any, Tuple

try:
    from rapidfuzz import fuzz
except ImportError:
    # Pure Python Levenshtein fallback if RapidFuzz is not installed
    class FuzzFallback:
        @staticmethod
        def ratio(s1: str, s2: str) -> float:
            s1, s2 = s1.lower(), s2.lower()
            if s1 == s2:
                return 100.0
            if not s1 or not s2:
                return 0.0
            common = set(s1.split()).intersection(set(s2.split()))
            total = set(s1.split()).union(set(s2.split()))
            return (len(common) / max(1, len(total))) * 100.0

        @staticmethod
        def token_sort_ratio(s1: str, s2: str) -> float:
            t1 = " ".join(sorted(s1.lower().split()))
            t2 = " ".join(sorted(s2.lower().split()))
            return FuzzFallback.ratio(t1, t2)

    fuzz = FuzzFallback()

def normalize_entity_name(raw_name: str) -> str:
    """
    Normalizes company/vendor/customer entity names for matching.
    Removes corporate suffixes like Pvt Ltd, Inc, LLC, Corp, Technologies, etc.
    """
    if not raw_name:
        return ""
    
    clean = raw_name.strip()
    
    # Common corporate suffixes
    suffixes = [
        r'\bpvt\.?\s*ltd\.?\b', r'\bprivate\s*limited\b', r'\bltd\.?\b',
        r'\binc\.?\b', r'\bincorporated\b', r'\bcorp\.?\b', r'\bcorporation\b',
        r'\bllc\b', r'\bco\.?\b', r'\bcompany\b', r'\btech\.?\b', r'\btechnologies\b',
        r'\bsolutions\b', r'\bservices\b', r'\benterprises\b', r'\bgroup\b'
    ]
    
    clean_lower = clean.lower()
    for suff in suffixes:
        clean_lower = re.sub(suff, '', clean_lower)
        
    clean_lower = re.sub(r'[^\w\s]', ' ', clean_lower)
    clean_lower = re.sub(r'\s+', ' ', clean_lower).strip()
    
    return clean_lower.upper()

def normalize_reference_id(raw_ref: str) -> str:
    """
    Normalizes invoice/transaction reference codes (removes hyphens, spaces, leading zeros).
    """
    if not raw_ref:
        return ""
    clean = str(raw_ref).upper().strip()
    clean = re.sub(r'[^A-Z0-9]', '', clean)
    return clean

def normalize_date_string(raw_date: Any) -> str:
    """
    Converts various date formats (DD/MM/YYYY, YYYY-MM-DD, ISO) into standardized YYYY-MM-DD.
    """
    if not raw_date:
        return ""
    s_date = str(raw_date).strip().split('T')[0].split(' ')[0]
    
    # Try YYYY-MM-DD
    if re.match(r'^\d{4}-\d{2}-\d{2}$', s_date):
        return s_date
    
    # Try DD/MM/YYYY or DD-MM-YYYY
    match_dmy = re.match(r'^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$', s_date)
    if match_dmy:
        day, month, year = match_dmy.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
        
    return s_date

def calculate_entity_resolution(entity_a: str, entity_b: str) -> Tuple[float, str]:
    """
    Calculates entity resolution similarity score between two entity names.
    Returns (confidence_score, match_type)
    """
    if not entity_a or not entity_b:
        return 0.0, "MISSING_DATA"
        
    norm_a = normalize_entity_name(entity_a)
    norm_b = normalize_entity_name(entity_b)
    
    if norm_a == norm_b and norm_a != "":
        return 100.0, "EXACT_NORMALIZED"
        
    score_token = fuzz.token_sort_ratio(norm_a, norm_b)
    score_raw = fuzz.ratio(entity_a.lower(), entity_b.lower())
    
    final_score = max(score_token, score_raw)
    
    if final_score >= 90:
        match_type = "HIGH_FUZZY"
    elif final_score >= 75:
        match_type = "MEDIUM_FUZZY"
    elif final_score >= 50:
        match_type = "LOW_FUZZY"
    else:
        match_type = "UNRESOLVED"
        
    return round(float(final_score), 2), match_type

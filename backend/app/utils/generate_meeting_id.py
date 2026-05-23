import uuid

def generate_meeting_id() -> str:
    """
    Generates a unique, Zoom-style 10-digit meeting ID using UUID internally.
    Example output format: 123-456-7890
    """
    # Use uuid.uuid4().int which gives a highly unique 128-bit integer representation
    unique_number_str = str(uuid.uuid4().int)
    
    # Grab the first 10 digits to construct a 10-digit Zoom-style ID
    meeting_num = unique_number_str[:10]
    
    # Ensure there's no leading zero (which might be unconventional for Zoom IDs)
    if meeting_num.startswith("0"):
        meeting_num = "9" + meeting_num[1:]
        
    # Format into the standard Zoom format: XXX-XXX-XXXX
    return f"{meeting_num[:3]}-{meeting_num[3:6]}-{meeting_num[6:]}"

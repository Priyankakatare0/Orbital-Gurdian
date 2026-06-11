from sgp4.api import Satrec, jday
from datetime import datetime

def propagate_satellite(line1: str, line2: str):
    sat = Satrec.twoline2rv(line1, line2)

    now = datetime.utcnow()

    jd, fr = jday(
        now.year,
        now.month,
        now.day,
        now.hour,
        now.minute,
        now.second
    )

    e, r, v = sat.sgp4(jd, fr)

    return {
        "x": r[0],
        "y": r[1],
        "z": r[2]
    }
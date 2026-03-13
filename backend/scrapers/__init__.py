from .indeed import IndeedScraper
from .remoteok import RemoteOKScraper


def get_all_scrapers():
    return {
        "remoteok": RemoteOKScraper(),
        "indeed": IndeedScraper(),
        # Future sources can be added here; API/UI already supports toggles.
    }


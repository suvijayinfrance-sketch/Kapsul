"""
Kapsul External Data Sources
=============================
All free, no-license APIs for enriching chat answers with real data.
No API keys required for any of these sources.
"""

from __future__ import annotations

import asyncio
import re

import httpx

TIMEOUT = 8.0  # seconds per request


# ── Source 1: French Company Search ──────────────────────────────────────────

async def search_french_company(query: str) -> dict:
    """
    Search French company registry via api.gouv.fr
    Returns top 3 matching companies with key fields.
    """
    url = "https://recherche-entreprises.api.gouv.fr/search"
    params = {"q": query, "limite": 3, "include": "siege"}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
            results = data.get("results", [])

            companies = []
            for c in results[:3]:
                siege = c.get("siege", {})
                companies.append({
                    "name":         c.get("nom_complet", "N/A"),
                    "siren":        c.get("siren", "N/A"),
                    "siret":        siege.get("siret", "N/A"),
                    "status":       c.get("etat_administratif", "N/A"),
                    "naf_code":     c.get("activite_principale", "N/A"),
                    "naf_label":    c.get("libelle_activite_principale", "N/A"),
                    "address":      siege.get("adresse", "N/A"),
                    "employees":    c.get("tranche_effectif_salarie", "N/A"),
                    "created":      c.get("date_creation", "N/A"),
                    "legal_form":   c.get("nature_juridique", "N/A"),
                })
            return {
                "source":   "Recherche Entreprises (api.gouv.fr)",
                "query":    query,
                "count":    len(companies),
                "results":  companies,
            }
        except Exception as e:
            return {"source": "Recherche Entreprises", "error": str(e), "results": []}


# ── Source 2: BODACC Legal Announcements ─────────────────────────────────────

async def search_bodacc(query: str) -> dict:
    """
    Search BODACC for legal announcements about a French company.
    Returns registrations, modifications, bankruptcies, sales.
    """
    url = "https://bodacc.fr/api/records/1.0/search/"
    params = {
        "dataset": "bodacc-a",
        "q":       query,
        "rows":    5,
        "sort":    "dateparution",
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
            records = data.get("records", [])

            announcements = []
            for rec in records:
                fields = rec.get("fields", {})
                announcements.append({
                    "date":         fields.get("dateparution", "N/A"),
                    "type":         fields.get("typeavis_lib", "N/A"),
                    "company":      fields.get("denomination", "N/A"),
                    "siren":        fields.get("numeroinsertion", "N/A"),
                    "description":  fields.get("complementjugement", fields.get("acte", "N/A")),
                    "tribunal":     fields.get("tribunal", "N/A"),
                })
            return {
                "source":        "BODACC (Bulletin Officiel)",
                "query":         query,
                "count":         len(announcements),
                "announcements": announcements,
            }
        except Exception as e:
            return {"source": "BODACC", "error": str(e), "announcements": []}


# ── Source 3: World Bank ──────────────────────────────────────────────────────

WORLD_BANK_INDICATORS = {
    "gdp":           ("NY.GDP.MKTP.CD",    "GDP (current USD)"),
    "gdp_growth":    ("NY.GDP.MKTP.KD.ZG", "GDP growth (annual %)"),
    "gdp_per_capita":("NY.GDP.PCAP.CD",    "GDP per capita (current USD)"),
    "inflation":     ("FP.CPI.TOTL.ZG",    "Inflation, consumer prices (annual %)"),
    "unemployment":  ("SL.UEM.TOTL.ZS",    "Unemployment (% of labor force)"),
    "population":    ("SP.POP.TOTL",       "Population total"),
    "trade_gdp":     ("NE.TRD.GNFS.ZS",    "Trade (% of GDP)"),
    "fdi":           ("BX.KLT.DINV.WD.GD.ZS", "Foreign direct investment (% of GDP)"),
}

COUNTRY_CODES = {
    "france": "FR", "germany": "DE", "usa": "US", "united states": "US",
    "china": "CN", "uk": "GB", "united kingdom": "GB", "japan": "JP",
    "india": "IN", "brazil": "BR", "italy": "IT", "spain": "ES",
    "netherlands": "NL", "sweden": "SE", "switzerland": "CH",
    "pays-bas": "NL", "allemagne": "DE", "états-unis": "US",
    "royaume-uni": "GB", "japon": "JP", "inde": "IN",
}


async def get_world_bank_data(country: str, indicator: str = "gdp") -> dict:
    """
    Fetch World Bank indicator data for a country.
    country: country name or 2-letter code (e.g. "France" or "FR")
    indicator: one of the keys in WORLD_BANK_INDICATORS
    """
    country_code = COUNTRY_CODES.get(country.lower(), country.upper()[:2])

    indicator_key = indicator.lower()
    if indicator_key in WORLD_BANK_INDICATORS:
        wb_code, indicator_label = WORLD_BANK_INDICATORS[indicator_key]
    else:
        wb_code, indicator_label = WORLD_BANK_INDICATORS["gdp"]

    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/{wb_code}"
    params = {"format": "json", "mrv": 5, "per_page": 5}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

            if not data or len(data) < 2:
                return {"source": "World Bank", "error": "No data returned", "data": []}

            entries = data[1] or []
            points = []
            for entry in entries:
                if entry.get("value") is not None:
                    points.append({
                        "year":  entry.get("date"),
                        "value": entry.get("value"),
                        "unit":  entry.get("unit", ""),
                    })

            return {
                "source":    "World Bank",
                "country":   country,
                "indicator": indicator_label,
                "wb_code":   wb_code,
                "data":      points,
                "link":      f"https://data.worldbank.org/indicator/{wb_code}?locations={country_code}",
            }
        except Exception as e:
            return {"source": "World Bank", "error": str(e), "data": []}


# ── Source 4: Eurostat ────────────────────────────────────────────────────────

EUROSTAT_DATASETS = {
    "gdp":          ("nama_10_gdp",     "GDP at market prices"),
    "unemployment": ("une_rt_a",        "Unemployment rate"),
    "inflation":    ("prc_hicp_aind",   "Harmonised Index of Consumer Prices"),
    "employment":   ("lfsi_emp_a",      "Employment rate"),
    "trade":        ("ext_lt_introle",  "International trade"),
}

EU_COUNTRY_CODES = {
    "france": "FR", "germany": "DE", "italy": "IT", "spain": "ES",
    "netherlands": "NL", "belgium": "BE", "sweden": "SE", "poland": "PL",
    "portugal": "PT", "austria": "AT", "denmark": "DK", "finland": "FI",
    "ireland": "IE", "greece": "GR", "czechia": "CZ", "romania": "RO",
    "allemagne": "DE", "pays-bas": "NL", "belgique": "BE", "suède": "SE",
    "pologne": "PL", "autriche": "AT", "danemark": "DK", "finlande": "FI",
    "irlande": "IE", "grèce": "GR", "eu": "EU27_2020", "europe": "EU27_2020",
}


async def get_eurostat_data(country: str, dataset: str = "gdp") -> dict:
    """
    Fetch Eurostat data for an EU country.
    Falls back to a simplified endpoint if the main one fails.
    """
    country_code = EU_COUNTRY_CODES.get(country.lower(), country.upper()[:2])
    dataset_key  = dataset.lower()

    if dataset_key == "gdp":
        url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp"
        params = {
            "format": "JSON",
            "lang":   "EN",
            "geo":    country_code,
            "na_item":"B1GQ",
            "unit":   "CP_MEUR",
            "time":   ["2019", "2020", "2021", "2022", "2023"],
        }
    elif dataset_key == "unemployment":
        url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/une_rt_a"
        params = {
            "format": "JSON", "lang": "EN",
            "geo": country_code, "sex": "T", "age": "TOTAL", "unit": "PC_ACT",
        }
    else:
        url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nama_10_gdp"
        params = {"format": "JSON", "lang": "EN", "geo": country_code, "na_item": "B1GQ", "unit": "CP_MEUR"}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

            dimension = data.get("dimension", {})
            values    = data.get("value", {})
            time_dim  = dimension.get("time", {}).get("category", {}).get("label", {})

            points = []
            for idx, (_time_key, time_label) in enumerate(time_dim.items()):
                val = values.get(str(idx))
                if val is not None:
                    points.append({"year": time_label, "value": val})

            points.sort(key=lambda x: x["year"], reverse=True)

            dataset_id = url.rstrip("/").split("/")[-1]
            return {
                "source":    "Eurostat",
                "country":   country,
                "indicator": EUROSTAT_DATASETS.get(dataset_key, ("", dataset))[1],
                "data":      points[:5],
                "link":      f"https://ec.europa.eu/eurostat/databrowser/view/{dataset_id}",
            }
        except Exception as e:
            return {"source": "Eurostat", "error": str(e), "data": []}


# ── Source 5: OECD ────────────────────────────────────────────────────────────

OECD_COUNTRIES = {
    "france": "FRA", "germany": "DEU", "usa": "USA", "united states": "USA",
    "uk": "GBR", "united kingdom": "GBR", "japan": "JPN", "canada": "CAN",
    "italy": "ITA", "spain": "ESP", "netherlands": "NLD", "australia": "AUS",
    "sweden": "SWE", "switzerland": "CHE", "belgium": "BEL", "austria": "AUT",
    "denmark": "DNK", "finland": "FIN", "norway": "NOR", "ireland": "IRL",
    "allemagne": "DEU", "états-unis": "USA", "royaume-uni": "GBR",
    "japon": "JPN", "canada": "CAN", "pays-bas": "NLD", "suède": "SWE",
    "suisse": "CHE", "belgique": "BEL", "autriche": "AUT", "danemark": "DNK",
}


async def get_oecd_data(country: str, measure: str = "GDP") -> dict:
    """
    Fetch OECD data for a member country via SDMX REST API.
    No API key required.
    """
    country_code = OECD_COUNTRIES.get(country.lower(), country.upper()[:3])

    url = (
        "https://sdmx.oecd.org/public/rest/data/"
        "OECD.SDD.NAD,DSD_NAMAIN10@DF_TABLE1_EXPENDITURE_HCPC,1.0/"
        f"{country_code}.A.B1GQ....V../ALL"
    )
    params = {
        "format":      "jsondata",
        "startPeriod": "2019",
        "endPeriod":   "2023",
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()

            series = data.get("data", {}).get("dataSets", [{}])[0].get("series", {})
            structure = data.get("data", {}).get("structure", {})
            time_periods = []
            try:
                time_dim = structure["dimensions"]["observation"][0]["values"]
                time_periods = [t["id"] for t in time_dim]
            except (KeyError, IndexError):
                pass

            points = []
            for _series_key, series_data in series.items():
                observations = series_data.get("observations", {})
                for obs_idx, obs_val in observations.items():
                    year = time_periods[int(obs_idx)] if int(obs_idx) < len(time_periods) else obs_idx
                    if obs_val and obs_val[0] is not None:
                        points.append({"year": year, "value": obs_val[0]})

            points.sort(key=lambda x: x.get("year", ""), reverse=True)

            return {
                "source":    "OECD",
                "country":   country,
                "indicator": "GDP (million USD, constant prices)",
                "data":      points[:5],
                "link":      "https://data.oecd.org/gdp/gross-domestic-product-gdp.htm",
            }
        except Exception as e:
            return {"source": "OECD", "error": str(e), "data": []}


# ── Orchestrator: detect what to fetch from the question ─────────────────────

def detect_data_needs(question: str, enabled_sources: list[str]) -> list[dict]:
    """
    Simple keyword detection to decide which API calls to make.
    Returns a list of fetch tasks: [{"source": "worldbank", "args": {...}}, ...]
    """
    q = question.lower()
    tasks = []

    if "entreprises" in enabled_sources or "bodacc" in enabled_sources:
        company_keywords = [
            "entreprise", "société", "siren", "siret", "company", "startup",
            "group", "groupe", "sa ", "sas ", "sarl", "bv ", "plc ",
        ]
        if any(kw in q for kw in company_keywords):
            patterns = [
                r"(?:entreprise|société|company|startup|groupe)\s+([A-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9\s&.-]+?)(?:\s|$|,|\?)",
                r"([A-Z][A-Za-zÀ-ÿ0-9&.-]{2,})\s+(?:SA|SAS|SARL|Group|Groupe)",
                r"(?:sur|about|on)\s+([A-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9\s&.-]+?)(?:\s|$|,|\?)",
            ]
            company_name = None
            for pattern in patterns:
                match = re.search(pattern, question)
                if match:
                    company_name = match.group(1).strip()
                    break
            if company_name:
                if "entreprises" in enabled_sources:
                    tasks.append({"source": "entreprises", "args": {"query": company_name}})
                if "bodacc" in enabled_sources:
                    tasks.append({"source": "bodacc", "args": {"query": company_name}})

    econ_keywords = [
        "gdp", "pib", "croissance", "growth", "inflation", "chômage",
        "unemployment", "économie", "economy", "recession", "macro",
    ]
    country_keywords = (
        list(COUNTRY_CODES.keys())
        + list(EU_COUNTRY_CODES.keys())
        + list(OECD_COUNTRIES.keys())
    )

    detected_country = None
    for ck in country_keywords:
        if ck in q and len(ck) > 3:
            detected_country = ck
            break

    if any(kw in q for kw in econ_keywords) or detected_country:
        country = detected_country or "france"

        indicator = "gdp"
        if any(w in q for w in ["inflation", "prix", "prices", "cpi"]):
            indicator = "inflation"
        elif any(w in q for w in ["chômage", "unemployment", "emploi", "employment"]):
            indicator = "unemployment"
        elif any(w in q for w in ["commerce", "trade", "export", "import"]):
            indicator = "trade_gdp"

        if "worldbank" in enabled_sources:
            tasks.append({"source": "worldbank", "args": {"country": country, "indicator": indicator}})
        if "eurostat" in enabled_sources and country in EU_COUNTRY_CODES:
            tasks.append({"source": "eurostat", "args": {"country": country, "dataset": indicator}})
        if "oecd" in enabled_sources and country in OECD_COUNTRIES:
            tasks.append({"source": "oecd", "args": {"country": country}})

    return tasks


async def fetch_all(tasks: list[dict]) -> list[dict]:
    """Run all data fetch tasks concurrently."""

    async def run_task(task: dict) -> dict:
        source = task["source"]
        args   = task["args"]
        if source == "entreprises":
            return await search_french_company(**args)
        if source == "bodacc":
            return await search_bodacc(**args)
        if source == "worldbank":
            return await get_world_bank_data(**args)
        if source == "eurostat":
            return await get_eurostat_data(**args)
        if source == "oecd":
            return await get_oecd_data(**args)
        return {}

    results = await asyncio.gather(*[run_task(t) for t in tasks], return_exceptions=True)
    return [r for r in results if isinstance(r, dict) and not r.get("error")]


def format_data_for_prompt(results: list[dict]) -> str:
    """Format fetched data into a clean text block for the system prompt."""
    if not results:
        return ""

    lines = ["\n\nDONNÉES EXTERNES DISPONIBLES (sources officielles) :"]

    for r in results:
        source = r.get("source", "Unknown")
        lines.append(f"\n[SOURCE: {source}]")

        if r.get("results"):
            for co in r["results"][:2]:
                lines.append(f"  Entreprise: {co.get('name')} | SIREN: {co.get('siren')}")
                lines.append(f"  Statut: {co.get('status')} | Activité: {co.get('naf_label')}")
                lines.append(f"  Créée le: {co.get('created')} | Effectif: {co.get('employees')}")

        if r.get("announcements"):
            for ann in r["announcements"][:2]:
                desc = (ann.get("description") or "")[:100]
                lines.append(f"  {ann.get('date')} - {ann.get('type')}: {desc}")

        if r.get("data"):
            lines.append(f"  Indicateur: {r.get('indicator', '')} — {r.get('country', '').title()}")
            for pt in r["data"][:3]:
                val = pt.get("value")
                if val is not None:
                    if isinstance(val, float) and val > 1_000_000:
                        val_str = f"{val/1_000_000:.2f}M"
                    elif isinstance(val, float):
                        val_str = f"{val:.2f}"
                    else:
                        val_str = str(val)
                    lines.append(f"  {pt.get('year')}: {val_str}")
            if r.get("link"):
                lines.append(f"  Source: {r['link']}")

    lines.append("\nUtilise ces données dans ta réponse en les citant par leur source.")
    return "\n".join(lines)

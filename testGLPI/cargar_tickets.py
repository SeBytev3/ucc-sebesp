#!/usr/bin/env python3
"""
Crear tickets en GLPI (fecha fija + hora aleatoria) y
asignarlos al técnico/solicitante ID TECH_ID.

Requisitos:
  pip install requests python-dotenv
  Variables .env:
    GLPI_URL=https://glpipage.com/apirest.php
    GLPI_APP_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    GLPI_USER_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
"""

import os
import json
import random
import requests
from dotenv import load_dotenv
from config import TECH_ID

load_dotenv()

# ---------- 1. Tickets a crear ---------------------------------------------
with open("tickets.json", "r", encoding="utf-8") as f:
    TICKETS = json.load(f)

# ---------- 2. Conexión GLPI ------------------------------------------------
GLPI_URL   = os.getenv("GLPI_URL")
APP_TOKEN  = os.getenv("GLPI_APP_TOKEN")
USER_TOKEN = os.getenv("GLPI_USER_TOKEN")

# ---------- 3. Utilidades ---------------------------------------------------
def random_hour() -> str:
    hour   = random.randint(8, 16)   # 08:00–16:59
    minute = random.randint(0, 59)
    return f"{hour:02d}:{minute:02d}:00"

def api(path: str) -> str:
    return f"{GLPI_URL.rstrip('/')}/{path.lstrip('/')}"

def start_session() -> str:
    resp = requests.get(
        api("initSession"),
        headers={
            "App-Token": APP_TOKEN,
            "Authorization": f"user_token {USER_TOKEN}",
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["session_token"]

def end_session(token: str) -> None:
    requests.get(
        api("killSession"),
        headers={"Session-Token": token, "App-Token": APP_TOKEN},
        timeout=10,
    )

# ---------- 4. Operaciones sobre tickets -----------------------------------
def create_ticket(token: str, when: str, title: str, description: str) -> int:
    payload = {
        "input": {
            "name": title,
            "content": description,
            "date": when,
            "status": 1        # Nuevo
        }
    }
    resp = requests.post(
        api("Ticket"),
        headers={
            "Session-Token": token,
            "App-Token": APP_TOKEN,
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()["id"]

def add_actor(token: str, ticket_id: int, user_id: int, role_type: int) -> None:
    """
    role_type:
      1 = Solicitante
      2 = Técnico (Asignado)
    """
    payload = {
        "input": {
            "tickets_id": ticket_id,
            "users_id": user_id,
            "type": role_type
        }
    }
    resp = requests.post(
        api("Ticket_User"),
        headers={
            "Session-Token": token,
            "App-Token": APP_TOKEN,
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=20,
    )
    resp.raise_for_status()

# ---------- 5. Ejecución principal -----------------------------------------
def main() -> None:
    token = start_session()
    try:
        for item in TICKETS:
            datetime_str = f"{item['date']} {random_hour()}"
            tid = create_ticket(
                token,
                datetime_str,
                item["case"],
                item["problem"]          # solo el problema en el contenido
            )

            # Te añades como técnico y solicitante
            add_actor(token, tid, TECH_ID, 2)  # Técnico
            add_actor(token, tid, TECH_ID, 1)  # Solicitante (opcional)

            print(f"✅ Ticket #{tid} creado y asignado a usuario {TECH_ID}: {item['case']}")
    finally:
        end_session(token)

if __name__ == "__main__":
    main()

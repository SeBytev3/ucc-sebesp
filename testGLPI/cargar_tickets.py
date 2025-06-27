#!/usr/bin/env python3
"""
Carga tickets en GLPI, firmándolos con el token del técnico
seleccionado, añade solución y deja el ticket en estado RESUELTO.
"""

import os, json, random, time, requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from techselection import USERS

load_dotenv()

# ---- 1. Leer tickets -------------------------------------------------------
with open("tickets.json", encoding="utf-8") as f:
    TICKETS = json.load(f)

# ---- 2. Elegir técnico y su token -----------------------------------------
def seleccionar_usuario() -> dict:
    for i, u in enumerate(USERS, 1):
        print(f"{i}. {u['name']} (ID {u['id']})")
    try:
        idx = int(input(f"Selecciona 1-{len(USERS)}: ").strip()) - 1
        if 0 <= idx < len(USERS):
            return USERS[idx]
    except Exception:
        pass
    return USERS[0]

usuario    = seleccionar_usuario()
TECH_ID    = usuario["id"]
USER_TOKEN = usuario["token"]          # ¡token del técnico elegido!

# ---- 3. Conexión -----------------------------------------------------------
GLPI_URL  = os.getenv("GLPI_URL").rstrip("/")
APP_TOKEN = os.getenv("GLPI_APP_TOKEN")
api = lambda p: f"{GLPI_URL}/{p.lstrip('/')}"

def start_session() -> str:
    r = requests.get(api("initSession"), headers={
        "App-Token": APP_TOKEN,
        "Authorization": f"user_token {USER_TOKEN}"
    }, timeout=15); r.raise_for_status()
    return r.json()["session_token"]

def end_session(tok: str):
    requests.get(api("killSession"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN
    }, timeout=10)

# ---- 4. Operaciones GLPI ---------------------------------------------------
def create_ticket(tok, fecha, titulo, desc) -> int:
    r = requests.post(api("Ticket"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input":{
        "name": titulo, "content": desc,
        "date": fecha, "status": 1
    }}), timeout=20); r.raise_for_status()
    return r.json()["id"]

def add_actor(tok, tid, uid, role):
    requests.post(api("Ticket_User"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input":{
        "tickets_id": tid, "users_id": uid, "type": role
    }}), timeout=20).raise_for_status()

def add_solution(tok, tid, texto, fecha, tipo_id):
    payload = {"input":{
        "itemtype": "Ticket",
        "items_id": tid,
        "solutiontypes_id": tipo_id,
        "content": texto,
        "date": fecha,
        "status": 1   # propuesta (no cambia estado)
    }}
    r = requests.post(api("ITILSolution"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps(payload), timeout=20)
    if r.status_code != 201:
        print("⚠️  GLPI dice:", r.status_code, r.text)
    r.raise_for_status()

def set_resolved(tok, tid, fecha):
    requests.put(api("Ticket"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input":{
        "id": tid, "status": 5, "solvedate": fecha
    }}), timeout=20).raise_for_status()

# ---- 5. Utilidades ---------------------------------------------------------
rand_hour = lambda: f"{random.randint(8,16):02d}:{random.randint(0,59):02d}:00"

# ---- 6. Main ---------------------------------------------------------------
def main():
    token = start_session()
    try:
        for t in TICKETS:
            start_dt  = f"{t['date']} {rand_hour()}"
            solved_dt = (datetime.strptime(start_dt, "%Y-%m-%d %H:%M:%S")
                         + timedelta(minutes=random.randint(5,60))
                        ).strftime("%Y-%m-%d %H:%M:%S")

            tipo_id = t.get("solution_type", 2)  # 2 por defecto

            tid = create_ticket(token, start_dt, t["case"], t["problem"])
            add_actor(token, tid, TECH_ID, 2)   # Técnico
            add_actor(token, tid, TECH_ID, 1)   # Solicitante
            time.sleep(1)

            add_solution(token, tid, t["solution"], solved_dt, tipo_id)
            set_resolved(token, tid, solved_dt)

            print(f"✅ #{tid} RESUELTO (creado por {usuario['name']}) → {t['case']}")
    finally:
        end_session(token)

if __name__ == "__main__":
    main()

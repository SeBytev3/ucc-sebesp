#!/usr/bin/env python3
"""
GUI simple (Tkinter) para pegar tickets en texto plano,
convertirlos y cargarlos en GLPI.
"""

import os, sys, re, json, random, time, threading, requests, tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from datetime import datetime, timedelta
from dotenv import load_dotenv
from techselection import USERS

# ---------- helper recursos PyInstaller -------------------------------------
def resource_path(rel_path: str) -> str:
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, rel_path)
    return os.path.join(os.path.abspath("."), rel_path)

# ---------- cargar variables .env ------------------------------------------
load_dotenv(resource_path(".env"))

# ---------- Config API ------------------------------------------------------
GLPI_URL  = os.getenv("GLPI_URL").rstrip("/")
APP_TOKEN = os.getenv("GLPI_APP_TOKEN")
api = lambda p: f"{GLPI_URL}/{p.lstrip('/')}"

# ---------- Funciones GLPI --------------------------------------------------
def start_session(user_token):
    r = requests.get(api("initSession"), headers={
        "App-Token": APP_TOKEN,
        "Authorization": f"user_token {user_token}"
    }, timeout=15); r.raise_for_status()
    return r.json()["session_token"]

def end_session(session_token):
    requests.get(api("killSession"), headers={
        "Session-Token": session_token,
        "App-Token": APP_TOKEN
    }, timeout=10)

def create_ticket(tok, fecha, titulo, desc, category_id=None):
    data = {
        "name": titulo,
        "content": desc,
        "date": fecha,
        "status": 1
    }
    if category_id:
        data["itilcategories_id"] = category_id

    r = requests.post(api("Ticket"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input": data}), timeout=20)
    r.raise_for_status()
    return r.json()["id"]

def add_actor(tok, tid, uid, role):
    requests.post(api("Ticket_User"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input": {
        "tickets_id": tid, "users_id": uid, "type": role
    }}), timeout=20).raise_for_status()

def add_solution(tok, tid, texto, fecha, tipo_id):
    payload = {"input":{
        "itemtype": "Ticket",
        "items_id": tid,
        "solutiontypes_id": tipo_id,
        "content": texto,
        "date": fecha,
        "status": 1
    }}
    requests.post(api("ITILSolution"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps(payload), timeout=20).raise_for_status()

def set_resolved(tok, tid, fecha):
    requests.put(api("Ticket"), headers={
        "Session-Token": tok, "App-Token": APP_TOKEN,
        "Content-Type": "application/json"
    }, data=json.dumps({"input":{
        "id": tid, "status": 5, "solvedate": fecha
    }}), timeout=20).raise_for_status()

# ---------- Parser de texto pegado -----------------------------------------
LINE_RE = re.compile(r"^-")

def parse_text(text: str):
    """
    Convierte el bloque pegado en objetos dict.
    Formato esperado:
      DD-MM-YYYY
      -Caso - Problema - Solución - TipoNum - CategoriaID
    """
    tickets, current_date = [], None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            current_date = datetime.strptime(line, "%d-%m-%Y").strftime("%Y-%m-%d")
            continue
        except ValueError:
            pass
        if LINE_RE.match(line) and current_date:
            partes = line.lstrip("-").split(" - ")
            if len(partes) >= 3:
                case, prob, sol = partes[:3]
                tipo = int(partes[3]) if len(partes) > 3 and partes[3].isdigit() else 2
                category = int(partes[4]) if len(partes) > 4 and partes[4].isdigit() else None
                ticket = {
                    "date": current_date,
                    "case": case.strip(),
                    "problem": prob.strip(),
                    "solution": sol.strip(),
                    "solution_type": tipo
                }
                if category:
                    ticket["category"] = category
                tickets.append(ticket)
    return tickets

# ---------- GUI -------------------------------------------------------------
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.iconbitmap(resource_path("iconCargueGLPI.ico"))
        self.title("Cargador GLPI")
        self.geometry("700x500")

        self.user_var = tk.StringVar(value=USERS[0]["name"])
        ttk.Label(self, text="Técnico:").pack(anchor="w", padx=10, pady=(10,0))
        ttk.Combobox(self, textvariable=self.user_var,
                     values=[u["name"] for u in USERS], state="readonly"
                     ).pack(fill="x", padx=10)

        ttk.Label(self, text="Pega los tickets aquí:").pack(anchor="w", padx=10, pady=(10,0))
        self.text = scrolledtext.ScrolledText(self, wrap="word", height=15)
        self.text.pack(fill="both", expand=True, padx=10, pady=5)

        self.btn = ttk.Button(self, text="Cargar a GLPI", command=self.run_upload)
        self.btn.pack(pady=10)

        self.console = tk.Text(self, height=6, bg="#111", fg="#0f0")
        self.console.pack(fill="x", padx=10, pady=(0,10))

    def log(self, msg):
        self.console.insert("end", msg + "\n")
        self.console.see("end")

    def run_upload(self):
        threading.Thread(target=self._upload, daemon=True).start()

    def _upload(self):
        self.btn["state"] = "disabled"
        try:
            raw = self.text.get("1.0", "end")

            aviso = tk.Toplevel(self)
            aviso.title("Un momento…")
            aviso.geometry("380x90")
            aviso.resizable(False, False)
            tk.Label(aviso, text="Haciendo cambiecitos en ese formato,\nporque no los entiendo así…",
                     font=("Segoe UI", 10), justify="center").pack(expand=True, pady=20)
            aviso.update(); aviso.grab_set()

            tickets = parse_text(raw)

            aviso.destroy()

            if not tickets:
                messagebox.showerror("Error", "No se encontraron tickets válidos")
                return

            user = next(u for u in USERS if u["name"] == self.user_var.get())
            tech_id, user_token = user["id"], user["token"]
            self.log(f"➡️  Subiendo {len(tickets)} tickets como {user['name']}…")

            session = start_session(user_token)
            try:
                for t in tickets:
                    start_dt  = f"{t['date']} {random.randint(8,16):02d}:{random.randint(0,59):02d}:00"
                    solved_dt = (datetime.strptime(start_dt, "%Y-%m-%d %H:%M:%S") +
                                 timedelta(minutes=random.randint(5,60))).strftime("%Y-%m-%d %H:%M:%S")
                    tid = create_ticket(session, start_dt, t["case"], t["problem"], t.get("category"))
                    add_actor(session, tid, tech_id, 2)
                    add_actor(session, tid, tech_id, 1)
                    time.sleep(0.3)
                    add_solution(session, tid, t["solution"], solved_dt, t["solution_type"])
                    set_resolved(session, tid, solved_dt)
                    self.log(f"✅ Ticket #{tid} → {t['case']}")
                self.log("🎉  Proceso terminado.")
            finally:
                end_session(session)

        except Exception as e:
            messagebox.showerror("Error", str(e))
        finally:
            self.btn["state"] = "normal"

if __name__ == "__main__":
    App().mainloop()
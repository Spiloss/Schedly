# Schedly – Smart Appointment System

Ottimizza la gestione delle prenotazioni con un sistema **Full-Stack in tempo reale**.

## Tecnologie utilizzate

- Node.js
- TypeScript
- Express
- PostgreSQL (Supabase)
- REST API

---

## Il Problema

Molte piccole attività perdono tempo prezioso gestendo prenotazioni tramite chiamate o messaggi disorganizzati.  
**Schedly** nasce per dare autonomia al cliente e controllo totale al proprietario.

---

## Architettura & Logica

Ho progettato l'applicazione separando nettamente i ruoli:

- **Admin:** gestisce servizi, prezzi e approva manualmente le prenotazioni in attesa.  
- **Cliente:** visualizza disponibilità e prenota in autonomia.

---

## Pannello Amministratore

### Dashboard Admin

La dashboard principale centralizza il monitoraggio di tutte le prenotazioni, permettendo all'admin di avere subito sott'occhio gli appuntamenti del giorno e di gestire rapidamente il flusso di lavoro.

### Gestione Appuntamenti

Un calendario interattivo per gestire gli slot orari in tempo reale. Lo stato può essere cambiato facilmente da 'Pending' a 'Confirmed', evitando sovrapposizioni e mantenendo l’agenda ordinata.

### Anagrafica Clienti

Gestione dei contatti dei clienti con barra di ricerca in tempo reale e funzioni base per aggiungere, modificare o rimuovere profili dal database.

### Gestione Servizi

Catalogo dinamico dei servizi offerti. Permette di definire durata, tipo e prezzo dei servizi in modo flessibile e rapido.

---

## Pannello Cliente

### Interfaccia Prenotazione

Puntata sulla massima semplicità: l’utente visualizza il catalogo con prezzi e durate in modo chiaro, riducendo l’attrito durante il processo di prenotazione.

### Conferma Prenotazione

Selezione data e ora semplificata, con feedback immediato per completare la prenotazione in pochi click.

### Storico Appuntamenti

Controllo completo delle proprie prenotazioni con feedback visivo per distinguere tra appuntamenti confermati e in attesa.

---

## Setup rapido con Supabase

### 1️⃣ Prerequisiti

- Account Supabase attivo
- Progetto PostgreSQL su Supabase

### 2️⃣ Creazione tabelle

Esegui queste query SQL nel **SQL Editor di Supabase**:

`sql
-- Users
create table users (
  id uuid primary key default auth.uid(),
  email text unique,
  created_at timestamp default now()
);

-- Customers
create table customers (
  id uuid primary key references users(id),
  name text not null,
  phone text,
  created_at timestamp default now()
);

-- Services
create table services (
  id serial primary key,
  name text not null,
  duration int not null,
  price numeric not null,
  created_at timestamp default now()
);

-- Bookings
create table bookings (
  id serial primary key,
  customer_id uuid references customers(id),
  service_id int references services(id),
  start_time timestamp not null,
  status text default 'Pending',
  created_at timestamp default now()
);

Policy RLS consigliate

-- Bookings
alter table bookings enable row level security;
create policy "Public_View_Slots" on bookings for select using (true);
create policy "Client_Insert_Request" on bookings for insert with check ((auth.jwt() -> 'user_metadata'::text ->> 'role'::text) = 'customer');

-- Services
alter table services enable row level security;
create policy "Public_View_Services" on services for select using (true);

-- Customers
alter table customers enable row level security;
create policy "Client_View_Own_Profile" on customers for select using (id = auth.uid());

-- Users
alter table users enable row level security;
create policy "Enable read access for own user record" on users for select using (auth.uid() = id);
create policy "Enable insert for authenticated users" on users for insert with check (true);

Crea un file .env nella root del progetto:

SUPABASE_URL=tuo_supabase_url
SUPABASE_KEY=tuo_supabase_anon_key
PORT=3000

Avvio del progetto
# Install dependencies
npm install

# Avvio backend
cd backend
npm start:backend

# Avvio frontend
cd frontend
npm run dev:frontend

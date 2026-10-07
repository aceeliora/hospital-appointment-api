CREATE TABLE patients (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  date_of_birth DATE,
  created_at    TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE doctors (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  specialty  TEXT        NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id               SERIAL    PRIMARY KEY,
  patient_id       INTEGER   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        INTEGER   NOT NULL REFERENCES doctors(id)  ON DELETE RESTRICT,
  appointment_date TIMESTAMP NOT NULL,
  status           TEXT      NOT NULL DEFAULT 'scheduled',
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT now()
);

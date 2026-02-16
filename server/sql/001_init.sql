CREATE table users (
    id SERIAL PRIMARY KEY,
    email TEXT not null UNIQUE,
    password_hash TEXT not null,
    role TEXT not null default 'USER' check (role in ('USER', 'ADMIN')),
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now()
);
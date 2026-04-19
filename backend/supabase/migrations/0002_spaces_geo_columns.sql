alter table public."Spaces"
  add column if not exists "Latitude" double precision,
  add column if not exists "Longitude" double precision;

create index if not exists "idx_spaces_lat_lng"
  on public."Spaces" ("Latitude", "Longitude");

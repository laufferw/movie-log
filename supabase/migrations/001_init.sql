create table movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tmdb_id integer,
  title text not null,
  year integer,
  poster_url text,
  genres text,
  overview text,
  rating integer check (rating >= 1 and rating <= 5),
  thoughts text,
  watched_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table movies enable row level security;
create policy "Users see own movies" on movies for all using (auth.uid() = user_id);

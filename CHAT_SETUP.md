# Private channel: setup

The walkie-talkie on the desk in the room (or `rayanupadhyay.com/#chat`) opens a private, password-protected chat.

## How it stays private
- Every message is encrypted in the browser before it's sent: AES-GCM with a key made from the password (PBKDF2, 250,000 rounds).
- The database only ever stores scrambled text, plus a room ID that is also derived from the password.
- Nobody can read the messages without the password, including Supabase and anyone reading the site's code.
- A wrong password doesn't show an error: it opens a different, empty room.

Things to know:
- **Use a long password** (four or more random words). Anyone with the site's public key can download the scrambled messages, and a weak password could be guessed offline.
- Anyone can post scrambled junk into the table. The page ignores anything it can't decrypt, so it never shows up, but it does use space.
- Changing the password starts a fresh, empty room. The old messages stay unreadable in the database.

## One-time setup (about 5 minutes)
1. Create a free project at https://supabase.com.
2. In the project, open **SQL Editor** and run:

```sql
create table public.messages (
  id bigint generated always as identity primary key,
  room text not null check (length(room) = 32),
  iv text not null check (length(iv) < 64),
  ct text not null check (length(ct) < 6000),
  created_at timestamptz not null default now()
);
create index messages_room_id on public.messages (room, id);
alter table public.messages enable row level security;
create policy "read scrambled messages" on public.messages for select using (true);
create policy "post scrambled messages" on public.messages for insert with check (true);
```

3. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
4. In `index.html`, find `const CHAT_CFG = { url: '', key: '' };` and paste them in, or send them to Claude to do it. The anon key is meant to be public, so it's fine in the page. Never share the `service_role` key.
5. Pick the password and give it, along with the `#chat` link, only to the people who should be in the room.

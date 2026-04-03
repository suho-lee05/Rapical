-- Rapical MVP schema (Supabase/PostgreSQL)
-- Target tables:
-- Admins, Spaces, Participants, Questions, QuestionMessages, FeedPosts

create extension if not exists pgcrypto;

-- UpdatedAt 자동 갱신 트리거 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."UpdatedAt" = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public."Admins" (
  "AdminID" bigint generated always as identity primary key,
  "Email" varchar(100) not null unique,
  "Password" varchar(255) not null,
  "AdminName" varchar(50) not null,
  "Role" varchar(30) not null default 'admin'
    check ("Role" in ('owner', 'admin', 'operator', 'viewer')),
  "IsActive" boolean not null default true,
  "CreatedAt" timestamptz not null default timezone('utc', now()),
  "UpdatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public."Spaces" (
  "SpaceID" bigint generated always as identity primary key,
  "SpaceName" varchar(100) not null,
  "Description" text,
  "HostName" varchar(100),
  "Status" varchar(20) not null default 'draft'
    check ("Status" in ('draft', 'active', 'ended', 'archived')),
  "JoinCode" varchar(10) not null unique,
  "QrToken" varchar(100) not null unique,
  "CreatedBy" bigint not null references public."Admins" ("AdminID"),
  "CreatedAt" timestamptz not null default timezone('utc', now()),
  "UpdatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public."Participants" (
  "ParticipantID" bigint generated always as identity primary key,
  "SpaceID" bigint not null references public."Spaces" ("SpaceID"),
  "Nickname" varchar(50) not null,
  "EntryCodeInput" varchar(10),
  "JoinedVia" varchar(20) not null
    check ("JoinedVia" in ('qr', 'code')),
  "Status" varchar(20) not null default 'active'
    check ("Status" in ('active', 'restricted', 'kicked')),
  "CreatedAt" timestamptz not null default timezone('utc', now()),
  "UpdatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public."FeedPosts" (
  "FeedPostID" bigint generated always as identity primary key,
  "SpaceID" bigint not null references public."Spaces" ("SpaceID"),
  "AuthorAdminID" bigint not null references public."Admins" ("AdminID"),
  "PostType" varchar(20) not null
    check ("PostType" in ('notice', 'faq')),
  "Title" varchar(200) not null,
  "BodyText" text not null,
  "BodyJson" text,
  "IsPinned" boolean not null default false,
  "IsPublished" boolean not null default true,
  "PublishedAt" timestamptz,
  "CreatedAt" timestamptz not null default timezone('utc', now()),
  "UpdatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public."Questions" (
  "QuestionID" bigint generated always as identity primary key,
  "SpaceID" bigint not null references public."Spaces" ("SpaceID"),
  "ParticipantID" bigint not null references public."Participants" ("ParticipantID"),
  "Title" varchar(200),
  "BodyText" text not null,
  "Status" varchar(20) not null default 'pending'
    check ("Status" in ('pending', 'answered', 'rejected', 'closed')),
  "IsPrivate" boolean not null default true,
  "PublishedFaqPostID" bigint references public."FeedPosts" ("FeedPostID"),
  "AssignedAdminID" bigint references public."Admins" ("AdminID"),
  "CreatedAt" timestamptz not null default timezone('utc', now()),
  "UpdatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists public."QuestionMessages" (
  "QuestionMessageID" bigint generated always as identity primary key,
  "QuestionID" bigint not null references public."Questions" ("QuestionID"),
  "SenderType" varchar(20) not null
    check ("SenderType" in ('participant', 'admin', 'system')),
  "AdminID" bigint references public."Admins" ("AdminID"),
  "ParticipantID" bigint references public."Participants" ("ParticipantID"),
  "MessageText" text not null,
  "IsInternalNote" boolean not null default false,
  "CreatedAt" timestamptz not null default timezone('utc', now())
);

create index if not exists "idx_spaces_join_code" on public."Spaces" ("JoinCode");
create index if not exists "idx_participants_space_id" on public."Participants" ("SpaceID");
create index if not exists "idx_feed_posts_space_id" on public."FeedPosts" ("SpaceID");
create index if not exists "idx_questions_space_id" on public."Questions" ("SpaceID");
create index if not exists "idx_questions_participant_id" on public."Questions" ("ParticipantID");
create index if not exists "idx_question_messages_question_id" on public."QuestionMessages" ("QuestionID");

drop trigger if exists trg_admins_set_updated_at on public."Admins";
create trigger trg_admins_set_updated_at
before update on public."Admins"
for each row execute function public.set_updated_at();

drop trigger if exists trg_spaces_set_updated_at on public."Spaces";
create trigger trg_spaces_set_updated_at
before update on public."Spaces"
for each row execute function public.set_updated_at();

drop trigger if exists trg_participants_set_updated_at on public."Participants";
create trigger trg_participants_set_updated_at
before update on public."Participants"
for each row execute function public.set_updated_at();

drop trigger if exists trg_feed_posts_set_updated_at on public."FeedPosts";
create trigger trg_feed_posts_set_updated_at
before update on public."FeedPosts"
for each row execute function public.set_updated_at();

drop trigger if exists trg_questions_set_updated_at on public."Questions";
create trigger trg_questions_set_updated_at
before update on public."Questions"
for each row execute function public.set_updated_at();

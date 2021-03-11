CREATE TABLE public.users
(
    id              SERIAL primary key,

--     Authentication
    username        varchar(200) NOT NULL UNIQUE,
    password        varchar(200) NOT NULL,
    salt            varchar(200) NOT NULL,
    login_method_id integer      NOT NULL,

--      User information
    email           varchar(200),
    phone           varchar(200),
    avatar          varchar(200),
    user_state      smallint     NOT NULL DEFAULT 1,

--     metadata
    record_status   smallint     NOT NULL DEFAULT 0,
    mtime           timestamptz  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN users.login_method_id IS '0. Email + Password; 1. Google OAuth';
COMMENT ON COLUMN users.user_state IS '0. Enabled; 1. Disabled';
COMMENT ON COLUMN users.record_status IS '0. Normal; 1. Deleted';

CREATE TABLE public.subjects
(
    id            SERIAL primary key,
    "name"        varchar(200)  NOT NULL,
    teacher_id    integer       NOT NULL,
    description   varchar(2000) NULL,
    record_status smallint      NOT NULL,
    mtime         timestamptz   NOT NULL
);
CREATE TABLE public.classes
(
    id              SERIAL primary key,
    subject_id      integer      NOT NULL,
    "name"          varchar(200) NOT NULL,
    start_date      date         NOT NULL,
    end_date        date         NOT NULL,
    weekday         smallint     NOT NULL,
    start_time      time         NOT NULL,
    price_per_class money        NOT NULL,
    stock           smallint     NOT NULL,
    record_status   smallint     NOT NULL,
    mtime           timestamptz  NOT NULL
);
CREATE TABLE public.timetable
(
    id            SERIAL primary key,
    class_id      integer     NOT NULL,
    start_time    timestamptz NULL,
    record_status smallint    NOT NULL,
    mtime         timestamptz NOT NULL
);
CREATE TABLE public.teachers
(
    id            SERIAL primary key,
    real_name     varchar(100) NOT NULL,
    record_status smallint     NOT NULL,
    mtime         timestamptz  NOT NULL
);
CREATE TABLE public.students
(
    id            SERIAL primary key,
    real_name     varchar(100) NOT NULL,
    email         varchar(200) NOT NULL,
    phone         varchar(200),
    record_status smallint     NOT NULL,
    mtime         timestamptz  NOT NULL
);
CREATE TABLE public.registration
(
    id                SERIAL primary key,
    student_id        integer     NOT NULL,
    variant_id        integer     NOT NULL,
    registration_time timestamptz NOT NULL,
    record_status     smallint    NOT NULL,
    mtime             timestamptz NOT NULL
);
CREATE TABLE public.attendance
(
    id               SERIAL primary key,
    student_id       integer     NOT NULL,
    timetable_id     integer     NOT NULL,
    attendance_state smallint    NOT NULL,
    record_status    smallint    NOT NULL,
    mtime            timestamptz NOT NULL
);
CREATE TABLE public.payments
(
    id                SERIAL primary key,
    user_id           integer     NOT NULL,
    amount            money       NOT NULL,
    payment_method_id integer     NOT NULL,
    payment_time      timestamptz NOT NULL,
    record_status     smallint    NOT NULL,
    mtime             timestamptz NOT NULL
);
CREATE TABLE public.payment_method
(
    id            SERIAL primary key,
    "name"        varchar(200) NOT NULL,
    payment_type  varchar(200) NOT NULL,
    record_status smallint     NOT NULL,
    mtime         timestamptz  NOT NULL
); 

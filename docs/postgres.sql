CREATE TABLE public.classes ( 
    id SERIAL primary key, 
    "name" varchar(200) NOT NULL, 
    teacherid integer NOT NULL, 
    discription varchar(2000) NULL, 
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.variants ( 
    id SERIAL primary key, 
    classid integer NOT NULL,
    "name" varchar(200) NOT NULL, 
    start_date date NOT NULL,
    end_date date NOT NULL,
    weekday smallint NOT NULL,
    start_time time NOT NULL,
    price_per_class money NOT NULL,
    stock smallint NOT NULL,
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.timetable ( 
    id SERIAL primary key, 
    variantid integer NOT NULL, 
    start_time timestamptz NULL, 
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.teachers ( 
    id SERIAL primary key, 
    realname varchar(100) NOT NULL, 
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.users ( 
    id SERIAL primary key, 
    email varchar(200) NOT NULL, 
    pwd varchar(200) NOT NULL, 
    phone varchar(200), 
    login_method_id integer NOT NULL, 
    user_state smallint NOT NULL,
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.students ( 
    id SERIAL primary key, 
    realname varchar(100) NOT NULL, 
    email varchar(200) NOT NULL, 
    phone varchar(200), 
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.registration ( 
    id SERIAL primary key, 
    studentid integer NOT NULL, 
    variantid integer NOT NULL, 
    registration_time timestamptz NOT NULL,
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.attandance ( 
    id SERIAL primary key, 
    studentid integer NOT NULL, 
    timetableid integer NOT NULL, 
    attandance_state smallint NOT NULL,
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.payments ( 
    id SERIAL primary key, 
    userid integer NOT NULL, 
    amount money NOT NULL,
    payment_method_id integer NOT NULL, 
    payment_time timestamptz NOT NULL,
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 
CREATE TABLE public.payment_method ( 
    id SERIAL primary key, 
    "name" varchar(200) NOT NULL, 
    "payment_type" varchar(200) NOT NULL, 
    status smallint NOT NULL, 
    lmt timestamptz NOT NULL 
); 


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cuentas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas (
    id_cuenta integer NOT NULL,
    nombre_cliente character varying(255),
    saldo numeric
);


ALTER TABLE public.cuentas OWNER TO postgres;

--
-- Name: cuentas_id_cuenta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_id_cuenta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cuentas_id_cuenta_seq OWNER TO postgres;

--
-- Name: cuentas_id_cuenta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_id_cuenta_seq OWNED BY public.cuentas.id_cuenta;


--
-- Name: transacciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transacciones (
    id_transaccion integer NOT NULL,
    id_cuenta integer,
    tipo_transaccion character varying(10),
    monto numeric,
    fecha_transaccion timestamp without time zone
);


ALTER TABLE public.transacciones OWNER TO postgres;

--
-- Name: transacciones_id_transaccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transacciones_id_transaccion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transacciones_id_transaccion_seq OWNER TO postgres;

--
-- Name: transacciones_id_transaccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transacciones_id_transaccion_seq OWNED BY public.transacciones.id_transaccion;


--
-- Name: cuentas id_cuenta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas ALTER COLUMN id_cuenta SET DEFAULT nextval('public.cuentas_id_cuenta_seq'::regclass);


--
-- Name: transacciones id_transaccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones ALTER COLUMN id_transaccion SET DEFAULT nextval('public.transacciones_id_transaccion_seq'::regclass);


--
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas (id_cuenta, nombre_cliente, saldo) FROM stdin;
1	Cliente 38	8017.34
2	Cliente 84	9924.1
3	Cliente 27	6258.74
4	Cliente 40	5522.86
5	Cliente 52	2372.44
6	Cliente 32	8661.45
7	Cliente 49	6487.67
8	Cliente 40	6676.83
9	Cliente 63	5816.87
10	Cliente 2	6504.55
11	Cliente 78	6362.66
12	Cliente 84	2921.95
13	Cliente 50	2902.15
14	Cliente 71	3444.06
15	Cliente 48	7532.9
16	Cliente 96	8346.64
17	Cliente 98	3340.67
18	Cliente 39	1929.47
19	Cliente 35	7267.8
20	Cliente 5	8637.16
21	Cliente 12	9279.34
22	Cliente 10	1233.92
23	Cliente 27	8637.16
24	Cliente 28	7105.64
25	Cliente 24	8516.19
26	Cliente 59	3321.81
27	Cliente 12	7512.86
28	Cliente 13	7577.08
29	Cliente 7	2607.87
30	Cliente 2	1030.53
31	Cliente 84	3097.2
32	Cliente 100	7630.76
33	Cliente 60	7513.92
34	Cliente 27	4504.85
35	Cliente 92	5054.15
36	Cliente 37	3885.95
37	Cliente 15	8875.4
38	Cliente 40	3405.4
39	Cliente 50	9619.09
40	Cliente 85	6078.57
41	Cliente 49	9031.21
42	Cliente 53	3343.6
\.


--
-- Data for Name: transacciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transacciones (id_transaccion, id_cuenta, tipo_transaccion, monto, fecha_transaccion) FROM stdin;
1	1	retiro	730.16	2025-05-01 22:45:38.401587
2	2	retiro	326.37	2025-05-01 22:45:40.420367
3	3	retiro	774.74	2025-05-01 22:45:42.435454
4	4	retiro	336.77	2025-05-01 22:45:44.450845
5	5	deposito	153.05	2025-05-01 22:45:46.45602
6	6	retiro	246.92	2025-05-01 22:45:48.472274
7	7	deposito	465.13	2025-05-01 22:45:50.486977
8	8	retiro	893.56	2025-05-01 22:45:52.501644
9	9	deposito	637.89	2025-05-01 22:45:54.516403
10	10	retiro	641.21	2025-05-01 22:45:56.531363
11	11	deposito	111.16	2025-05-01 22:45:58.54542
12	12	deposito	948.78	2025-05-01 22:46:00.560201
13	13	deposito	500.66	2025-05-01 22:49:11.598954
14	14	deposito	170.79	2025-05-01 22:49:13.604555
15	15	deposito	756.71	2025-05-01 22:49:15.620332
16	16	retiro	870.69	2025-05-01 22:49:17.624836
17	17	deposito	612.84	2025-05-01 22:49:19.640784
18	18	deposito	751.88	2025-05-01 22:49:21.655905
19	19	deposito	368.75	2025-05-01 22:49:23.672412
20	20	retiro	735.44	2025-05-01 22:49:25.687568
21	21	retiro	154.48	2025-05-01 22:49:27.69127
22	22	retiro	584.3	2025-05-01 22:49:29.695355
23	23	deposito	332.58	2025-05-01 22:49:31.709778
24	24	deposito	612.2	2025-05-01 22:49:33.725558
25	25	retiro	657.13	2025-05-01 22:49:35.72895
26	26	deposito	134.8	2025-05-01 22:49:37.732315
27	27	retiro	431.94	2025-05-01 22:49:39.74729
28	28	deposito	931.29	2025-05-01 22:49:41.751461
29	29	retiro	160.82	2025-05-01 22:49:43.766258
30	30	retiro	296.29	2025-05-01 22:49:45.781125
31	31	retiro	693.98	2025-05-01 22:49:47.786137
32	32	retiro	944.17	2025-05-01 22:49:49.791292
33	33	deposito	125.48	2025-05-01 22:49:51.795935
34	34	deposito	617.45	2025-05-01 22:49:53.810505
35	35	retiro	673.55	2025-05-01 22:49:55.825802
36	36	retiro	712.27	2025-05-01 22:49:57.841166
37	37	retiro	980.63	2025-05-01 22:49:59.844715
38	38	retiro	704.99	2025-05-01 22:50:01.860378
39	39	retiro	215.21	2025-05-01 22:50:03.864826
40	40	deposito	634.08	2025-05-01 22:50:05.879813
41	41	retiro	466.12	2025-05-01 22:50:07.884202
42	42	deposito	493.42	2025-05-01 22:50:09.888312
\.


--
-- Name: cuentas_id_cuenta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_id_cuenta_seq', 42, true);


--
-- Name: transacciones_id_transaccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transacciones_id_transaccion_seq', 42, true);


--
-- Name: cuentas cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id_cuenta);


--
-- Name: transacciones transacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_pkey PRIMARY KEY (id_transaccion);


--
-- Name: transacciones transacciones_id_cuenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones
    ADD CONSTRAINT transacciones_id_cuenta_fkey FOREIGN KEY (id_cuenta) REFERENCES public.cuentas(id_cuenta);


--
-- Name: TABLE cuentas; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT ON TABLE public.cuentas TO generador_datos;
GRANT SELECT,INSERT ON TABLE public.cuentas TO mi_usuario;


--
-- Name: SEQUENCE cuentas_id_cuenta_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.cuentas_id_cuenta_seq TO mi_usuario;


--
-- Name: TABLE transacciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT ON TABLE public.transacciones TO generador_datos;
GRANT SELECT,INSERT ON TABLE public.transacciones TO mi_usuario;


--
-- Name: SEQUENCE transacciones_id_transaccion_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.transacciones_id_transaccion_seq TO mi_usuario;


--
-- PostgreSQL database dump complete
--


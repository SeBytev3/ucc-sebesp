CREATE TABLE public.dummy (
	id serial4 NOT NULL,
	"name" varchar(30) NULL
);


INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Stefania Ceron');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Sebastian Espinosa');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Harold Adrian');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Isabella Cordoba');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Luciana Borrero');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Mauricio Rodriguez');
INSERT INTO public.dummy (id, "name") VALUES(nextval('dummy_id_seq'::regclass), 'Joan Huergo');


 
SELECT id, "name" FROM public.dummy;
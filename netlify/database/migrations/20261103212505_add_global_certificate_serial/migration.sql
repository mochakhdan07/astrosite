CREATE SEQUENCE "public"."certificate_serial_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "serial" integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_serial_key" UNIQUE("serial");
CREATE TABLE "certificates" (
	"id" text PRIMARY KEY,
	"recipient_name" text NOT NULL,
	"quiz_name" text NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"score_text" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);

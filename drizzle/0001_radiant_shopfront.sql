CREATE TABLE IF NOT EXISTS "shop_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shop_products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "shop_products_category_idx" ON "shop_products" ("category");

INSERT INTO "shop_products" ("name", "category", "image_url", "link_url") VALUES
('Glow Ritual Vitamin C Serum', 'beauty', 'https://images.unsplash.com/photo-1506617564039-2f3b650b3d47?auto=format&fit=crop&w=800&q=80', 'https://www.sephora.com/product/truth-serum-P411134'),
('HydraBloom Peptide Moisturizer', 'beauty', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80', 'https://www.glossier.com/products/priming-moisturizer'),
('Nordic Omega-3 Complex', 'supplement', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 'https://www.thorne.com/products/dp/omega-3-w-2006390140'),
('Vital Greens Daily Powder', 'supplement', 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=800&q=80', 'https://athleticgreens.com/product/ag1');

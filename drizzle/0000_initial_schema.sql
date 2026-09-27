CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('pending', 'active', 'on_hold', 'closed');--> statement-breakpoint
CREATE TYPE "public"."fulfilment_type" AS ENUM('delivery', 'collection');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('open', 'part_paid', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('invoice', 'credit_note');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'picking', 'dispatched', 'collected', 'invoiced', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('ach', 'check', 'card', 'cash', 'credit_note');--> statement-breakpoint
CREATE TYPE "public"."price_source" AS ENUM('list', 'tier', 'contract', 'quantity_break', 'promotion');--> statement-breakpoint
CREATE TYPE "public"."promotion_scope" AS ENUM('product', 'category', 'all');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('percent_off', 'fixed_price', 'amount_off');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('new', 'quoted', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."tax_code" AS ENUM('standard', 'zero', 'reduced');--> statement-breakpoint
CREATE TYPE "public"."uom" AS ENUM('each', 'box', 'case', 'pair', 'foot', 'length', 'roll', 'bag');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer_admin', 'customer_buyer', 'staff_admin', 'staff');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"label" text NOT NULL,
	"contact_name" text,
	"contact_phone" text,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postcode" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"delivery_instructions" text,
	"is_default_delivery" boolean DEFAULT false NOT NULL,
	"is_billing" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postcode" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"tax_rate_bps" integer DEFAULT 700 NOT NULL,
	"opening_hours" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_number" text NOT NULL,
	"name" text NOT NULL,
	"trading_name" text,
	"price_tier_id" uuid NOT NULL,
	"primary_branch_id" uuid NOT NULL,
	"status" "company_status" DEFAULT 'active' NOT NULL,
	"credit_limit_minor" integer DEFAULT 0 NOT NULL,
	"credit_terms_days" smallint DEFAULT 30 NOT NULL,
	"payment_terms_label" text DEFAULT 'Net 30 days' NOT NULL,
	"tax_exempt" boolean DEFAULT false NOT NULL,
	"tax_exemption_ref" text,
	"tax_id" text,
	"phone" text,
	"email" text,
	"website" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_discount_bps" integer DEFAULT 0 NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"job_title" text,
	"phone" text,
	"role" "user_role" NOT NULL,
	"customer_company_id" uuid,
	"home_branch_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_company_scope_check" CHECK (("users"."role" in ('customer_admin', 'customer_buyer')) = ("users"."customer_company_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category_id" uuid NOT NULL,
	"brand" text NOT NULL,
	"mpn" text,
	"barcode" text,
	"uom" "uom" DEFAULT 'each' NOT NULL,
	"pack_qty" integer DEFAULT 1 NOT NULL,
	"list_price_minor" integer NOT NULL,
	"cost_price_minor" integer,
	"tax_code" "tax_code" DEFAULT 'standard' NOT NULL,
	"weight_grams" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_special_order" boolean DEFAULT false NOT NULL,
	"lead_time_days" smallint,
	"image_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(sku, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(mpn, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'C')) STORED NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_levels" (
	"product_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"qty_on_hand" integer DEFAULT 0 NOT NULL,
	"qty_allocated" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"bin_location" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_levels_product_id_branch_id_pk" PRIMARY KEY("product_id","branch_id")
);
--> statement-breakpoint
CREATE TABLE "customer_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"product_id" uuid,
	"category_id" uuid,
	"price_minor" integer,
	"discount_bps" integer,
	"is_fixed" boolean DEFAULT false NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_prices_target_check" CHECK (("customer_prices"."product_id" is not null)::int + ("customer_prices"."category_id" is not null)::int = 1),
	CONSTRAINT "customer_prices_value_check" CHECK (("customer_prices"."price_minor" is not null)::int + ("customer_prices"."discount_bps" is not null)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "product_tier_prices" (
	"product_id" uuid NOT NULL,
	"price_tier_id" uuid NOT NULL,
	"price_minor" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_tier_prices_product_id_price_tier_id_pk" PRIMARY KEY("product_id","price_tier_id")
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"blurb" text,
	"type" "promotion_type" NOT NULL,
	"scope" "promotion_scope" NOT NULL,
	"product_id" uuid,
	"category_id" uuid,
	"value_bps" integer,
	"value_minor" integer,
	"applies_to_tier_codes" text[],
	"max_qty_per_order" integer,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quantity_breaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"price_tier_id" uuid,
	"customer_company_id" uuid,
	"min_qty" integer NOT NULL,
	"price_minor" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" integer NOT NULL,
	"note" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status",
	"user_id" uuid,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"line_no" smallint NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"uom" "uom" NOT NULL,
	"pack_qty" integer DEFAULT 1 NOT NULL,
	"qty" integer NOT NULL,
	"unit_price_minor" integer NOT NULL,
	"list_price_minor" integer NOT NULL,
	"line_total_minor" integer NOT NULL,
	"tax_code" "tax_code" NOT NULL,
	"price_source" "price_source" NOT NULL,
	"applied_promotion_id" uuid,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"placed_by_user_id" uuid NOT NULL,
	"placed_by_staff_user_id" uuid,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"fulfilment_type" "fulfilment_type" NOT NULL,
	"branch_id" uuid NOT NULL,
	"delivery_address_id" uuid,
	"delivery_name" text,
	"delivery_line1" text,
	"delivery_line2" text,
	"delivery_city" text,
	"delivery_state" text,
	"delivery_postcode" text,
	"delivery_country" text,
	"delivery_instructions" text,
	"customer_po_number" text,
	"requested_date" date,
	"customer_notes" text,
	"internal_notes" text,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"tax_label" text DEFAULT 'Sales Tax' NOT NULL,
	"tax_rate_bps" integer NOT NULL,
	"subtotal_minor" integer NOT NULL,
	"savings_minor" integer DEFAULT 0 NOT NULL,
	"delivery_charge_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"picking_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone,
	"collected_at" timestamp with time zone,
	"invoiced_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_list_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_list_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_shared" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"type" "invoice_type" DEFAULT 'invoice' NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"order_id" uuid,
	"status" "invoice_status" DEFAULT 'open' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" date NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"tax_label" text DEFAULT 'Sales Tax' NOT NULL,
	"tax_rate_bps" integer NOT NULL,
	"subtotal_minor" integer NOT NULL,
	"tax_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"paid_minor" integer DEFAULT 0 NOT NULL,
	"customer_po_number" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_company_id" uuid NOT NULL,
	"invoice_id" uuid,
	"amount_minor" integer NOT NULL,
	"method" "payment_method" NOT NULL,
	"reference" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recorded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_counters" (
	"key" text PRIMARY KEY NOT NULL,
	"prefix" text NOT NULL,
	"next_value" integer DEFAULT 1 NOT NULL,
	"pad_to" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"requirements" text NOT NULL,
	"parsed_lines" jsonb,
	"required_by" text,
	"status" "quote_status" DEFAULT 'new' NOT NULL,
	"staff_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_hits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "trade_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"trade_type" text NOT NULL,
	"years_trading" integer,
	"estimated_monthly_spend_minor" integer,
	"tax_id" text,
	"line1" text,
	"city" text,
	"state" text,
	"postcode" text,
	"message" text,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"reviewed_by_user_id" uuid,
	"staff_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_companies" ADD CONSTRAINT "customer_companies_price_tier_id_price_tiers_id_fk" FOREIGN KEY ("price_tier_id") REFERENCES "public"."price_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_companies" ADD CONSTRAINT "customer_companies_primary_branch_id_branches_id_fk" FOREIGN KEY ("primary_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_home_branch_id_branches_id_fk" FOREIGN KEY ("home_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_prices" ADD CONSTRAINT "customer_prices_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_prices" ADD CONSTRAINT "customer_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_prices" ADD CONSTRAINT "customer_prices_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tier_prices" ADD CONSTRAINT "product_tier_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tier_prices" ADD CONSTRAINT "product_tier_prices_price_tier_id_price_tiers_id_fk" FOREIGN KEY ("price_tier_id") REFERENCES "public"."price_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantity_breaks" ADD CONSTRAINT "quantity_breaks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantity_breaks" ADD CONSTRAINT "quantity_breaks_price_tier_id_price_tiers_id_fk" FOREIGN KEY ("price_tier_id") REFERENCES "public"."price_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quantity_breaks" ADD CONSTRAINT "quantity_breaks_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_lines" ADD CONSTRAINT "cart_lines_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_lines" ADD CONSTRAINT "cart_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_applied_promotion_id_promotions_id_fk" FOREIGN KEY ("applied_promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_placed_by_user_id_users_id_fk" FOREIGN KEY ("placed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_placed_by_staff_user_id_users_id_fk" FOREIGN KEY ("placed_by_staff_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_address_id_addresses_id_fk" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_list_lines" ADD CONSTRAINT "saved_list_lines_saved_list_id_saved_lists_id_fk" FOREIGN KEY ("saved_list_id") REFERENCES "public"."saved_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_list_lines" ADD CONSTRAINT "saved_list_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_lists" ADD CONSTRAINT "saved_lists_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_lists" ADD CONSTRAINT "saved_lists_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_company_id_customer_companies_id_fk" FOREIGN KEY ("customer_company_id") REFERENCES "public"."customer_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_applications" ADD CONSTRAINT "trade_applications_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_company_idx" ON "addresses" USING btree ("customer_company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_code_key" ON "branches" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_companies_account_number_key" ON "customer_companies" USING btree ("account_number");--> statement-breakpoint
CREATE INDEX "customer_companies_status_idx" ON "customer_companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_companies_tier_idx" ON "customer_companies" USING btree ("price_tier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "price_tiers_code_key" ON "price_tiers" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_company_idx" ON "users" USING btree ("customer_company_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_key" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_attributes_product_idx" ON "product_attributes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_attributes_facet_idx" ON "product_attributes" USING btree ("key","value");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_key" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_key" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_active_idx" ON "products" USING btree ("category_id","is_active");--> statement-breakpoint
CREATE INDEX "products_search_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_sku_trgm_idx" ON "products" USING gin ("sku" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "stock_levels_branch_idx" ON "stock_levels" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "customer_prices_lookup_idx" ON "customer_prices" USING btree ("customer_company_id","product_id");--> statement-breakpoint
CREATE INDEX "customer_prices_category_idx" ON "customer_prices" USING btree ("customer_company_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promotions_window_idx" ON "promotions" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "promotions_product_idx" ON "promotions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "promotions_category_idx" ON "promotions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "quantity_breaks_product_idx" ON "quantity_breaks" USING btree ("product_id","min_qty");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_lines_cart_product_key" ON "cart_lines" USING btree ("cart_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_user_key" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_lines_order_idx" ON "order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_lines_product_idx" ON "order_lines" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_lines_order_line_key" ON "order_lines" USING btree ("order_id","line_no");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_key" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_company_placed_idx" ON "orders" USING btree ("customer_company_id","placed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_status_placed_idx" ON "orders" USING btree ("status","placed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_branch_idx" ON "orders" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_list_lines_list_product_key" ON "saved_list_lines" USING btree ("saved_list_id","product_id");--> statement-breakpoint
CREATE INDEX "saved_lists_company_idx" ON "saved_lists" USING btree ("customer_company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_company_status_idx" ON "invoices" USING btree ("customer_company_id","status");--> statement-breakpoint
CREATE INDEX "invoices_due_idx" ON "invoices" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "invoices_order_idx" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_company_received_idx" ON "payments" USING btree ("customer_company_id","received_at");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "quote_requests_status_idx" ON "quote_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_key_window_key" ON "rate_limit_hits" USING btree ("key","window_start");--> statement-breakpoint
CREATE INDEX "rate_limit_window_idx" ON "rate_limit_hits" USING btree ("window_start");--> statement-breakpoint
CREATE INDEX "trade_applications_status_idx" ON "trade_applications" USING btree ("status","created_at");
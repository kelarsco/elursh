--
-- PostgreSQL database dump
--

\restrict ARdoo4BRnq1skpibka9Vj14EWYZvaK5ZoiaQwPA6zJ02nL9DLDsbCwXPZigOAug

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: analysed_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysed_stores (
    id integer NOT NULL,
    store_url text NOT NULL,
    analysed_at timestamp with time zone DEFAULT now(),
    result_json jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.analysed_stores OWNER TO postgres;

--
-- Name: analysed_stores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysed_stores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analysed_stores_id_seq OWNER TO postgres;

--
-- Name: analysed_stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analysed_stores_id_seq OWNED BY public.analysed_stores.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    email text NOT NULL,
    store_link text,
    message text,
    source text,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    updated_at timestamp with time zone DEFAULT now(),
    name text,
    primary_goal text,
    budget text
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: content_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.content_pages (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    body_html text,
    body_text text,
    meta_title text,
    meta_description text,
    published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.content_pages OWNER TO postgres;

--
-- Name: content_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.content_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_pages_id_seq OWNER TO postgres;

--
-- Name: content_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.content_pages_id_seq OWNED BY public.content_pages.id;


--
-- Name: emails_sent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emails_sent (
    id integer NOT NULL,
    to_email text NOT NULL,
    subject text,
    body_text text,
    body_html text,
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.emails_sent OWNER TO postgres;

--
-- Name: emails_sent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emails_sent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emails_sent_id_seq OWNER TO postgres;

--
-- Name: emails_sent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emails_sent_id_seq OWNED BY public.emails_sent.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    email text NOT NULL,
    store_link text,
    collaborator_code text,
    service_id integer,
    service_title text,
    package_name text,
    package_price_usd numeric(10,2),
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    reference text,
    email text,
    amount_kobo bigint,
    amount_usd numeric(10,2),
    metadata_json jsonb,
    status text DEFAULT 'success'::text,
    created_at timestamp with time zone DEFAULT now(),
    fulfillment_status text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    sku text,
    name text NOT NULL,
    description text,
    price_usd numeric(10,2),
    image_url text,
    published boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    type text NOT NULL,
    store_stages jsonb DEFAULT '[]'::jsonb,
    description text,
    pain_points jsonb DEFAULT '[]'::jsonb,
    benefits jsonb DEFAULT '[]'::jsonb,
    delivery_days_min integer DEFAULT 5,
    delivery_days_max integer DEFAULT 10,
    rating numeric(3,1) DEFAULT 4.5,
    users integer DEFAULT 500,
    packages jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: store_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_reports (
    id integer NOT NULL,
    store_url text NOT NULL,
    report_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.store_reports OWNER TO postgres;

--
-- Name: store_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_reports_id_seq OWNER TO postgres;

--
-- Name: store_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_reports_id_seq OWNED BY public.store_reports.id;


--
-- Name: themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.themes (
    id integer NOT NULL,
    name text NOT NULL,
    price numeric(10,2) DEFAULT 99 NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    image text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.themes OWNER TO postgres;

--
-- Name: themes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.themes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.themes_id_seq OWNER TO postgres;

--
-- Name: themes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.themes_id_seq OWNED BY public.themes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'editor'::text NOT NULL,
    display_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: analysed_stores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysed_stores ALTER COLUMN id SET DEFAULT nextval('public.analysed_stores_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: content_pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_pages ALTER COLUMN id SET DEFAULT nextval('public.content_pages_id_seq'::regclass);


--
-- Name: emails_sent id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails_sent ALTER COLUMN id SET DEFAULT nextval('public.emails_sent_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: store_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_reports ALTER COLUMN id SET DEFAULT nextval('public.store_reports_id_seq'::regclass);


--
-- Name: themes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.themes ALTER COLUMN id SET DEFAULT nextval('public.themes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: analysed_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analysed_stores (id, store_url, analysed_at, result_json, created_at) FROM stdin;
27	anewstory.dk	2026-02-02 12:41:42.192551+01	{"status": "Needs improvement", "storeInfo": {"url": "https://anewstory.dk", "country": "Unknown", "currency": "USD", "industry": "Unknown", "platform": "Shopify", "auditDate": "02/02/2026"}, "actionPlan": [{"icon": "TrendingUp", "action": "Set up email automation", "priority": "Medium Impact", "timeEstimate": "1-2 weeks", "revenueImpact": "$2400-6000/month"}, {"icon": "Search", "action": "Improve SEO foundation", "priority": "Medium Impact", "timeEstimate": "4-6 weeks", "revenueImpact": "$1800-4500/month"}, {"icon": "Settings", "action": "Prepare store for ads", "priority": "Low Impact", "timeEstimate": "2-3 weeks", "revenueImpact": "Ready to scale"}], "categories": [{"id": "trust", "icon": "Shield", "score": 64, "title": "Trust Signals & Credibility", "checks": [{"item": "Customer reviews present", "status": "critical", "details": "No review system detected"}, {"item": "Trust badges visible", "status": "good", "details": "Trust badges found"}, {"item": "Contact information visible", "status": "good", "details": "Contact information found"}, {"item": "Policies accessible", "status": "good", "details": "4 policy links found"}, {"item": "Social proof elements", "status": "good", "details": "Social proof found"}, {"item": "Security badges & SSL indicators", "status": "good", "details": "Security badges found"}, {"item": "Return/refund policy visible", "status": "good", "details": "Return policy found"}, {"item": "Shipping information available", "status": "good", "details": "Shipping information found"}, {"item": "Money-back or satisfaction guarantee", "status": "warning", "details": "No guarantee messaging detected. Guarantees reduce purchase anxiety and increase conversions."}, {"item": "Customer count or sales volume indicators", "status": "warning", "details": "No sales volume indicators. Showing customer counts builds social proof and trust."}], "impact": "Low trust reduces checkout conversion by up to 30%. Missing reviews, unclear policies, and lack of security indicators make customers hesitant to purchase.", "status": "Average", "recommendation": "Add customer reviews, trust badges, make policies easily accessible, display security indicators, and add return/refund information prominently."}, {"id": "ux", "icon": "Navigation", "score": 35, "title": "UX & Navigation", "checks": [{"item": "Navigation structure & collection links", "status": "warning", "details": "Good navigation structure with 19 collection links found. Navigation properly connects to product collections. Good, but should be improved."}, {"item": "Mobile responsive", "status": "warning", "details": "Viewport meta tag present. Good, but should be improved."}, {"item": "CTA buttons present", "status": "warning", "details": "181 CTA elements found. Good, but should be improved."}, {"item": "Page structure semantic", "status": "warning", "details": "Semantic HTML structure. Good, but should be improved."}, {"item": "Search functionality present", "status": "good", "details": "Search functionality found"}, {"item": "Breadcrumb navigation", "status": "warning", "details": "No breadcrumb navigation. Breadcrumbs help users understand their location and navigate back."}, {"item": "Footer navigation structure", "status": "good", "details": "11 footer links found. Footer should include important links like policies, contact, and site navigation."}, {"item": "Mobile menu implementation", "status": "warning", "details": "Mobile menu detected. Good, but should be improved."}, {"item": "Image lazy loading", "status": "warning", "details": "Lazy loading detected. Good, but should be improved."}, {"item": "Accessibility features", "status": "warning", "details": "Accessibility features present. Good, but should be improved."}, {"item": "Sticky navigation header", "status": "warning", "details": "No sticky navigation. Sticky headers improve navigation accessibility as users scroll."}, {"item": "Content structure & hierarchy", "status": "good", "details": "10 heading(s) found. Proper heading structure improves readability and SEO."}], "impact": "UX improvements could significantly increase conversions. Poor navigation, missing mobile optimization, and lack of accessibility features prevent customers from easily finding and purchasing products.", "status": "Needs improvement", "themeInfo": {"themeName": null, "confidence": null, "isFreeTheme": false}, "recommendation": "Improve navigation clarity, ensure mobile responsiveness, add search functionality, implement proper accessibility features, and optimize page structure. UX optimization directly impacts conversion rates."}, {"id": "products", "icon": "Package", "score": 70, "title": "Product Pages", "checks": [{"item": "Product information present", "status": "good", "details": "Product elements found"}, {"item": "Product images present", "status": "good", "details": "111 product image(s) found"}, {"item": "Pricing visible", "status": "good", "details": "Pricing information found"}, {"item": "Add to cart button", "status": "good", "details": "Add to cart functionality found"}, {"item": "Product variants clear", "status": "good", "details": "Variant selection found"}, {"item": "Product reviews & customer ratings", "status": "good", "details": "Product reviews found (27 review element(s))"}, {"item": "Product specifications & details", "status": "good", "details": "Product specifications found"}, {"item": "Size guide or fit information", "status": "warning", "details": "No size guide detected. Size guides reduce returns and increase conversions for apparel/footwear."}, {"item": "Stock availability indicators", "status": "good", "details": "Stock indicators found"}, {"item": "Related or upsell products", "status": "warning", "details": "No related products section. Related products increase average order value."}, {"item": "Product video content", "status": "warning", "details": "No product video detected. Videos increase engagement and conversion rates significantly."}, {"item": "Shipping information on product page", "status": "good", "details": "Shipping info found"}, {"item": "Return policy on product page", "status": "good", "details": "Return policy found"}], "impact": "Weak product pages reduce conversion by 20-30%. Missing reviews, unclear product information, and lack of trust signals prevent customers from making purchase decisions.", "status": "Good", "recommendation": "Enhance product descriptions with benefits, add customer reviews, include product specifications, add size guides (if applicable), show stock availability, and display shipping/return information prominently."}, {"id": "seo", "icon": "Search", "score": 35, "title": "SEO Audit", "checks": [{"item": "Meta title present", "status": "critical", "details": "Missing or too short meta title"}, {"item": "Meta description present", "status": "good", "details": "Description length: 222 chars"}, {"item": "H1 tag structure", "status": "warning", "details": "2 H1 tag(s) found (should be 1)"}, {"item": "H2 structure present", "status": "good", "details": "8 H2 tag(s) found"}, {"item": "Image alt text", "status": "good", "details": "83% of images have alt text (115/138)"}, {"item": "Structured data", "status": "good", "details": "Structured data found"}, {"item": "Google Merchant Center setup", "status": "critical", "details": "Google Merchant Center not detected. Missing product feeds prevents products from appearing in Google Shopping."}, {"item": "Google Search Console verified", "status": "good", "details": "Google Search Console verification detected"}], "impact": "Weak SEO reduces organic traffic potential by 40%+. Missing Google Merchant Center prevents products from appearing in Google Shopping. Most stores have significant SEO gaps that limit their visibility and revenue potential.", "status": "Needs improvement", "recommendation": "Add meta titles, descriptions, set up Google Merchant Center for product feeds, verify Google Search Console, and improve content depth. SEO optimization is critical for long-term organic growth."}, {"id": "email", "icon": "Mail", "score": 35, "title": "Email Marketing & Automation", "checks": [{"item": "Email capture form", "status": "good", "details": "Email capture popup detected"}, {"item": "Email automation platform", "status": "critical", "details": "No email automation platform detected (Klaviyo, Mailchimp, Omnisend, Privy, or Justuno)"}], "impact": "Stores using automation recover 15-25% lost sales.", "status": "Needs improvement", "recommendation": "Set up welcome, abandoned cart, and post-purchase email flows."}, {"id": "ads", "icon": "TrendingUp", "score": 35, "title": "Ads Readiness & Funnel", "checks": [{"item": "Facebook Pixel installed", "status": "good", "details": "Facebook Pixel detected"}, {"item": "Google Analytics", "status": "good", "details": "Google Analytics detected"}, {"item": "Google Ads conversion tracking", "status": "good", "details": "Google Ads conversion tracking detected"}, {"item": "TikTok Pixel installed", "status": "warning", "details": "TikTok Pixel not found. Missing opportunity to track TikTok ad performance."}, {"item": "Snapchat Pixel installed", "status": "warning", "details": "Snapchat Pixel not found. Missing opportunity for Snapchat ad tracking."}, {"item": "Purchase event tracking", "status": "good", "details": "Purchase event tracking detected"}, {"item": "Add to Cart event tracking", "status": "critical", "details": "Add to Cart event tracking not found. Essential for retargeting and conversion optimization."}, {"item": "View Content event tracking", "status": "warning", "details": "View Content event tracking not found. Helps optimize ad targeting and retargeting."}, {"item": "Retargeting pixels setup", "status": "good", "details": "2 retargeting pixel(s) detected. Retargeting is essential for converting visitors who didn't purchase initially."}, {"item": "Server-side tracking implementation", "status": "good", "details": "Server-side tracking detected"}, {"item": "Landing pages ready", "status": "good", "details": "Landing pages found"}, {"item": "UTM parameter tracking", "status": "warning", "details": "UTM parameter tracking not detected. UTM parameters help track which ads drive traffic and conversions."}, {"item": "Campaign-specific landing pages", "status": "warning", "details": "No campaign-specific landing pages. Dedicated landing pages improve ad conversion rates."}, {"item": "Checkout flow tracking", "status": "warning", "details": "Checkout flow tracking not detected. Tracking checkout steps helps identify drop-off points."}], "impact": "Store is not ready for scaling ads effectively. Missing critical tracking pixels, conversion events, and retargeting capabilities prevent proper ad optimization and ROI measurement. Without proper tracking, ad spend is wasted and campaigns cannot be optimized.", "status": "Needs improvement", "recommendation": "Set up Facebook Pixel, Google Ads conversion tracking, implement Purchase and AddToCart events, add retargeting pixels (TikTok, Snapchat), optimize landing pages for ad traffic, implement UTM tracking, and set up server-side tracking for better reliability. Proper ad tracking is essential for scaling profitably."}], "revenueLoss": {"max": 30000, "min": 12000, "breakdown": [{"color": "bg-red-500", "label": "Trust issues", "percentage": 14, "description": "Missing reviews, trust badges, or clear policies making customers hesitant to buy"}, {"color": "bg-orange-500", "label": "Poor product pages", "percentage": 11, "description": "Weak product descriptions, unclear benefits, or missing information that prevents sales"}, {"color": "bg-yellow-500", "label": "No email automation", "percentage": 18, "description": "Not recovering abandoned carts or following up with customers after they leave"}, {"color": "bg-blue-500", "label": "Weak SEO", "percentage": 16, "description": "Not showing up in Google searches, missing out on free organic traffic"}, {"color": "bg-purple-500", "label": "Ads inefficiency", "percentage": 10, "description": "Ads not properly tracked or optimized, wasting ad spend"}]}, "overallScore": 40}	2026-02-02 11:21:12.105921+01
28	dogsnug.com	2026-02-02 12:51:53.493549+01	{"status": "Needs improvement", "storeInfo": {"url": "https://dogsnug.com", "country": "Unknown", "currency": "USD", "industry": "Unknown", "platform": "Shopify", "auditDate": "02/02/2026"}, "actionPlan": [{"icon": "Search", "action": "Improve SEO foundation", "priority": "Medium Impact", "timeEstimate": "4-6 weeks", "revenueImpact": "$1620-4050/month"}, {"icon": "Settings", "action": "Prepare store for ads", "priority": "Low Impact", "timeEstimate": "2-3 weeks", "revenueImpact": "Ready to scale"}], "categories": [{"id": "trust", "icon": "Shield", "score": 68, "title": "Trust Signals & Credibility", "checks": [{"item": "Customer reviews present", "status": "good", "details": "125 review elements found"}, {"item": "Trust badges visible", "status": "good", "details": "Trust badges found"}, {"item": "Contact information visible", "status": "good", "details": "Contact information found"}, {"item": "Policies accessible", "status": "warning", "details": "1 policy links found"}, {"item": "Social proof elements", "status": "good", "details": "Social proof found"}, {"item": "Security badges & SSL indicators", "status": "good", "details": "Security badges found"}, {"item": "Return/refund policy visible", "status": "good", "details": "Return policy found"}, {"item": "Shipping information available", "status": "good", "details": "Shipping information found"}, {"item": "Money-back or satisfaction guarantee", "status": "warning", "details": "No guarantee messaging detected. Guarantees reduce purchase anxiety and increase conversions."}, {"item": "Customer count or sales volume indicators", "status": "warning", "details": "No sales volume indicators. Showing customer counts builds social proof and trust."}], "impact": "Trust signals could be improved to increase conversions. Adding more social proof, guarantees, and security badges will boost customer confidence.", "status": "Average", "recommendation": "Enhance trust signals with more social proof, clear policies, security badges, guarantees, and customer count indicators."}, {"id": "ux", "icon": "Navigation", "score": 35, "title": "UX & Navigation", "checks": [{"item": "Navigation structure & collection links", "status": "warning", "details": "Good navigation structure with 46 collection links found. Navigation properly connects to product collections. Good, but should be improved."}, {"item": "Mobile responsive", "status": "warning", "details": "Viewport meta tag present. Good, but should be improved."}, {"item": "CTA buttons present", "status": "warning", "details": "35 CTA elements found. Good, but should be improved."}, {"item": "Page structure semantic", "status": "warning", "details": "Semantic HTML structure. Good, but should be improved."}, {"item": "Search functionality present", "status": "good", "details": "Search functionality found"}, {"item": "Breadcrumb navigation", "status": "warning", "details": "No breadcrumb navigation. Breadcrumbs help users understand their location and navigate back."}, {"item": "Footer navigation structure", "status": "good", "details": "7 footer links found. Footer should include important links like policies, contact, and site navigation."}, {"item": "Mobile menu implementation", "status": "warning", "details": "Mobile menu detected. Good, but should be improved."}, {"item": "Image lazy loading", "status": "warning", "details": "Lazy loading detected. Good, but should be improved."}, {"item": "Accessibility features", "status": "warning", "details": "Accessibility features present. Good, but should be improved."}, {"item": "Sticky navigation header", "status": "good", "details": "Sticky navigation detected"}, {"item": "Content structure & hierarchy", "status": "good", "details": "24 heading(s) found. Proper heading structure improves readability and SEO."}], "impact": "UX improvements could significantly increase conversions. Poor navigation, missing mobile optimization, and lack of accessibility features prevent customers from easily finding and purchasing products.", "status": "Needs improvement", "themeInfo": {"themeName": null, "confidence": null, "isFreeTheme": false}, "recommendation": "Improve navigation clarity, ensure mobile responsiveness, add search functionality, implement proper accessibility features, and optimize page structure. UX optimization directly impacts conversion rates."}, {"id": "products", "icon": "Package", "score": 70, "title": "Product Pages", "checks": [{"item": "Product information present", "status": "good", "details": "Product elements found"}, {"item": "Product images present", "status": "good", "details": "15 product image(s) found"}, {"item": "Pricing visible", "status": "critical", "details": "Pricing not clearly displayed"}, {"item": "Add to cart button", "status": "good", "details": "Add to cart functionality found"}, {"item": "Product variants clear", "status": "good", "details": "Variant selection found"}, {"item": "Product reviews & customer ratings", "status": "good", "details": "Product reviews found (124 review element(s))"}, {"item": "Product specifications & details", "status": "good", "details": "Product specifications found"}, {"item": "Size guide or fit information", "status": "good", "details": "Size guide found"}, {"item": "Stock availability indicators", "status": "good", "details": "Stock indicators found"}, {"item": "Related or upsell products", "status": "warning", "details": "No related products section. Related products increase average order value."}, {"item": "Product video content", "status": "good", "details": "Product video found"}, {"item": "Shipping information on product page", "status": "good", "details": "Shipping info found"}, {"item": "Return policy on product page", "status": "good", "details": "Return policy found"}], "impact": "Weak product pages reduce conversion by 20-30%. Missing reviews, unclear product information, and lack of trust signals prevent customers from making purchase decisions.", "status": "Good", "recommendation": "Enhance product descriptions with benefits, add customer reviews, include product specifications, add size guides (if applicable), show stock availability, and display shipping/return information prominently."}, {"id": "seo", "icon": "Search", "score": 35, "title": "SEO Audit", "checks": [{"item": "Meta title present", "status": "critical", "details": "Missing or too short meta title"}, {"item": "Meta description present", "status": "good", "details": "Description length: 320 chars"}, {"item": "H1 tag structure", "status": "good", "details": "1 H1 tag(s) found (should be 1)"}, {"item": "H2 structure present", "status": "good", "details": "19 H2 tag(s) found"}, {"item": "Image alt text", "status": "warning", "details": "62% of images have alt text (29/47)"}, {"item": "Structured data", "status": "warning", "details": "No structured data detected"}, {"item": "Google Merchant Center setup", "status": "critical", "details": "Google Merchant Center not detected. Missing product feeds prevents products from appearing in Google Shopping."}, {"item": "Google Search Console verified", "status": "good", "details": "Google Search Console verification detected"}], "impact": "Weak SEO reduces organic traffic potential by 40%+. Missing Google Merchant Center prevents products from appearing in Google Shopping. Most stores have significant SEO gaps that limit their visibility and revenue potential.", "status": "Needs improvement", "recommendation": "Add meta titles, descriptions, set up Google Merchant Center for product feeds, verify Google Search Console, and improve content depth. SEO optimization is critical for long-term organic growth."}, {"id": "email", "icon": "Mail", "score": 75, "title": "Email Marketing & Automation", "checks": [{"item": "Email capture form", "status": "good", "details": "Email marketing app detected with capture capability"}, {"item": "Email automation platform", "status": "good", "details": "Klaviyo detected"}], "impact": "Email marketing setup detected.", "status": "Good", "recommendation": "Continue optimizing email flows."}, {"id": "ads", "icon": "TrendingUp", "score": 35, "title": "Ads Readiness & Funnel", "checks": [{"item": "Facebook Pixel installed", "status": "good", "details": "Facebook Pixel detected"}, {"item": "Google Analytics", "status": "good", "details": "Google Analytics detected"}, {"item": "Google Ads conversion tracking", "status": "good", "details": "Google Ads conversion tracking detected"}, {"item": "TikTok Pixel installed", "status": "good", "details": "TikTok Pixel detected"}, {"item": "Snapchat Pixel installed", "status": "good", "details": "Snapchat Pixel detected"}, {"item": "Purchase event tracking", "status": "good", "details": "Purchase event tracking detected"}, {"item": "Add to Cart event tracking", "status": "good", "details": "Add to Cart event tracking detected"}, {"item": "View Content event tracking", "status": "warning", "details": "View Content event tracking not found. Helps optimize ad targeting and retargeting."}, {"item": "Retargeting pixels setup", "status": "good", "details": "3 retargeting pixel(s) detected. Retargeting is essential for converting visitors who didn't purchase initially."}, {"item": "Server-side tracking implementation", "status": "good", "details": "Server-side tracking detected"}, {"item": "Landing pages ready", "status": "good", "details": "Landing pages found"}, {"item": "UTM parameter tracking", "status": "good", "details": "UTM tracking detected"}, {"item": "Campaign-specific landing pages", "status": "good", "details": "3 campaign page(s) found"}, {"item": "Checkout flow tracking", "status": "good", "details": "Checkout flow tracking detected"}], "impact": "Store is not ready for scaling ads effectively. Missing critical tracking pixels, conversion events, and retargeting capabilities prevent proper ad optimization and ROI measurement. Without proper tracking, ad spend is wasted and campaigns cannot be optimized.", "status": "Needs improvement", "recommendation": "Set up Facebook Pixel, Google Ads conversion tracking, implement Purchase and AddToCart events, add retargeting pixels (TikTok, Snapchat), optimize landing pages for ad traffic, implement UTM tracking, and set up server-side tracking for better reliability. Proper ad tracking is essential for scaling profitably."}], "revenueLoss": {"max": 27000, "min": 10800, "breakdown": [{"color": "bg-red-500", "label": "Trust issues", "percentage": 13, "description": "Missing reviews, trust badges, or clear policies making customers hesitant to buy"}, {"color": "bg-orange-500", "label": "Poor product pages", "percentage": 11, "description": "Weak product descriptions, unclear benefits, or missing information that prevents sales"}, {"color": "bg-yellow-500", "label": "No email automation", "percentage": 5, "description": "Not recovering abandoned carts or following up with customers after they leave"}, {"color": "bg-blue-500", "label": "Weak SEO", "percentage": 16, "description": "Not showing up in Google searches, missing out on free organic traffic"}, {"color": "bg-purple-500", "label": "Ads inefficiency", "percentage": 10, "description": "Ads not properly tracked or optimized, wasting ad spend"}]}, "overallScore": 46}	2026-02-02 12:51:53.493549+01
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, email, store_link, message, source, created_at, status, updated_at, name, primary_goal, budget) FROM stdin;
2	dkelaroma@gmail.com	kimi.com	hello, i wan get sales ni seh	contact_page	2026-02-02 00:02:57.502848+01	completed	2026-02-02 00:04:13.152013+01	kimi	increase_sales	2500+
1	dkelaroma@gmail.com	kiki.com	hello, elursh team, i'll like to increase my store sales, can you help me out with this?	contact_page	2026-02-01 21:17:28.112795+01	deleted	2026-02-02 00:09:24.343571+01	\N	\N	\N
5	kelars.co@gmail.com	jiji.com	hwllo, buddy	contact_page	2026-02-02 11:05:20.489712+01	completed	2026-02-02 12:35:57.769194+01	Roland Eze	theme_purchase	1000-2500
4	kelars.co@gmail.com	elursh.com	hello, help me get sales	contact_page	2026-02-02 11:01:54.381057+01	completed	2026-02-02 12:36:00.417101+01	Roland Ezekiel	increase_sales	1000-2500
3	kelaromaa@gmail.com	seremi.com	hello, please i want to buy a theme	contact_page	2026-02-02 10:41:56.56174+01	completed	2026-02-02 12:36:02.396972+01	dudley	theme_purchase	2500+
\.


--
-- Data for Name: content_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.content_pages (id, slug, title, body_html, body_text, meta_title, meta_description, published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emails_sent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emails_sent (id, to_email, subject, body_text, body_html, sent_at, created_at) FROM stdin;
1	dkelaroma@gmail.com	no export	hji	\N	2026-02-01 15:41:47.720944+01	2026-02-01 15:41:47.720944+01
2	dkelaroma@gmail.com	TikTok - Convert your store visitors	hello, are you ready for this converion	\N	2026-02-01 16:01:58.756171+01	2026-02-01 16:01:58.756171+01
3	dkelaroma@gmail.com	TikTok - Convert your store visitors	ogo buruki	\N	2026-02-02 00:04:41.256238+01	2026-02-02 00:04:41.256238+01
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, email, store_link, collaborator_code, service_id, service_title, package_name, package_price_usd, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, reference, email, amount_kobo, amount_usd, metadata_json, status, created_at, fulfillment_status) FROM stdin;
15	t3g2vbqvkm	dkelaroma@gmail.com	15840000	99.00	{"email": "dkelaroma@gmail.com", "themeId": "4", "referrer": "http://localhost:8080/", "storeLink": "https://kiki.com", "themeName": "Zenith", "amount_usd": "99"}	success	2026-02-01 22:26:01.93868+01	deleted
14	kkqw6kb4xs	dkelaroma@gmail.com	23840000	149.00	{"order_id": "14", "referrer": "http://localhost:8080/", "store_url": "https://gugu.com", "amount_usd": "149", "package_name": "Basic", "service_title": "Trust & Credibility Setup"}	success	2026-02-01 20:30:13.576932+01	deleted
13	k0efa19xsy	dkelaroma@gmail.com	39840000	\N	{"order_id": "13", "referrer": "http://localhost:8080/", "store_url": "https://jumia.com", "package_name": "Basic", "service_title": "Review & UGC Setup"}	success	2026-02-01 20:29:22.639779+01	deleted
4	3lv05kuxlh	dkelaroma@gmail.com	8000000	\N	{"referrer": "http://localhost:8080/"}	success	2026-02-01 16:01:15.718683+01	deleted
2	jb92f3g6g7	dkelaroma@gmail.com	8000000	\N	{"referrer": "http://localhost:8080/"}	success	2026-01-31 01:56:45.548667+01	deleted
16	06yeu90qd4	dkelaroma@gmail.com	16000	0.10	{"order_id": "15", "referrer": "http://localhost:8080/", "store_url": "https://anewstory.dk", "amount_usd": "0.1", "package_name": "Basic", "service_title": "SEO Optimization"}	success	2026-02-01 23:37:55.886199+01	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, sku, name, description, price_usd, image_url, published, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version, applied_at) FROM stdin;
001_schema_migrations	2026-01-30 20:58:36.383802+01
002_initial_schema	2026-01-30 20:58:36.400492+01
003_analysed_stores_unique_store_url	2026-02-01 17:19:51.40813+01
004_themes	2026-02-01 17:19:51.536939+01
005_contacts_status	2026-02-01 20:38:31.699077+01
006_payments_fulfillment_status	2026-02-01 20:45:53.892368+01
007_contacts_form_fields	2026-02-01 20:57:55.584364+01
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, title, category, type, store_stages, description, pain_points, benefits, delivery_days_min, delivery_days_max, rating, users, packages, sort_order, created_at, updated_at) FROM stdin;
3	Conversion Rate Optimization	salesGrowth	CRO	["Growing", "Scaling"]	Product pages, checkout flow, and trust elements tuned for more sales per visitor.	["Low add-to-cart rate", "Checkout abandonment", "Weak product presentation"]	["Higher conversion rate", "Fewer abandoned carts", "Clear ROI focus"]	7	14	4.8	780	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Product page audit", "CTA & layout tweaks (10 pages)"], "deliveryDays": 7}, {"name": "Standard", "price": 749, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full CRO audit", "Product + collection pages", "Trust badges & social proof"], "deliveryDays": 10}, {"name": "Premium", "price": 1299, "support": "Priority + 2 calls", "revisions": 3, "deliverables": ["Full CRO + checkout optimization", "A/B test setup", "Ongoing monitoring"], "deliveryDays": 14}]	1	2026-02-01 17:57:07.324914+01	2026-02-01 17:57:07.324914+01
4	Speed Optimization	storeImprovement	Speed	["New Store", "Growing", "Scaling"]	Faster load times and Core Web Vitals improvements so every second counts for sales.	["Slow product pages", "Poor mobile scores", "Heavy themes or apps"]	["Faster load times", "Better Core Web Vitals", "Higher mobile rankings"]	3	7	4.6	1100	[{"name": "Basic", "price": 199, "support": "Email", "revisions": 1, "deliverables": ["Speed audit", "Image optimization", "Lazy loading"], "deliveryDays": 3}, {"name": "Standard", "price": 399, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + app cleanup", "Theme/JS optimization", "CDN setup"], "deliveryDays": 5}, {"name": "Premium", "price": 699, "support": "Priority", "revisions": 3, "deliverables": ["Full optimization", "Custom code minification", "Ongoing monitoring"], "deliveryDays": 7}]	2	2026-02-01 17:57:07.325902+01	2026-02-01 17:57:07.325902+01
5	Email & Abandoned Cart Flows	salesGrowth	Email	["Growing", "Scaling"]	Automated sequences for abandoned cart, welcome, and post-purchase to recover lost sales.	["No abandoned cart emails", "Low email engagement", "Manual follow-ups"]	["Recover 10–15% abandoned carts", "Set-and-forget automation", "Measurable revenue"]	5	10	4.7	650	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Abandoned cart flow (3 emails)", "Welcome series"], "deliveryDays": 5}, {"name": "Standard", "price": 599, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + post-purchase", "Segment setup", "Copy + design"], "deliveryDays": 7}, {"name": "Premium", "price": 999, "support": "Priority", "revisions": 3, "deliverables": ["Full flows + win-back", "Custom triggers", "Reporting dashboard"], "deliveryDays": 10}]	3	2026-02-01 17:57:07.326849+01	2026-02-01 17:57:07.326849+01
6	Trust & Credibility Setup	salesGrowth	Trust	["New Store", "Growing", "Scaling"]	Trust badges, reviews, policies, and security cues so visitors feel safe buying.	["No reviews or badges", "Unclear policies", "Low trust signals"]	["Higher trust at checkout", "Fewer support questions", "Better conversion"]	2	5	4.5	840	[{"name": "Basic", "price": 149, "support": "Email", "revisions": 1, "deliverables": ["Trust badges placement", "Policy pages review"], "deliveryDays": 2}, {"name": "Standard", "price": 299, "support": "Email", "revisions": 2, "deliverables": ["Basic + review app setup", "Social proof blocks", "FAQ section"], "deliveryDays": 4}, {"name": "Premium", "price": 499, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Full trust audit", "Custom badges", "Guarantee messaging"], "deliveryDays": 5}]	4	2026-02-01 17:57:07.327933+01	2026-02-01 17:57:07.327933+01
7	Product Page Copywriting	salesGrowth	Copy	["New Store", "Growing", "Scaling"]	Conversion-focused product copy and structure that answers objections and drives add-to-cart.	["Weak product descriptions", "No benefit-focused copy", "Missing USPs"]	["Clear value proposition", "Fewer returns from wrong expectations", "Higher AOV potential"]	5	12	4.8	520	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["10 product descriptions", "Tone & style guide"], "deliveryDays": 5}, {"name": "Standard", "price": 499, "support": "Email + 1 call", "revisions": 2, "deliverables": ["25 products", "Headlines + bullets", "A/B copy options"], "deliveryDays": 8}, {"name": "Premium", "price": 899, "support": "Priority", "revisions": 3, "deliverables": ["50 products", "Collection copy", "Ongoing batch support"], "deliveryDays": 12}]	5	2026-02-01 17:57:07.328885+01	2026-02-01 17:57:07.328885+01
8	Mobile UX Enhancement	storeImprovement	Mobile	["New Store", "Growing", "Scaling"]	Mobile-first fixes so thumb-friendly navigation, forms, and checkout work on every device.	["Poor mobile conversion", "Hard-to-tap buttons", "Forms that frustrate"]	["Better mobile conversion", "Fewer bounces", "Improved mobile scores"]	5	10	4.6	690	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Mobile audit", "Key page fixes (5)"], "deliveryDays": 5}, {"name": "Standard", "price": 549, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full mobile UX", "Navigation + forms", "Checkout mobile tweaks"], "deliveryDays": 7}, {"name": "Premium", "price": 949, "support": "Priority", "revisions": 3, "deliverables": ["Full mobile overhaul", "PWA considerations", "Testing report"], "deliveryDays": 10}]	6	2026-02-01 17:57:07.329941+01	2026-02-01 17:57:07.329941+01
9	Collection & Navigation Restructure	storeImprovement	Collections	["New Store", "Growing", "Scaling"]	Logical collections, filters, and navigation so customers find products quickly.	["Confusing menus", "Too many or messy collections", "Poor filters"]	["Easier discovery", "Higher collection conversion", "Better SEO"]	5	10	4.5	480	[{"name": "Basic", "price": 279, "support": "Email", "revisions": 1, "deliverables": ["Navigation audit", "Collection structure plan", "Up to 15 collections"], "deliveryDays": 5}, {"name": "Standard", "price": 529, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + filter setup", "Menu optimization", "Breadcrumbs"], "deliveryDays": 7}, {"name": "Premium", "price": 849, "support": "Priority", "revisions": 3, "deliverables": ["Full restructure", "Custom filters", "Redirect map"], "deliveryDays": 10}]	7	2026-02-01 17:57:07.331493+01	2026-02-01 17:57:07.331493+01
10	Analytics & Tracking Setup	storeImprovement	Analytics	["New Store", "Growing", "Scaling"]	Conversion tracking, GA4, and dashboards so you know what drives sales.	["No conversion tracking", "Missing or broken pixels", "Can't attribute sales"]	["Accurate attribution", "ROI visibility", "Data-driven decisions"]	3	7	4.7	730	[{"name": "Basic", "price": 199, "support": "Email", "revisions": 1, "deliverables": ["GA4 + Shopify connection", "Purchase event", "Basic dashboard"], "deliveryDays": 3}, {"name": "Standard", "price": 399, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + Meta/Google pixels", "Custom events", "Conversion goals"], "deliveryDays": 5}, {"name": "Premium", "price": 699, "support": "Priority", "revisions": 3, "deliverables": ["Full tracking + UTM strategy", "Attribution report", "Ongoing check"], "deliveryDays": 7}]	8	2026-02-01 17:57:07.334563+01	2026-02-01 17:57:07.334563+01
11	Checkout & Payment Optimization	storeImprovement	Checkout	["Growing", "Scaling"]	Reduce checkout friction, offer the right payment options, and recover more completed orders.	["High checkout abandonment", "Limited payment methods", "Confusing checkout"]	["Higher completion rate", "Fewer drop-offs", "Better payment mix"]	5	10	4.6	580	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Checkout audit", "Field & step optimization"], "deliveryDays": 5}, {"name": "Standard", "price": 549, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + payment options", "Trust at checkout", "Upsells"], "deliveryDays": 7}, {"name": "Premium", "price": 899, "support": "Priority", "revisions": 3, "deliverables": ["Full checkout CRO", "A/B test setup", "Recovery flow"], "deliveryDays": 10}]	9	2026-02-01 17:57:07.335599+01	2026-02-01 17:57:07.335599+01
12	App Cleanup & Performance	storeImprovement	Apps	["Growing", "Scaling"]	Audit and remove or replace heavy apps so your store stays fast and maintainable.	["Too many apps", "Slow or conflicting apps", "Unclear impact"]	["Faster store", "Lower app spend", "Fewer conflicts"]	3	7	4.5	410	[{"name": "Basic", "price": 179, "support": "Email", "revisions": 1, "deliverables": ["App audit report", "Recommendations"], "deliveryDays": 3}, {"name": "Standard", "price": 349, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Basic + removal/migration", "Speed before/after"], "deliveryDays": 5}, {"name": "Premium", "price": 599, "support": "Priority", "revisions": 3, "deliverables": ["Full cleanup", "Alternative app list", "1-month check"], "deliveryDays": 7}]	10	2026-02-01 17:57:07.336787+01	2026-02-01 17:57:07.336787+01
13	Store Audit & Revenue Leak Fix	storeImprovement	Audit	["New Store", "Growing", "Scaling"]	Full store review to find where you're losing sales and fix the highest-impact issues.	["Revenue leaking", "No clear roadmap", "Too many unknowns"]	["Prioritized action list", "Revenue impact estimate", "Done-for-you fixes"]	7	14	4.8	620	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Audit report", "Top 5 fixes", "Implementation guide"], "deliveryDays": 7}, {"name": "Standard", "price": 649, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full audit", "We fix top 5", "1 follow-up call"], "deliveryDays": 10}, {"name": "Premium", "price": 1099, "support": "Priority + 2 calls", "revisions": 3, "deliverables": ["Full audit + fixes", "Ongoing 30-day support", "Revenue tracking setup"], "deliveryDays": 14}]	11	2026-02-01 17:57:07.338159+01	2026-02-01 17:57:07.338159+01
14	Ads Tracking & ROAS Setup	salesGrowth	Ads	["Growing", "Scaling"]	Meta, Google, and TikTok conversion tracking so you know exactly what drives sales.	["Can't track ad ROI", "Broken or missing pixels", "Wrong attribution"]	["True ROAS visibility", "Optimized ad spend", "Scalable campaigns"]	3	7	4.7	550	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["Meta Pixel + CAPI", "Purchase event"], "deliveryDays": 3}, {"name": "Standard", "price": 449, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Meta + Google Ads", "Conversion value", "Basic dashboard"], "deliveryDays": 5}, {"name": "Premium", "price": 749, "support": "Priority", "revisions": 3, "deliverables": ["All channels + TikTok", "Server-side where needed", "Attribution report"], "deliveryDays": 7}]	12	2026-02-01 17:57:07.33988+01	2026-02-01 17:57:07.33988+01
15	Product Page CRO	salesGrowth	CRO	["Growing", "Scaling"]	High-converting product page structure, copy, and CTAs to increase add-to-cart.	["Low ATC rate", "Weak product copy", "No clear CTAs"]	["Higher ATC", "Clear value prop", "Fewer bounces"]	5	10	4.6	610	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	13	2026-02-01 17:57:07.341187+01	2026-02-01 17:57:07.341187+01
16	Collection Page SEO	salesGrowth	SEO	["New Store", "Growing", "Scaling"]	Optimize collection pages for search and conversion with meta, filters, and structure.	["Collections not ranking", "Poor filters", "Thin content"]	["Better category rankings", "Improved discovery", "Higher collection conversion"]	5	8	4.5	480	[{"name": "Basic", "price": 279, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 502, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 781, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	14	2026-02-01 17:57:07.342671+01	2026-02-01 17:57:07.342671+01
17	Abandoned Cart Flow	salesGrowth	Email	["Growing", "Scaling"]	3–5 email abandoned cart sequence with timing and copy tuned for recovery.	["No cart recovery", "Generic emails", "Low open rates"]	["Recover 10–15% carts", "Set-and-forget", "Measurable revenue"]	4	7	4.7	720	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 538, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 837, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	15	2026-02-01 17:57:07.343877+01	2026-02-01 17:57:07.343877+01
18	Review & UGC Setup	salesGrowth	Trust	["New Store", "Growing", "Scaling"]	Review app setup, display widgets, and UGC strategy to build social proof.	["No reviews", "Low trust", "No UGC"]	["More reviews", "Trust at checkout", "UGC gallery"]	3	6	4.6	590	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 448, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 5}, {"name": "Premium", "price": 697, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 6}]	16	2026-02-01 17:57:07.344884+01	2026-02-01 17:57:07.344884+01
19	Homepage Conversion	salesGrowth	CRO	["New Store", "Growing", "Scaling"]	Hero, sections, and CTAs on your homepage tuned for first-time visitors.	["Weak homepage", "No clear CTA", "High bounce"]	["Clear value prop", "Strong CTA", "Lower bounce"]	5	9	4.7	530	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 9}]	17	2026-02-01 17:57:07.345891+01	2026-02-01 17:57:07.345891+01
20	Google Shopping Feed	salesGrowth	SEO	["Growing", "Scaling"]	Product feed setup and optimization for Google Merchant Center and Shopping ads.	["Feed errors", "Missing products", "Poor performance"]	["Clean feed", "More product visibility", "Shopping ready"]	5	10	4.6	440	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 718, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1117, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	18	2026-02-01 17:57:07.347227+01	2026-02-01 17:57:07.347227+01
21	Post-Purchase Email	salesGrowth	Email	["Growing", "Scaling"]	Thank-you, cross-sell, and review request emails after purchase.	["No post-purchase flow", "Missed upsells", "Few reviews"]	["Upsell revenue", "More reviews", "Automated flow"]	4	7	4.7	510	[{"name": "Basic", "price": 279, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 502, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 781, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	19	2026-02-01 17:57:07.348859+01	2026-02-01 17:57:07.348859+01
22	Landing Page Build	salesGrowth	CRO	["New Store", "Growing", "Scaling"]	High-converting landing pages for campaigns, launches, or key products.	["No dedicated landing pages", "Generic pages", "Low conversion"]	["Campaign-ready pages", "Focused messaging", "Higher conversion"]	5	10	4.8	380	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 808, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1257, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	20	2026-02-01 17:57:07.349958+01	2026-02-01 17:57:07.349958+01
23	Meta CAPI & Pixels	salesGrowth	Ads	["Growing", "Scaling"]	Meta Conversions API and pixel setup for accurate attribution and better ROAS.	["Broken pixel", "No CAPI", "Wrong attribution"]	["Better attribution", "Improved ROAS", "Fewer iOS issues"]	3	5	4.7	620	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 538, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 837, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	21	2026-02-01 17:57:07.350884+01	2026-02-01 17:57:07.350884+01
24	Core Web Vitals Fix	storeImprovement	Speed	["New Store", "Growing", "Scaling"]	Target LCP, FID, CLS improvements so your store passes Core Web Vitals.	["Failing CWV", "Slow LCP", "Layout shift"]	["Passing scores", "Faster perceived load", "Better SEO"]	5	10	4.6	680	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	22	2026-02-01 17:57:07.351877+01	2026-02-01 17:57:07.351877+01
25	Theme Performance	storeImprovement	Speed	["Growing", "Scaling"]	Theme code and asset optimization without changing design.	["Heavy theme", "Slow pages", "Too many requests"]	["Lighter theme", "Faster load", "Same look"]	5	9	4.7	490	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 808, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 1257, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 9}]	23	2026-02-01 17:57:07.352758+01	2026-02-01 17:57:07.352758+01
26	Mobile Navigation	storeImprovement	Mobile	["New Store", "Growing", "Scaling"]	Mobile menu, filters, and navigation tuned for thumb reach and clarity.	["Confusing mobile nav", "Hard to find products", "Poor filters"]	["Clear mobile nav", "Easy discovery", "Better mobile UX"]	4	7	4.6	560	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 538, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 837, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	24	2026-02-01 17:57:07.354363+01	2026-02-01 17:57:07.354363+01
27	Checkout Extensibility	storeImprovement	Checkout	["Scaling"]	Checkout UI extensions and customizations within Shopify limits.	["Generic checkout", "No branding", "Missing trust"]	["Branded checkout", "Trust elements", "Smooth flow"]	5	10	4.7	410	[{"name": "Basic", "price": 499, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 898, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1397, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	25	2026-02-01 17:57:07.355552+01	2026-02-01 17:57:07.355552+01
28	Inventory & Variants	storeImprovement	Collections	["New Store", "Growing", "Scaling"]	Variant structure, inventory display, and low-stock messaging.	["Confusing variants", "No stock cues", "Poor UX"]	["Clear variants", "Stock transparency", "Fewer support asks"]	4	8	4.5	470	[{"name": "Basic", "price": 279, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 502, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 781, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	26	2026-02-01 17:57:07.356829+01	2026-02-01 17:57:07.356829+01
29	Blog SEO & Structure	salesGrowth	SEO	["Growing", "Scaling"]	Blog SEO, internal linking, and content structure for organic traffic.	["Blog not ranking", "No internal links", "Thin content"]	["Blog visibility", "Internal link strategy", "Traffic growth"]	6	12	4.6	390	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 6}, {"name": "Standard", "price": 718, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 9}, {"name": "Premium", "price": 1117, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 12}]	27	2026-02-01 17:57:07.357863+01	2026-02-01 17:57:07.357863+01
30	SMS Abandoned Cart	salesGrowth	Email	["Scaling"]	SMS abandoned cart flow with consent and timing best practices.	["No SMS recovery", "Missing channel", "Low recovery"]	["SMS recovery", "Multi-channel", "Higher recovery rate"]	5	8	4.7	340	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 718, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 1117, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	28	2026-02-01 17:57:07.358722+01	2026-02-01 17:57:07.358722+01
31	FAQ & Policy Pages	storeImprovement	Trust	["New Store", "Growing", "Scaling"]	FAQ section and policy pages (refund, shipping, privacy) for trust and SEO.	["No FAQ", "Missing policies", "Support overload"]	["Clear FAQ", "Compliant policies", "Fewer support tickets"]	3	5	4.5	720	[{"name": "Basic", "price": 179, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 322, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 501, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	29	2026-02-01 17:57:07.35948+01	2026-02-01 17:57:07.35948+01
32	Cart Drawer & UX	storeImprovement	CRO	["New Store", "Growing", "Scaling"]	Cart drawer or page UX, upsells, and free-shipping thresholds.	["Clunky cart", "No upsells", "No threshold messaging"]	["Smooth cart", "Upsell revenue", "Threshold clarity"]	4	7	4.7	550	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	30	2026-02-01 17:57:07.360434+01	2026-02-01 17:57:07.360434+01
33	Google Analytics 4	storeImprovement	Analytics	["New Store", "Growing", "Scaling"]	GA4 property, events, and eCommerce reporting for Shopify.	["No GA4", "Missing events", "Can't track sales"]	["Full GA4 setup", "Purchase tracking", "Reporting dashboard"]	3	6	4.6	630	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 448, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 5}, {"name": "Premium", "price": 697, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 6}]	31	2026-02-01 17:57:07.361535+01	2026-02-01 17:57:07.361535+01
34	Discount & Promo	salesGrowth	CRO	["Growing", "Scaling"]	Discount strategy, promo bars, and urgency elements without hurting margin.	["No promo strategy", "Weak urgency", "Over-discounting"]	["Clear promos", "Urgency that converts", "Margin-safe tactics"]	4	7	4.6	460	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 538, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 837, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	32	2026-02-01 17:57:07.362603+01	2026-02-01 17:57:07.362603+01
35	Product Recommendations	storeImprovement	CRO	["Growing", "Scaling"]	Related products, recently viewed, and recommendation logic to increase AOV.	["No recommendations", "Low AOV", "Generic suggestions"]	["Smart recommendations", "Higher AOV", "Personalized feel"]	4	8	4.7	520	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	33	2026-02-01 17:57:07.363668+01	2026-02-01 17:57:07.363668+01
36	Redirects & 404	storeImprovement	SEO	["New Store", "Growing", "Scaling"]	Redirect map, 404 page, and broken link fix for SEO and UX.	["Broken links", "Poor 404", "Lost link equity"]	["Clean redirects", "Friendly 404", "Preserved SEO"]	3	6	4.5	510	[{"name": "Basic", "price": 229, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 412, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 5}, {"name": "Premium", "price": 641, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 6}]	34	2026-02-01 17:57:07.364733+01	2026-02-01 17:57:07.364733+01
37	Multi-Currency & Geo	storeImprovement	Checkout	["Scaling"]	Markets, currencies, and local payment options for international sales.	["Single currency", "No geo options", "Lost international"]	["Multi-currency", "Geo-tailored", "More international sales"]	5	10	4.7	370	[{"name": "Basic", "price": 549, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 988, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1537, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	35	2026-02-01 17:57:07.365628+01	2026-02-01 17:57:07.365628+01
38	Subscription Setup	salesGrowth	CRO	["Growing", "Scaling"]	Subscription or recurring offer setup with app and UX guidance.	["No subscription option", "Manual recurring", "Missed LTV"]	["Recurring revenue", "App + UX guidance", "LTV growth"]	6	12	4.6	420	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 6}, {"name": "Standard", "price": 1078, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 9}, {"name": "Premium", "price": 1677, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 12}]	36	2026-02-01 17:57:07.366269+01	2026-02-01 17:57:07.366269+01
39	Product Video	storeImprovement	Copy	["New Store", "Growing", "Scaling"]	Product video placement, thumbnails, and short-form video strategy.	["No video", "Low engagement", "Weak product story"]	["Video on product pages", "Higher engagement", "Clear product story"]	5	10	4.6	450	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 718, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1117, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	37	2026-02-01 17:57:07.366848+01	2026-02-01 17:57:07.366848+01
40	Competitor Benchmark	storeImprovement	Audit	["Growing", "Scaling"]	Competitor UX, pricing, and offer audit with actionable takeaways.	["No competitor view", "Blind spots", "Copycat risk"]	["Competitor insights", "Differentiation ideas", "Positioning clarity"]	5	8	4.7	380	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	38	2026-02-01 17:57:07.36745+01	2026-02-01 17:57:07.36745+01
41	Security & Compliance	storeImprovement	Trust	["New Store", "Growing", "Scaling"]	SSL, policies, and basic compliance check for a secure, trustworthy store.	["Security concerns", "Missing compliance", "Customer doubt"]	["Secure store", "Compliant policies", "Trust signals"]	3	5	4.5	540	[{"name": "Basic", "price": 229, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 412, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 641, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	39	2026-02-01 17:57:07.368016+01	2026-02-01 17:57:07.368016+01
42	Wholesale / B2B	storeImprovement	Checkout	["Scaling"]	Wholesale or B2B pricing, login, and checkout flow setup.	["No B2B option", "Manual quotes", "Lost wholesale"]	["B2B channel", "Quote or net terms", "Streamlined wholesale"]	6	12	4.6	310	[{"name": "Basic", "price": 699, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 6}, {"name": "Standard", "price": 1258, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 9}, {"name": "Premium", "price": 1957, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 12}]	40	2026-02-01 17:57:07.368644+01	2026-02-01 17:57:07.368644+01
43	Gift Cards & Store Credit	storeImprovement	CRO	["Growing", "Scaling"]	Gift card and store credit setup for gifting and returns.	["No gift cards", "Manual credit", "Poor gifting UX"]	["Gift cards live", "Store credit", "Better gifting"]	4	7	4.5	490	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 538, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 837, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 7}]	41	2026-02-01 17:57:07.369248+01	2026-02-01 17:57:07.369248+01
44	Live Chat & Support	storeImprovement	Trust	["New Store", "Growing", "Scaling"]	Live chat or support widget setup and basic scripting for common questions.	["No live support", "Slow response", "Generic replies"]	["Live chat ready", "Faster support", "Scripted answers"]	3	5	4.6	580	[{"name": "Basic", "price": 199, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 358, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 557, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	42	2026-02-01 17:57:07.37063+01	2026-02-01 17:57:07.37063+01
45	Affiliate & Referral	salesGrowth	CRO	["Growing", "Scaling"]	Affiliate or referral program setup and tracking for word-of-mouth growth.	["No referral program", "Manual tracking", "Missed advocates"]	["Referral program", "Tracking in place", "Advocate growth"]	5	9	4.7	360	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 808, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 7}, {"name": "Premium", "price": 1257, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 9}]	43	2026-02-01 17:57:07.37197+01	2026-02-01 17:57:07.37197+01
46	Exit-Intent Popup	salesGrowth	CRO	["New Store", "Growing", "Scaling"]	Exit-intent popup with offer or email capture to recover abandoning visitors.	["No exit capture", "Lost leads", "No last-chance offer"]	["Exit capture", "Lead recovery", "Discount or lead magnet"]	3	5	4.6	610	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 448, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 697, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	44	2026-02-01 17:57:07.372895+01	2026-02-01 17:57:07.372895+01
47	Product Bundles	storeImprovement	CRO	["Growing", "Scaling"]	Bundle logic, display, and discount rules to increase AOV.	["No bundles", "Low AOV", "Manual bundling"]	["Bundles live", "Higher AOV", "Clear bundle UX"]	4	8	4.7	480	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 4}, {"name": "Standard", "price": 718, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 6}, {"name": "Premium", "price": 1117, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 8}]	45	2026-02-01 17:57:07.373976+01	2026-02-01 17:57:07.373976+01
48	Pre-Launch Checklist	storeImprovement	Audit	["New Store"]	Pre-launch audit: SEO, speed, checkout, policies, and go-live checklist.	["Not launch-ready", "Missing basics", "Rushed launch"]	["Launch-ready list", "All basics covered", "Confident launch"]	3	5	4.8	430	[{"name": "Basic", "price": 279, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 502, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 781, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	46	2026-02-01 17:57:07.375095+01	2026-02-01 17:57:07.375095+01
49	Post-Launch Fix	storeImprovement	Audit	["New Store"]	Post-launch review and fix of top issues in the first 2 weeks.	["Bugs after launch", "Broken flows", "Poor first impression"]	["Quick fixes", "Stable store", "Better first impression"]	3	5	4.7	390	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 3}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 4}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 5}]	47	2026-02-01 17:57:07.376294+01	2026-02-01 17:57:07.376294+01
50	Theme Customization	storeImprovement	CRO	["New Store", "Growing", "Scaling"]	Theme tweaks and custom sections to match brand and conversion goals.	["Generic theme", "Wrong layout", "Missing sections"]	["Custom look", "On-brand", "Conversion-focused sections"]	5	10	4.6	570	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 808, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 1257, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	48	2026-02-01 17:57:07.377362+01	2026-02-01 17:57:07.377362+01
51	Full Funnel Review	storeImprovement	Audit	["Scaling"]	End-to-end funnel review from traffic to checkout with prioritized fixes.	["Funnel leaks", "No clear funnel", "Optimization blind"]	["Full funnel map", "Prioritized fixes", "Revenue impact view"]	7	14	4.8	440	[{"name": "Basic", "price": 649, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 7}, {"name": "Standard", "price": 1168, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 11}, {"name": "Premium", "price": 1817, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 14}]	49	2026-02-01 17:57:07.378175+01	2026-02-01 17:57:07.378175+01
52	Homepage Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Custom homepage layout, hero, sections, and visual hierarchy built for your brand and conversions.	["Generic homepage", "Weak first impression", "No clear story"]	["On-brand homepage", "Strong hero & CTAs", "Conversion-focused layout"]	7	14	4.8	520	[{"name": "Basic", "price": 499, "support": "Email", "revisions": 1, "deliverables": ["Hero + 3 sections", "Mobile-responsive", "1 round revisions"], "deliveryDays": 7}, {"name": "Standard", "price": 899, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full homepage (6–8 sections)", "Custom sections", "2 rounds revisions"], "deliveryDays": 10}, {"name": "Premium", "price": 1499, "support": "Priority", "revisions": 3, "deliverables": ["Full homepage + animations", "A/B-ready variants", "3 rounds + handoff"], "deliveryDays": 14}]	50	2026-02-01 17:57:07.378972+01	2026-02-01 17:57:07.378972+01
53	Product Page Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Product page layout, gallery, copy blocks, and trust elements designed for higher add-to-cart.	["Weak product layout", "Poor gallery", "No trust elements"]	["Conversion-optimized layout", "Clear product story", "Trust & social proof"]	5	12	4.7	610	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["1 template design", "Gallery + blocks", "1 round revisions"], "deliveryDays": 5}, {"name": "Standard", "price": 749, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Template + 2 variants", "Upsell/cross-sell blocks", "2 rounds revisions"], "deliveryDays": 8}, {"name": "Premium", "price": 1199, "support": "Priority", "revisions": 3, "deliverables": ["Full product page system", "Dynamic sections", "3 rounds + implementation"], "deliveryDays": 12}]	51	2026-02-01 17:57:07.379708+01	2026-02-01 17:57:07.379708+01
54	Collection Page Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Collection page layout, filters, grid, and merchandising blocks for discovery and conversion.	["Messy collection pages", "Poor filters", "Weak merchandising"]	["Clear collection layout", "Easy filtering", "Better product discovery"]	5	10	4.6	480	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Collection template design", "Filter UI", "1 round revisions"], "deliveryDays": 5}, {"name": "Standard", "price": 649, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Template + featured/quick view", "Merchandising blocks", "2 rounds revisions"], "deliveryDays": 7}, {"name": "Premium", "price": 999, "support": "Priority", "revisions": 3, "deliverables": ["Full collection system", "Custom filters & sort", "3 rounds + implementation"], "deliveryDays": 10}]	52	2026-02-01 17:57:07.380466+01	2026-02-01 17:57:07.380466+01
55	Full Store Design	storeImprovement	Design	["New Store", "Growing"]	End-to-end store design: homepage, product, collection, cart, and key pages with a consistent visual system.	["No design system", "Inconsistent pages", "Starting from scratch"]	["Cohesive store design", "Key pages designed", "Ready for development"]	14	28	4.8	390	[{"name": "Basic", "price": 1999, "support": "Email", "revisions": 2, "deliverables": ["Homepage + product + collection", "Style guide", "2 rounds"], "deliveryDays": 14}, {"name": "Standard", "price": 3499, "support": "Email + 2 calls", "revisions": 3, "deliverables": ["All key pages", "Design system", "3 rounds + handoff"], "deliveryDays": 21}, {"name": "Premium", "price": 5499, "support": "Priority", "revisions": 4, "deliverables": ["Full store + cart/checkout UI", "Component library", "4 rounds + implementation support"], "deliveryDays": 28}]	53	2026-02-01 17:57:07.381289+01	2026-02-01 17:57:07.381289+01
56	Landing Page Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Campaign-specific landing pages: launch, product drop, or promo with focused layout and CTA.	["No campaign pages", "Generic layout", "Weak CTA"]	["Campaign-ready pages", "Focused messaging", "Higher conversion"]	4	10	4.7	440	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["1 landing page design", "Mobile-responsive", "1 round"], "deliveryDays": 4}, {"name": "Standard", "price": 549, "support": "Email + 1 call", "revisions": 2, "deliverables": ["2 landing pages", "A/B variants", "2 rounds"], "deliveryDays": 7}, {"name": "Premium", "price": 899, "support": "Priority", "revisions": 3, "deliverables": ["3+ pages", "Template system", "3 rounds + build"], "deliveryDays": 10}]	54	2026-02-01 17:57:07.38186+01	2026-02-01 17:57:07.38186+01
57	About & Story Page Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	About us, brand story, and values page design to build trust and connection with customers.	["No about page", "Generic story", "Low trust"]	["Compelling brand story", "Trust-building layout", "On-brand narrative"]	4	8	4.6	370	[{"name": "Basic", "price": 249, "support": "Email", "revisions": 1, "deliverables": ["About page design", "Story + team blocks", "1 round"], "deliveryDays": 4}, {"name": "Standard", "price": 449, "support": "Email + 1 call", "revisions": 2, "deliverables": ["About + values/mission", "Custom sections", "2 rounds"], "deliveryDays": 6}, {"name": "Premium", "price": 699, "support": "Priority", "revisions": 3, "deliverables": ["Full brand story section", "Video/image integration", "3 rounds"], "deliveryDays": 8}]	55	2026-02-01 17:57:07.38238+01	2026-02-01 17:57:07.38238+01
58	Store Redesign	storeImprovement	Redesign	["Growing", "Scaling"]	Full visual and UX redesign of your store: new look, improved flow, and conversion-focused layout.	["Outdated look", "Poor UX", "Low conversion"]	["Fresh, modern store", "Improved UX", "Higher conversion potential"]	21	42	4.8	340	[{"name": "Basic", "price": 2999, "support": "Email", "revisions": 2, "deliverables": ["Homepage + key pages redesign", "Style refresh", "2 rounds"], "deliveryDays": 21}, {"name": "Standard", "price": 5499, "support": "Email + 2 calls", "revisions": 3, "deliverables": ["Full store redesign", "New design system", "3 rounds + build support"], "deliveryDays": 35}, {"name": "Premium", "price": 8999, "support": "Priority", "revisions": 4, "deliverables": ["Full redesign + implementation", "Theme customization", "4 rounds + QA"], "deliveryDays": 42}]	56	2026-02-01 17:57:07.38294+01	2026-02-01 17:57:07.38294+01
59	Theme Redesign	storeImprovement	Redesign	["New Store", "Growing", "Scaling"]	Keep your theme, get a full visual refresh: colors, typography, sections, and components.	["Same theme, tired look", "Inconsistent styling", "No design system"]	["Refreshed look", "Consistent styling", "No theme migration"]	10	21	4.7	460	[{"name": "Basic", "price": 1299, "support": "Email", "revisions": 2, "deliverables": ["Color + font refresh", "Homepage sections", "2 rounds"], "deliveryDays": 10}, {"name": "Standard", "price": 2299, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Full visual refresh", "All key pages", "3 rounds"], "deliveryDays": 14}, {"name": "Premium", "price": 3699, "support": "Priority", "revisions": 4, "deliverables": ["Refresh + new sections", "Component library", "4 rounds + handoff"], "deliveryDays": 21}]	57	2026-02-01 17:57:07.383469+01	2026-02-01 17:57:07.383469+01
60	Homepage Redesign	storeImprovement	Redesign	["New Store", "Growing", "Scaling"]	Homepage-only redesign: new hero, sections, and layout without touching the rest of the store.	["Weak homepage", "Old hero", "No clear CTA"]	["Strong new homepage", "Clear narrative", "Conversion-focused"]	7	14	4.7	530	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 2, "deliverables": ["New hero + 3 sections", "Mobile-responsive", "2 rounds"], "deliveryDays": 7}, {"name": "Standard", "price": 1099, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Full homepage redesign", "6–8 sections", "3 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1799, "support": "Priority", "revisions": 4, "deliverables": ["Redesign + animations", "A/B-ready", "4 rounds + build"], "deliveryDays": 14}]	58	2026-02-01 17:57:07.383991+01	2026-02-01 17:57:07.383991+01
61	Visual Refresh	storeImprovement	Redesign	["Growing", "Scaling"]	Light-touch refresh: updated colors, typography, and key UI elements without a full redesign.	["Dated colors/fonts", "Inconsistent UI", "Needs polish"]	["Modern look", "Consistent UI", "Quick win"]	5	10	4.6	510	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Color palette + fonts", "Button/CTA refresh", "1 round"], "deliveryDays": 5}, {"name": "Standard", "price": 699, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full visual refresh", "Header/footer + key UI", "2 rounds"], "deliveryDays": 7}, {"name": "Premium", "price": 1099, "support": "Priority", "revisions": 3, "deliverables": ["Refresh + icon set", "All global components", "3 rounds"], "deliveryDays": 10}]	59	2026-02-01 17:57:07.384499+01	2026-02-01 17:57:07.384499+01
62	Brand Identity for Ecommerce	storeImprovement	Branding	["New Store", "Growing"]	Logo, color palette, typography, and visual identity built for your ecommerce brand and store.	["No clear brand", "Generic look", "Inconsistent visuals"]	["Cohesive brand identity", "Logo & system", "Ready for store"]	10	21	4.8	480	[{"name": "Basic", "price": 799, "support": "Email", "revisions": 2, "deliverables": ["Logo (1 concept)", "Color palette", "Typography"], "deliveryDays": 10}, {"name": "Standard", "price": 1499, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Logo (2 concepts)", "Full identity", "Brand board"], "deliveryDays": 14}, {"name": "Premium", "price": 2499, "support": "Priority", "revisions": 4, "deliverables": ["Full identity + applications", "Social templates", "4 rounds + guidelines"], "deliveryDays": 21}]	60	2026-02-01 17:57:07.385001+01	2026-02-01 17:57:07.385001+01
63	Logo & Visual Identity	storeImprovement	Branding	["New Store", "Growing", "Scaling"]	Logo design and core visual identity (mark, lockup, clear space) for your store and marketing.	["No logo", "Weak logo", "No lockups"]	["Professional logo", "Versatile lockups", "Clear usage"]	7	14	4.7	620	[{"name": "Basic", "price": 499, "support": "Email", "revisions": 2, "deliverables": ["Logo (1 concept)", "Primary + reverse"], "deliveryDays": 7}, {"name": "Standard", "price": 899, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Logo (2 concepts)", "Lockups + favicon"], "deliveryDays": 10}, {"name": "Premium", "price": 1399, "support": "Priority", "revisions": 4, "deliverables": ["Logo + submarks", "Full file set", "4 rounds"], "deliveryDays": 14}]	61	2026-02-01 17:57:07.385492+01	2026-02-01 17:57:07.385492+01
64	Brand Guidelines	storeImprovement	Branding	["Growing", "Scaling"]	Brand guidelines document: logo use, colors, typography, tone, and examples for store and marketing.	["No guidelines", "Inconsistent use", "Team confusion"]	["Clear brand rules", "Consistent execution", "Handoff-ready"]	7	14	4.7	390	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Logo + color + font rules", "PDF guide"], "deliveryDays": 7}, {"name": "Standard", "price": 699, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full guidelines", "Tone & voice", "2 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1099, "support": "Priority", "revisions": 3, "deliverables": ["Guidelines + templates", "Do's and don'ts", "3 rounds"], "deliveryDays": 14}]	62	2026-02-01 17:57:07.386193+01	2026-02-01 17:57:07.386193+01
65	Ecommerce Brand Strategy	storeImprovement	Branding	["New Store", "Growing"]	Brand positioning, audience, and messaging strategy tailored for your ecommerce store and growth.	["No clear positioning", "Wrong audience", "Weak messaging"]	["Clear positioning", "Audience clarity", "Messaging framework"]	10	18	4.8	350	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 1, "deliverables": ["Positioning statement", "Audience profile", "Key messages"], "deliveryDays": 10}, {"name": "Standard", "price": 1099, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full brand strategy", "Messaging hierarchy", "2 rounds"], "deliveryDays": 14}, {"name": "Premium", "price": 1799, "support": "Priority", "revisions": 3, "deliverables": ["Strategy + creative brief", "Tone & voice guide", "3 rounds + workshop"], "deliveryDays": 18}]	63	2026-02-01 17:57:07.387758+01	2026-02-01 17:57:07.387758+01
66	Color & Typography System	storeImprovement	Branding	["New Store", "Growing", "Scaling"]	Brand-aligned color palette and typography system for your store and marketing materials.	["Wrong colors", "Too many fonts", "No system"]	["Cohesive palette", "Clear type scale", "Store-ready"]	4	8	4.6	470	[{"name": "Basic", "price": 299, "support": "Email", "revisions": 1, "deliverables": ["Color palette (6–8)", "2 font pairings"], "deliveryDays": 4}, {"name": "Standard", "price": 549, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full palette + usage", "Type scale", "2 rounds"], "deliveryDays": 6}, {"name": "Premium", "price": 849, "support": "Priority", "revisions": 3, "deliverables": ["System + CSS variables", "Dark/light variants", "3 rounds"], "deliveryDays": 8}]	64	2026-02-01 17:57:07.388908+01	2026-02-01 17:57:07.388908+01
67	Packaging & Unboxing Design	storeImprovement	Branding	["Growing", "Scaling"]	Packaging, unboxing experience, and insert design so every delivery reinforces your brand.	["Plain packaging", "No unboxing experience", "Generic inserts"]	["Memorable unboxing", "On-brand packaging", "Shareable experience"]	10	21	4.7	320	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 2, "deliverables": ["Box design", "1 insert"], "deliveryDays": 10}, {"name": "Standard", "price": 1099, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Box + 2 inserts", "Sticker/seal"], "deliveryDays": 14}, {"name": "Premium", "price": 1799, "support": "Priority", "revisions": 4, "deliverables": ["Full unboxing kit", "Tissue/branded fill", "4 rounds + print specs"], "deliveryDays": 21}]	65	2026-02-01 17:57:07.389934+01	2026-02-01 17:57:07.389934+01
68	Social & Ad Creative	storeImprovement	Branding	["New Store", "Growing", "Scaling"]	On-brand social and ad creative: templates, formats, and guidelines for Meta, Instagram, and more.	["Inconsistent creative", "No ad templates", "Off-brand ads"]	["Consistent creative", "Ad-ready templates", "Clear guidelines"]	7	14	4.6	540	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["5 ad templates", "Sizes: feed + story"], "deliveryDays": 7}, {"name": "Standard", "price": 749, "support": "Email + 1 call", "revisions": 2, "deliverables": ["10 templates", "All key sizes", "2 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1199, "support": "Priority", "revisions": 3, "deliverables": ["Template system", "Creative guidelines", "3 rounds + handoff"], "deliveryDays": 14}]	66	2026-02-01 17:57:07.39103+01	2026-02-01 17:57:07.39103+01
69	Cart & Checkout UI Design	storeImprovement	Design	["Growing", "Scaling"]	Cart and checkout UI design: layout, trust elements, and flow within Shopify's extensibility.	["Generic cart", "Weak checkout UI", "No trust elements"]	["Branded cart/checkout", "Trust at payment", "Smooth flow"]	7	14	4.7	410	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 2, "deliverables": ["Cart UI design", "Checkout extension concepts"], "deliveryDays": 7}, {"name": "Standard", "price": 849, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Cart + checkout UI", "Trust block designs", "3 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1299, "support": "Priority", "revisions": 4, "deliverables": ["Full flow design", "Implementation specs", "4 rounds"], "deliveryDays": 14}]	67	2026-02-01 17:57:07.392023+01	2026-02-01 17:57:07.392023+01
70	Meta Ads Management	salesGrowth	Ads	["Growing", "Scaling"]	Ongoing Meta & Instagram ad campaign management: targeting, creative, and ROAS optimization.	["Low ROAS", "Wasted spend", "No strategy"]	["Optimized spend", "Better ROAS", "Scalable campaigns"]	14	30	4.7	580	[{"name": "Basic", "price": 799, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1438, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 22}, {"name": "Premium", "price": 2237, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 30}]	68	2026-02-01 17:57:07.393332+01	2026-02-01 17:57:07.393332+01
71	Google Ads Management	salesGrowth	Ads	["Growing", "Scaling"]	Google Search, Shopping, and Performance Max campaign management for ecommerce.	["Poor search visibility", "Wasted budget", "No Shopping strategy"]	["Search + Shopping growth", "Efficient spend", "Attribution clarity"]	14	30	4.7	520	[{"name": "Basic", "price": 799, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1438, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 22}, {"name": "Premium", "price": 2237, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 30}]	69	2026-02-01 17:57:07.394739+01	2026-02-01 17:57:07.394739+01
72	TikTok Ads Management	salesGrowth	Ads	["Growing", "Scaling"]	TikTok ad campaign setup and management for product discovery and sales.	["No TikTok presence", "Unclear creative", "Low conversion"]	["TikTok traffic", "Native-style creative", "Conversion setup"]	14	28	4.6	410	[{"name": "Basic", "price": 699, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1258, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 21}, {"name": "Premium", "price": 1957, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 28}]	70	2026-02-01 17:57:07.39575+01	2026-02-01 17:57:07.39575+01
73	Social Media Management	salesGrowth	Social Media	["New Store", "Growing", "Scaling"]	Organic social management: content calendar, posting, and community for Instagram, Facebook, TikTok.	["No consistent posting", "No content plan", "Low engagement"]	["Consistent presence", "Content calendar", "Engagement growth"]	14	30	4.7	640	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1078, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 22}, {"name": "Premium", "price": 1677, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 30}]	71	2026-02-01 17:57:07.396615+01	2026-02-01 17:57:07.396615+01
74	Instagram Growth & Content	salesGrowth	Social Media	["New Store", "Growing", "Scaling"]	Instagram content strategy, Reels, stories, and growth tactics for ecommerce brands.	["Slow growth", "No Reels strategy", "Low reach"]	["Content strategy", "Reels plan", "Follower & reach growth"]	10	21	4.6	590	[{"name": "Basic", "price": 549, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 10}, {"name": "Standard", "price": 988, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 16}, {"name": "Premium", "price": 1537, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 21}]	72	2026-02-01 17:57:07.397397+01	2026-02-01 17:57:07.397397+01
75	Pinterest Ads & Management	salesGrowth	Ads	["Growing", "Scaling"]	Pinterest ad campaigns and organic pin strategy for discovery and traffic.	["No Pinterest presence", "Missing discovery channel", "No ad strategy"]	["Pinterest traffic", "Pin strategy", "Shopping pins"]	10	21	4.6	380	[{"name": "Basic", "price": 549, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 10}, {"name": "Standard", "price": 988, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 16}, {"name": "Premium", "price": 1537, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 21}]	73	2026-02-01 17:57:07.398136+01	2026-02-01 17:57:07.398136+01
76	Retargeting Campaign Setup	salesGrowth	Ads	["Growing", "Scaling"]	Retargeting audiences and campaigns across Meta, Google, and TikTok to recover visitors.	["No retargeting", "Lost cart abandoners", "Wasted traffic"]	["Retargeting campaigns", "Audience setup", "Recovery revenue"]	7	14	4.7	510	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 7}, {"name": "Standard", "price": 808, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 11}, {"name": "Premium", "price": 1257, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 14}]	74	2026-02-01 17:57:07.398805+01	2026-02-01 17:57:07.398805+01
77	Ad Campaign Management	salesGrowth	Ads	["Growing", "Scaling"]	Full-funnel ad management: prospecting, retargeting, and creative testing.	["Scattered campaigns", "No testing", "Poor attribution"]	["Unified strategy", "Creative testing", "Clear ROAS"]	14	30	4.8	470	[{"name": "Basic", "price": 999, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1798, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 22}, {"name": "Premium", "price": 2797, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 30}]	75	2026-02-01 17:57:07.399478+01	2026-02-01 17:57:07.399478+01
78	Social Content Calendar	salesGrowth	Social Media	["New Store", "Growing", "Scaling"]	Monthly content calendar and captions for social channels aligned with product and promotions.	["No plan", "Last-minute posts", "Inconsistent voice"]	["Monthly calendar", "Captions ready", "On-brand content"]	5	10	4.6	530	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 5}, {"name": "Standard", "price": 628, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 8}, {"name": "Premium", "price": 977, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 10}]	76	2026-02-01 17:57:07.40132+01	2026-02-01 17:57:07.40132+01
79	Community & DMs Management	salesGrowth	Social Media	["Growing", "Scaling"]	Comment and DM response, community engagement, and basic crisis handling.	["Slow replies", "Missed DMs", "No community feel"]	["Faster response", "Engaged community", "Brand voice"]	14	30	4.6	440	[{"name": "Basic", "price": 499, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 898, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 22}, {"name": "Premium", "price": 1397, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 30}]	77	2026-02-01 17:57:07.402062+01	2026-02-01 17:57:07.402062+01
80	UGC & Influencer Campaigns	salesGrowth	Social Media	["Growing", "Scaling"]	UGC creator and influencer outreach, briefs, and campaign management for social proof.	["No UGC", "No influencer strategy", "Manual outreach"]	["UGC library", "Influencer partnerships", "Campaign management"]	14	28	4.7	390	[{"name": "Basic", "price": 699, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 14}, {"name": "Standard", "price": 1258, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 21}, {"name": "Premium", "price": 1957, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 28}]	78	2026-02-01 17:57:07.402918+01	2026-02-01 17:57:07.402918+01
81	Ad Creative Strategy	salesGrowth	Ads	["Growing", "Scaling"]	Ad creative strategy: formats, messaging, and testing plan for Meta, Google, TikTok.	["Weak creative", "No testing plan", "Ad fatigue"]	["Creative strategy", "Testing framework", "Refresh plan"]	7	14	4.7	420	[{"name": "Basic", "price": 499, "support": "Email", "revisions": 1, "deliverables": ["Core deliverables", "Email support"], "deliveryDays": 7}, {"name": "Standard", "price": 898, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Extended scope", "1 call included"], "deliveryDays": 11}, {"name": "Premium", "price": 1397, "support": "Priority", "revisions": 3, "deliverables": ["Full scope", "Priority support"], "deliveryDays": 14}]	79	2026-02-01 17:57:07.404583+01	2026-02-01 17:57:07.404583+01
82	Product Photography Direction	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Creative direction for product photography: shot list, styling, and art direction for on-brand imagery.	["Inconsistent product photos", "No art direction", "Weak visuals"]	["Cohesive product imagery", "Shot list & style guide", "On-brand photos"]	5	14	4.7	460	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["Shot list (20 products)", "Style guide", "1 round"], "deliveryDays": 5}, {"name": "Standard", "price": 749, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full direction (50 products)", "Styling notes", "2 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1199, "support": "Priority", "revisions": 3, "deliverables": ["Full direction + on-set support", "Unlimited products", "3 rounds"], "deliveryDays": 14}]	80	2026-02-01 17:57:07.405885+01	2026-02-01 17:57:07.405885+01
83	Product Mockup & Lifestyle Creative	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Product mockups, lifestyle scenes, and contextual creative for store and ads.	["Flat product shots only", "No lifestyle imagery", "Weak mockups"]	["Lifestyle & mockup creative", "Ad-ready assets", "Higher conversion"]	7	14	4.7	430	[{"name": "Basic", "price": 449, "support": "Email", "revisions": 1, "deliverables": ["10 mockups/lifestyle", "2 scenes", "1 round"], "deliveryDays": 7}, {"name": "Standard", "price": 849, "support": "Email + 1 call", "revisions": 2, "deliverables": ["25 assets", "4 scenes", "2 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1299, "support": "Priority", "revisions": 3, "deliverables": ["50+ assets", "Full scene set", "3 rounds"], "deliveryDays": 14}]	81	2026-02-01 17:57:07.406994+01	2026-02-01 17:57:07.406994+01
84	Ad Creative Design – Static	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Static ad creative for Meta, Google, and display: feed ads, stories, and banners.	["No ad creative", "Off-brand ads", "Low CTR"]	["On-brand ad creative", "Multiple formats", "Higher CTR potential"]	5	12	4.7	560	[{"name": "Basic", "price": 399, "support": "Email", "revisions": 1, "deliverables": ["5 ad creatives", "Feed + story sizes"], "deliveryDays": 5}, {"name": "Standard", "price": 749, "support": "Email + 1 call", "revisions": 2, "deliverables": ["15 creatives", "All key sizes", "2 rounds"], "deliveryDays": 8}, {"name": "Premium", "price": 1199, "support": "Priority", "revisions": 3, "deliverables": ["30 creatives", "A/B variants", "3 rounds"], "deliveryDays": 12}]	82	2026-02-01 17:57:07.408134+01	2026-02-01 17:57:07.408134+01
85	Video Ad Creative	storeImprovement	Design	["Growing", "Scaling"]	Short-form video ad creative for Meta, TikTok, and YouTube: hooks, product demos, and UGC-style.	["No video ads", "Weak hooks", "Low engagement"]	["Video ad creative", "Platform-optimized", "Higher engagement"]	7	14	4.7	480	[{"name": "Basic", "price": 599, "support": "Email", "revisions": 1, "deliverables": ["2 video ads (15–30s)", "Feed + story"], "deliveryDays": 7}, {"name": "Standard", "price": 1099, "support": "Email + 1 call", "revisions": 2, "deliverables": ["5 video ads", "Multiple lengths", "2 rounds"], "deliveryDays": 10}, {"name": "Premium", "price": 1799, "support": "Priority", "revisions": 3, "deliverables": ["10 video ads", "UGC-style + polished", "3 rounds"], "deliveryDays": 14}]	83	2026-02-01 17:57:07.409134+01	2026-02-01 17:57:07.409134+01
86	Carousel & Collection Ad Design	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Carousel and collection ad designs for product catalogs and themed campaigns.	["No carousel ads", "Weak product grids", "Low catalog engagement"]	["Carousel ad sets", "Catalog-style creative", "Higher engagement"]	5	10	4.6	390	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["3 carousel sets", "5 slides each"], "deliveryDays": 5}, {"name": "Standard", "price": 649, "support": "Email + 1 call", "revisions": 2, "deliverables": ["6 carousel sets", "Custom + template"], "deliveryDays": 7}, {"name": "Premium", "price": 999, "support": "Priority", "revisions": 3, "deliverables": ["10+ sets", "A/B variants", "3 rounds"], "deliveryDays": 10}]	84	2026-02-01 17:57:07.410196+01	2026-02-01 17:57:07.410196+01
87	Product Launch Creative	storeImprovement	Design	["New Store", "Growing", "Scaling"]	Full creative suite for product launch: store assets, social, and ads in one package.	["Scattered launch creative", "No cohesive look", "Last-minute assets"]	["Launch-ready creative", "Store + social + ads", "Cohesive campaign"]	10	18	4.8	350	[{"name": "Basic", "price": 799, "support": "Email", "revisions": 2, "deliverables": ["Product page assets", "5 social + ad creatives"], "deliveryDays": 10}, {"name": "Standard", "price": 1399, "support": "Email + 1 call", "revisions": 3, "deliverables": ["Full launch kit", "15+ assets", "3 rounds"], "deliveryDays": 14}, {"name": "Premium", "price": 2199, "support": "Priority", "revisions": 4, "deliverables": ["Launch kit + video", "Unlimited formats", "4 rounds"], "deliveryDays": 18}]	85	2026-02-01 17:57:07.411223+01	2026-02-01 17:57:07.411223+01
88	Display & Banner Ad Design	storeImprovement	Design	["Growing", "Scaling"]	Display and banner ad creative for Google Display, programmatic, and partner sites.	["No display creative", "Wrong sizes", "Low awareness"]	["Display ad set", "All standard sizes", "Retargeting-ready"]	5	10	4.6	410	[{"name": "Basic", "price": 349, "support": "Email", "revisions": 1, "deliverables": ["5 sizes", "Responsive + static"], "deliveryDays": 5}, {"name": "Standard", "price": 649, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full size set", "2 concepts", "2 rounds"], "deliveryDays": 7}, {"name": "Premium", "price": 999, "support": "Priority", "revisions": 3, "deliverables": ["Full set + animated", "A/B variants", "3 rounds"], "deliveryDays": 10}]	86	2026-02-01 17:57:07.412175+01	2026-02-01 17:57:07.412175+01
2	SEO Optimization	salesGrowth	SEO	["New Store", "Growing", "Scaling"]	off-page SEO, meta tags, collections & product optimization so search engines and buyers find you.	["Products not ranking", "Missing meta descriptions", "Poor collection structure"]	["Higher organic traffic", "Better product visibility", "Schema markup included"]	5	10	4.7	920	[{"name": "Basic", "price": 99, "support": "Email", "revisions": 1, "deliverables": ["On-page SEO audit", "Meta titles & descriptions (20 products)", "Basic schema"], "deliveryDays": 5}, {"name": "Standard", "price": 240, "support": "Email + 1 call", "revisions": 2, "deliverables": ["Full on-page + collection SEO", "Meta & schema for 100 products", "Sitemap optimization", "Internal linking"], "deliveryDays": 7}, {"name": "Premium", "price": 530, "support": "Priority email + 2 calls", "revisions": 3, "deliverables": ["Everything in Standard", "Blog/content SEO", "Unlimited products", "Ongoing recommendations"], "deliveryDays": 10}]	0	2026-02-01 17:57:07.321837+01	2026-02-01 23:40:52.007997+01
\.


--
-- Data for Name: store_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_reports (id, store_url, report_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.themes (id, name, price, features, image, sort_order, created_at, updated_at) FROM stdin;
43	hyu	99.00	[]		23	2026-02-01 17:52:31.755998+01	2026-02-01 17:52:31.755998+01
2	Zeal	80.00	["Mobile Optimized", "Speed Focused", "SEO Ready", "Lookbook Layouts"]	https://picsum.photos/seed/theme-1/400/300	0	2026-02-01 17:50:18.635946+01	2026-02-01 17:50:18.635946+01
3	Force	89.00	["Premium Design", "Speed Focused", "SEO Ready", "Lookbook Layouts"]	https://picsum.photos/seed/theme-2/400/300	1	2026-02-01 17:50:18.643096+01	2026-02-01 17:50:18.643096+01
5	Focal	100.00	["Speed Focused", "Mobile Optimized", "Premium Design", "Lookbook Layouts"]	https://picsum.photos/seed/theme-4/400/300	3	2026-02-01 17:50:18.644369+01	2026-02-01 17:50:18.644369+01
6	Broadcast	109.00	["Speed Focused", "SEO Ready", "Mobile Optimized", "Premium Design"]	https://picsum.photos/seed/theme-5/400/300	4	2026-02-01 17:50:18.644897+01	2026-02-01 17:50:18.644897+01
7	Ignite	119.00	["Lookbook Layouts", "SEO Ready", "Speed Focused", "Mobile Optimized"]	https://picsum.photos/seed/theme-6/400/300	5	2026-02-01 17:50:18.645477+01	2026-02-01 17:50:18.645477+01
8	Shapes	129.00	["Lookbook Layouts", "SEO Ready", "Quick View", "Speed Focused"]	https://picsum.photos/seed/theme-7/400/300	6	2026-02-01 17:50:18.646141+01	2026-02-01 17:50:18.646141+01
9	Xclusive	139.00	["Mega Menu", "Lookbook Layouts", "Quick View", "SEO Ready"]	https://picsum.photos/seed/theme-8/400/300	7	2026-02-01 17:50:18.646871+01	2026-02-01 17:50:18.646871+01
10	Enterprise	149.00	["Mega Menu", "Lookbook Layouts", "Quick View", "Product Filters"]	https://picsum.photos/seed/theme-9/400/300	8	2026-02-01 17:50:18.647481+01	2026-02-01 17:50:18.647481+01
11	Sleek	159.00	["Mega Menu", "Quick View", "Sticky Header", "Product Filters"]	https://picsum.photos/seed/theme-10/400/300	9	2026-02-01 17:50:18.647933+01	2026-02-01 17:50:18.647933+01
12	Release	169.00	["Mega Menu", "Quick View", "Sticky Header", "Product Filters"]	https://picsum.photos/seed/theme-11/400/300	10	2026-02-01 17:50:18.64834+01	2026-02-01 17:50:18.64834+01
13	Pipeline	179.00	["Countdown Timer", "Mega Menu", "Sticky Header", "Product Filters"]	https://picsum.photos/seed/theme-12/400/300	11	2026-02-01 17:50:18.648733+01	2026-02-01 17:50:18.648733+01
14	Concept	189.00	["Countdown Timer", "Product Filters", "Sticky Header", "Mega Menu"]	https://picsum.photos/seed/theme-13/400/300	12	2026-02-01 17:50:18.649326+01	2026-02-01 17:50:18.649326+01
15	Xtra	199.00	["Quick Order List", "Countdown Timer", "Sticky Header", "Product Filters"]	https://picsum.photos/seed/theme-14/400/300	13	2026-02-01 17:50:18.649918+01	2026-02-01 17:50:18.649918+01
16	Impulse	209.00	["Quick Order List", "Product Filters", "Countdown Timer", "Sticky Header"]	https://picsum.photos/seed/theme-15/400/300	14	2026-02-01 17:50:18.650515+01	2026-02-01 17:50:18.650515+01
17	Prestige	219.00	["Quick Order List", "Sticky Header", "Countdown Timer", "Color Swatches"]	https://picsum.photos/seed/theme-16/400/300	15	2026-02-01 17:50:18.651031+01	2026-02-01 17:50:18.651031+01
18	Symmetry	229.00	["Color Swatches", "Quick Order List", "Countdown Timer", "Sticky Header"]	https://picsum.photos/seed/theme-17/400/300	16	2026-02-01 17:50:18.651634+01	2026-02-01 17:50:18.651634+01
19	Wonder	239.00	["Age Verifier", "Countdown Timer", "Quick Order List", "Color Swatches"]	https://picsum.photos/seed/theme-18/400/300	17	2026-02-01 17:50:18.652114+01	2026-02-01 17:50:18.652114+01
20	Local	249.00	["Age Verifier", "Infinite Scroll", "Quick Order List", "Countdown Timer"]	https://picsum.photos/seed/theme-19/400/300	18	2026-02-01 17:50:18.652831+01	2026-02-01 17:50:18.652831+01
21	Motion	259.00	["Back-to-top", "Age Verifier", "Quick Order List", "Infinite Scroll"]	https://picsum.photos/seed/theme-20/400/300	19	2026-02-01 17:50:18.653671+01	2026-02-01 17:50:18.653671+01
22	Craft	269.00	["Back-to-top", "Age Verifier", "Right-to-Left", "Quick Order List"]	https://picsum.photos/seed/theme-21/400/300	20	2026-02-01 17:50:18.654467+01	2026-02-01 17:50:18.654467+01
23	Frost	279.00	["Back-to-top", "EU Translations", "Right-to-Left", "Age Verifier"]	https://picsum.photos/seed/theme-22/400/300	21	2026-02-01 17:50:18.655156+01	2026-02-01 17:50:18.655156+01
24	Blaze	289.00	["Back-to-top", "Infinite Scroll", "Right-to-Left", "Age Verifier"]	https://picsum.photos/seed/theme-23/400/300	22	2026-02-01 17:50:18.655801+01	2026-02-01 17:50:18.655801+01
25	Stride	299.00	["Premium Design", "Quick Order List", "Age Verifier", "Back-to-top"]	https://picsum.photos/seed/theme-24/400/300	23	2026-02-01 17:50:18.656439+01	2026-02-01 17:50:18.656439+01
26	Grove	300.00	["Mobile Optimized", "EU Translations", "Stock Counter", "Back-to-top"]	https://picsum.photos/seed/theme-25/400/300	24	2026-02-01 17:50:18.657192+01	2026-02-01 17:50:18.657192+01
27	Clarity	80.00	["Back-to-top", "Speed Focused", "Right-to-Left", "Stock Counter"]	https://picsum.photos/seed/theme-26/400/300	25	2026-02-01 17:50:18.657981+01	2026-02-01 17:50:18.657981+01
28	Aura	89.00	["Stock Counter", "EU Translations", "SEO Ready", "Age Verifier"]	https://picsum.photos/seed/theme-27/400/300	26	2026-02-01 17:50:18.658654+01	2026-02-01 17:50:18.658654+01
29	Ember	99.00	["Lookbook Layouts", "Right-to-Left", "Back-to-top", "Age Verifier"]	https://picsum.photos/seed/theme-28/400/300	27	2026-02-01 17:50:18.65916+01	2026-02-01 17:50:18.65916+01
30	Haven	100.00	["Stock Counter", "Quick View", "Back-to-top", "Breadcrumbs"]	https://picsum.photos/seed/theme-29/400/300	28	2026-02-01 17:50:18.659648+01	2026-02-01 17:50:18.659648+01
31	Forge	109.00	["Premium Design", "Age Verifier", "Sticky Header", "Mega Menu"]	https://picsum.photos/seed/theme-30/400/300	29	2026-02-01 17:50:18.660056+01	2026-02-01 17:50:18.660056+01
32	Catalyst	119.00	["Mobile Optimized", "Before/After Slider", "Breadcrumbs", "Product Filters"]	https://picsum.photos/seed/theme-31/400/300	30	2026-02-01 17:50:18.660605+01	2026-02-01 17:50:18.660605+01
33	Prism	129.00	["Premium Design", "Speed Focused", "Sticky Header", "Mega Menu"]	https://picsum.photos/seed/theme-32/400/300	31	2026-02-01 17:50:18.661344+01	2026-02-01 17:50:18.661344+01
34	Vertex	139.00	["Mobile Optimized", "SEO Ready", "Before/After Slider", "Product Filters"]	https://picsum.photos/seed/theme-33/400/300	32	2026-02-01 17:50:18.662041+01	2026-02-01 17:50:18.662041+01
35	Pulse	149.00	["Speed Focused", "Lookbook Layouts", "Countdown Timer", "Quick Order List"]	https://picsum.photos/seed/theme-34/400/300	33	2026-02-01 17:50:18.662569+01	2026-02-01 17:50:18.662569+01
36	Drift	159.00	["SEO Ready", "Breadcrumbs", "Infinite Scroll", "Quick Order List"]	https://picsum.photos/seed/theme-35/400/300	34	2026-02-01 17:50:18.663039+01	2026-02-01 17:50:18.663039+01
37	Flux	169.00	["Lookbook Layouts", "Back-to-top", "Countdown Timer", "EU Translations"]	https://picsum.photos/seed/theme-36/400/300	35	2026-02-01 17:50:18.663493+01	2026-02-01 17:50:18.663493+01
38	Nova	179.00	["Product Filters", "Before/After Slider", "Quick Order List", "Quick View"]	https://picsum.photos/seed/theme-37/400/300	36	2026-02-01 17:50:18.663949+01	2026-02-01 17:50:18.663949+01
39	Vogue	189.00	["Premium Design", "Countdown Timer", "Age Verifier", "EU Translations"]	https://picsum.photos/seed/theme-38/400/300	37	2026-02-01 17:50:18.664491+01	2026-02-01 17:50:18.664491+01
40	Minimal	199.00	["Mobile Optimized", "Before/After Slider", "Age Verifier", "EU Translations"]	https://picsum.photos/seed/theme-39/400/300	38	2026-02-01 17:50:18.66503+01	2026-02-01 17:50:18.66503+01
41	Bold	209.00	["Speed Focused", "Back-to-top", "Quick Order List", "Age Verifier"]	https://picsum.photos/seed/theme-40/400/300	39	2026-02-01 17:50:18.665508+01	2026-02-01 17:50:18.665508+01
42	Horizon	219.00	["Back-to-top", "SEO Ready", "EU Translations", "Age Verifier"]	https://picsum.photos/seed/theme-41/400/300	40	2026-02-01 17:50:18.665946+01	2026-02-01 17:50:18.665946+01
4	Zenith	99.00	["Mobile Optimized", "Premium Design", "SEO Ready", "Lookbook Layouts"]		2	2026-02-01 17:50:18.64373+01	2026-02-01 18:51:26.402021+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, display_name, created_at, updated_at) FROM stdin;
1	elurshteam@gmail.com	$2a$12$fAHLnRDIYFP4injYRJ8bVeZ.wh/z6h3IWAkOGilwvUbOdAIj4boLC	admin	Admin	2026-01-30 21:01:21.243915+01	2026-01-30 21:01:21.243915+01
\.


--
-- Name: analysed_stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analysed_stores_id_seq', 28, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contacts_id_seq', 5, true);


--
-- Name: content_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.content_pages_id_seq', 1, false);


--
-- Name: emails_sent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emails_sent_id_seq', 3, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 15, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 19, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 88, true);


--
-- Name: store_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_reports_id_seq', 4, true);


--
-- Name: themes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.themes_id_seq', 43, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: analysed_stores analysed_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysed_stores
    ADD CONSTRAINT analysed_stores_pkey PRIMARY KEY (id);


--
-- Name: analysed_stores analysed_stores_store_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysed_stores
    ADD CONSTRAINT analysed_stores_store_url_key UNIQUE (store_url);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: content_pages content_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_pages
    ADD CONSTRAINT content_pages_pkey PRIMARY KEY (id);


--
-- Name: content_pages content_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.content_pages
    ADD CONSTRAINT content_pages_slug_key UNIQUE (slug);


--
-- Name: emails_sent emails_sent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emails_sent
    ADD CONSTRAINT emails_sent_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reference_key UNIQUE (reference);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: store_reports store_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_reports
    ADD CONSTRAINT store_reports_pkey PRIMARY KEY (id);


--
-- Name: store_reports store_reports_store_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_reports
    ADD CONSTRAINT store_reports_store_url_key UNIQUE (store_url);


--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_analysed_stores_analysed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analysed_stores_analysed_at ON public.analysed_stores USING btree (analysed_at DESC);


--
-- Name: idx_analysed_stores_store_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analysed_stores_store_url ON public.analysed_stores USING btree (store_url);


--
-- Name: idx_contacts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_created_at ON public.contacts USING btree (created_at DESC);


--
-- Name: idx_contacts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);


--
-- Name: idx_contacts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contacts_status ON public.contacts USING btree (status);


--
-- Name: idx_content_pages_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_pages_published ON public.content_pages USING btree (published);


--
-- Name: idx_content_pages_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_pages_slug ON public.content_pages USING btree (slug);


--
-- Name: idx_emails_sent_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emails_sent_sent_at ON public.emails_sent USING btree (sent_at DESC);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_email ON public.orders USING btree (email);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_created_at ON public.payments USING btree (created_at DESC);


--
-- Name: idx_payments_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_reference ON public.payments USING btree (reference);


--
-- Name: idx_products_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_published ON public.products USING btree (published);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_products_sort_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sort_order ON public.products USING btree (sort_order, id);


--
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_category ON public.services USING btree (category);


--
-- Name: idx_services_sort_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_sort_order ON public.services USING btree (sort_order, id);


--
-- Name: idx_services_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_type ON public.services USING btree (type);


--
-- Name: idx_store_reports_store_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_store_reports_store_url ON public.store_reports USING btree (store_url);


--
-- Name: idx_themes_sort_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_themes_sort_order ON public.themes USING btree (sort_order);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: orders orders_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict ARdoo4BRnq1skpibka9Vj14EWYZvaK5ZoiaQwPA6zJ02nL9DLDsbCwXPZigOAug


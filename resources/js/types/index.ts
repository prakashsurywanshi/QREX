export type Role =
    | "Super Admin"
    | "Admin"
    | "Sales Executive"
    | "Senior Agent"
    | "Marketing User"
    | "Accountant";

export type PropertyStatus =
    | "Available"
    | "Reserved"
    | "Under Negotiation"
    | "Sold"
    | "Draft"
    | "Rented"
    | "Inactive";

export type PropertyType =
    | "Apartment"
    | "Villa"
    | "Plot"
    | "Commercial"
    | "Office"
    | "Shop"
    | "Warehouse"
    | "Farm/Land"
    | "Other";

export type TransactionType = "Buy" | "Rent" | "Lease";

/** Every spec field the property form knows how to render. */
export type SpecField =
    | "price"
    | "area"
    | "bedrooms"
    | "bathrooms"
    | "floors"
    | "parking"
    | "furnishing"
    | "possession_date";

export interface SpecRuleSet {
    visible: SpecField[];
    required: SpecField[];
    hidden: SpecField[];
    defaults: Record<string, string | number>;
    area_label: string;
}

export interface Amenity {
    id: number;
    property_type_id: number;
    name: string;
    slug: string;
    icon?: string | null;
    sort_order: number;
    is_active: boolean;
}

/** One entry of the property-type catalog shipped to the form from the backend. */
export interface PropertyTypeMeta {
    name: string;
    slug: string;
    description?: string | null;
    amenities: string[];
    spec: SpecRuleSet;
}

export interface PropertyTypeSummary {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    amenity_count: number;
    active_count: number;
}

export type LeadStatus =
    | "New"
    | "Contacted"
    | "Qualified"
    | "Site Visit Scheduled"
    | "Site Visit Completed"
    | "Negotiation"
    | "Converted"
    | "Lost";

export type LeadSource =
    | "Website"
    | "Facebook"
    | "Instagram"
    | "Google"
    | "Referral"
    | "Walk-in"
    | "Phone"
    | "WhatsApp"
    | "Campaign"
    | "Other";

export type PipelineStage =
    | "New Lead"
    | "Contacted"
    | "Qualified"
    | "Property Shortlisted"
    | "Site Visit Scheduled"
    | "Site Visit Completed"
    | "Negotiation"
    | "Booking"
    | "Agreement"
    | "Payment"
    | "Closed Won"
    | "Closed Lost";

export type CustomerStatus = "Prospect" | "Active" | "Buyer" | "Investor" | "Past Customer";

export type SiteVisitStatus = "Scheduled" | "Confirmed" | "Completed" | "Rescheduled" | "Cancelled";

export type PaymentStatus =
    | "Pending"
    | "Partially Paid"
    | "Paid"
    | "Overdue"
    | "Cancelled";

export type ActivityType =
    | "Call"
    | "WhatsApp"
    | "SMS"
    | "Email"
    | "Note"
    | "Site Visit"
    | "Meeting"
    | "Status Change"
    | "Task"
    | "Document"
    | "Recommendation";

export interface Activity {
    id: number;
    type: ActivityType;
    title: string;
    description?: string;
    duration?: string;
    outcome?: string;
    contact_number?: string;
    email_subject?: string;
    next_followup?: string;
    location?: string;
    user_name: string;
    created_at: string;
}

export interface Agent {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
    deals: number;
    revenue: string;
    rating: number;
    branch: string;
}

export interface Property {
    id: number;
    public_id: string;
    property_id: string;
    title: string;
    type: PropertyType;
    transaction_type: TransactionType;
    description: string;
    status: PropertyStatus;
    price: number;
    price_label: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    floors: number;
    parking: number;
    furnishing: string;
    possession_date: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude?: string;
    longitude?: string;
    amenities: string[];
    featured: boolean;
    is_website_visible: boolean;
    agent_id: number;
    agent_name?: string;
    image: string;
    images?: { id: number; path: string; type?: string; is_cover?: boolean; sort_order?: number }[];
    location?: string;
    agent?: { id: number; name: string; email: string; phone: string; role: string; initials: string };
    seo_title?: string;
    meta_description?: string;
    slug?: string;
    created_at?: string;
}

export interface Lead {
    id: number;
    lead_id: string;
    name: string;
    phone: string;
    email: string;
    source: LeadSource;
    status: LeadStatus;
    budget: string;
    preferred_location: string;
    interested_property_id: number | null;
    interested_property?: { id: number; title: string } | null;
    assigned_agent_id: number | null;
    agent_name?: string;
    score: number;
    requirements?: string;
    last_contact?: string;
    next_followup?: string;
    created_at: string;
}

export interface LeadActivity {
    id: number;
    lead_id: number;
    type: ActivityType;
    title: string;
    description: string;
    user_name: string;
    created_at: string;
}

export interface Deal {
    id: number;
    deal_id: string;
    lead_id: number | null;
    customer_name: string;
    property_id: number;
    property_name?: string;
    deal_value: number;
    value_label: string;
    stage: PipelineStage;
    probability: number;
    days_in_stage: number;
    assigned_agent_id: number;
    agent_name?: string;
    last_activity?: string;
    next_followup?: string;
}

export interface Customer {
    id: number;
    customer_id: string;
    name: string;
    phone: string;
    email: string;
    type: string;
    status: CustomerStatus;
    properties: string[];
    total_value: string;
    agent_id: number;
    agent_name?: string;
    city: string;
    requirements?: string;
    created_at: string;
}

export interface SiteVisit {
    id: number;
    visit_id: string;
    customer_name: string;
    property_name: string;
    agent_name: string;
    visit_date: string;
    visit_time: string;
    status: SiteVisitStatus;
    location: string;
    notes?: string;
    feedback?: string;
}

export interface Booking {
    id: number;
    booking_id: string;
    customer_name: string;
    property_name: string;
    agent_name: string;
    booking_date: string;
    deal_value: number;
    deal_label: string;
    booking_amount: number;
    booking_amount_label: string;
    status: string;
    agreement_status: string;
    possession_status: string;
}

export interface Payment {
    id: number;
    payment_id: string;
    customer_name: string;
    property_name: string;
    amount: number;
    amount_label: string;
    mode: string;
    txn_id: string;
    due_date: string;
    paid_date: string;
    status: PaymentStatus;
}

export interface Campaign {
    id: number;
    campaign_id: string;
    name: string;
    channel: string;
    budget: number;
    spent: number;
    leads: number;
    conversions: number;
    revenue: number;
    revenue_label: string;
    roi: string;
    start_date: string;
    end_date: string;
    status: string;
}

export interface MediaFile {
    id: number;
    name: string;
    type: string;
    size: string;
    folder: string;
    property_name?: string;
    uploaded_by: string;
    uploaded_at: string;
    url: string;
}

export interface AppUser {
    id: number;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    branch: string;
    status: string;
    last_login: string;
}

export interface ModulePermission {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    approve: boolean;
    fields: Record<string, boolean>;
}

export type CanObject = Record<string, ModulePermission>;

export interface SharedData {
    app: { name: string; type: string; project_name?: string; logo?: string | null };
    site?: {
        project_name?: string;
        agency_name?: string;
        contact_email?: string;
        contact_phone?: string;
        address?: string;
        tagline?: string;
    };
    auth: { user: AuthUser | null };
    flash: { success?: string; error?: string };
    can?: CanObject;
    notifications?: { unread?: number };
    [key: string]: unknown;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: Role;
    role_slugs?: string[];
    branch: string;
    avatar?: string | null;
    initials: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = SharedData & {
    auth: { user: AuthUser | null };
    flash: { success?: string; error?: string };
    errors: Record<string, string>;
} & T;



import type { BranchCode, TierCode } from './branches';

/**
 * Twelve fictional trade customers.
 *
 * Spread across the three tiers and the four branches, with a deliberate mix of
 * shapes: a big contractor with three buyers and a $250k limit, a one-man band on
 * standard pricing, a facilities company parked on hold with credit control. That
 * spread is what makes the back office look like a real customer file rather than
 * twelve copies of the same row.
 *
 * Every company, person, email and address here is invented. Emails use the
 * reserved `.example` TLD so none of them can reach a real inbox.
 */

export interface BuyerSeed {
  name: string;
  email: string;
  role: 'customer_admin' | 'customer_buyer';
  jobTitle: string;
  phone?: string;
}

export interface AddressSeed {
  label: string;
  contactName?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  deliveryInstructions?: string;
  isDefaultDelivery?: boolean;
  isBilling?: boolean;
}

export interface CompanySeed {
  accountNumber: string;
  name: string;
  tradingName?: string;
  tierCode: TierCode;
  branchCode: BranchCode;
  status: 'active' | 'on_hold' | 'pending';
  creditLimitMinor: number;
  creditTermsDays: number;
  paymentTermsLabel: string;
  taxExempt: boolean;
  taxExemptionRef?: string;
  taxId?: string;
  phone: string;
  email: string;
  notes?: string;
  /** Relative order volume, used when generating order history. */
  volume: 'high' | 'medium' | 'low';
  buyers: BuyerSeed[];
  addresses: AddressSeed[];
}

export const COMPANY_SEED: CompanySeed[] = [
  {
    accountNumber: 'BW-10042',
    name: 'Halvorsen Plumbing & Heating',
    tierCode: 'T1',
    branchCode: 'NWK',
    status: 'active',
    creditLimitMinor: 25_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: true,
    taxExemptionRef: 'NJ-RESALE-884213',
    taxId: '22-4187905',
    phone: '(973) 555-0210',
    email: 'accounts@halvorsenplumbing.example',
    notes: 'Contract rates reviewed each January. Dean signs off anything over $5k.',
    volume: 'high',
    buyers: [
      {
        name: 'Dean Halvorsen',
        email: 'dean@halvorsenplumbing.example',
        role: 'customer_admin',
        jobTitle: 'Owner',
        phone: '(973) 555-0211',
      },
      {
        name: 'Ryan Halvorsen',
        email: 'ryan@halvorsenplumbing.example',
        role: 'customer_buyer',
        jobTitle: 'Contracts manager',
        phone: '(973) 555-0212',
      },
      {
        name: 'Paulette Osei',
        email: 'paulette@halvorsenplumbing.example',
        role: 'customer_buyer',
        jobTitle: 'Purchasing',
      },
    ],
    addresses: [
      {
        label: 'Yard — Kearny',
        contactName: 'Goods in',
        line1: '77 Schuyler Avenue',
        city: 'Kearny',
        state: 'NJ',
        postcode: '07032',
        deliveryInstructions: 'Deliveries before 3pm. Forklift on site. Ring bell at gate 2.',
        isDefaultDelivery: true,
        isBilling: true,
      },
      {
        label: 'Site — Harrison Mills redevelopment',
        contactName: 'Ryan Halvorsen',
        line1: 'Block C, Guyon Drive',
        city: 'Harrison',
        state: 'NJ',
        postcode: '07029',
        deliveryInstructions: 'Site cabin on Guyon Drive. Hard hat and vest required.',
      },
    ],
  },
  {
    accountNumber: 'BW-10078',
    name: 'Ridgeline Mechanical LLC',
    tierCode: 'T1',
    branchCode: 'CMH',
    status: 'active',
    creditLimitMinor: 18_000_000,
    creditTermsDays: 45,
    paymentTermsLabel: 'Net 45 days',
    taxExempt: true,
    taxExemptionRef: 'OH-98-114520',
    taxId: '34-2298017',
    phone: '(614) 555-0233',
    email: 'purchasing@ridgelinemech.example',
    notes: 'Net 45 agreed 2024. Mostly commercial boiler and hydronics work.',
    volume: 'high',
    buyers: [
      {
        name: 'Alicia Vondracek',
        email: 'alicia@ridgelinemech.example',
        role: 'customer_admin',
        jobTitle: 'Operations director',
      },
      {
        name: 'Marcus Bell',
        email: 'marcus@ridgelinemech.example',
        role: 'customer_buyer',
        jobTitle: 'Project buyer',
      },
    ],
    addresses: [
      {
        label: 'Main workshop',
        line1: '4120 Grove City Road',
        line2: 'Building 4',
        city: 'Grove City',
        state: 'OH',
        postcode: '43123',
        deliveryInstructions: 'Rear loading dock. Call ahead for anything over 500lb.',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10091',
    name: 'Trestle Mechanical Group',
    tierCode: 'T1',
    branchCode: 'DAL',
    status: 'active',
    creditLimitMinor: 32_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: true,
    taxExemptionRef: 'TX-1-75244-0091',
    taxId: '75-3310442',
    phone: '(214) 555-0266',
    email: 'ap@trestlemech.example',
    notes: 'Largest account by volume. Requires PO number on every order.',
    volume: 'high',
    buyers: [
      {
        name: 'Nadia Farouk',
        email: 'nadia@trestlemech.example',
        role: 'customer_admin',
        jobTitle: 'Procurement manager',
      },
      {
        name: 'Colby Reyes',
        email: 'colby@trestlemech.example',
        role: 'customer_buyer',
        jobTitle: 'Field superintendent',
      },
      {
        name: 'Hannah Whitlock',
        email: 'hannah@trestlemech.example',
        role: 'customer_buyer',
        jobTitle: 'Estimator',
      },
    ],
    addresses: [
      {
        label: 'Central warehouse',
        line1: '8801 Ambassador Row',
        city: 'Dallas',
        state: 'TX',
        postcode: '75247',
        deliveryInstructions: 'Dock 6. PO number must be on the packing slip.',
        isDefaultDelivery: true,
        isBilling: true,
      },
      {
        label: 'Site — Legacy West tower 2',
        line1: '7250 Bishop Road',
        city: 'Plano',
        state: 'TX',
        postcode: '75024',
        deliveryInstructions: 'Deliver to level 1 store. Book slot with site office.',
      },
    ],
  },
  {
    accountNumber: 'BW-10114',
    name: 'Castellano Plumbing Co',
    tierCode: 'T2',
    branchCode: 'DAL',
    status: 'active',
    creditLimitMinor: 7_500_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '75-2874109',
    phone: '(214) 555-0301',
    email: 'office@castellanoplumbing.example',
    volume: 'medium',
    buyers: [
      {
        name: 'Rosa Castellano',
        email: 'rosa@castellanoplumbing.example',
        role: 'customer_admin',
        jobTitle: 'Owner',
      },
      {
        name: 'Victor Castellano',
        email: 'victor@castellanoplumbing.example',
        role: 'customer_buyer',
        jobTitle: 'Lead plumber',
      },
    ],
    addresses: [
      {
        label: 'Shop',
        line1: '612 Cardinal Street',
        city: 'Garland',
        state: 'TX',
        postcode: '75040',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10126',
    name: 'Delta Bay Plumbing Inc',
    tierCode: 'T2',
    branchCode: 'SAC',
    status: 'active',
    creditLimitMinor: 9_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '94-3117726',
    phone: '(916) 555-0344',
    email: 'accounts@deltabayplumbing.example',
    notes: 'Service and repair. Lots of small collection orders, mostly Sacramento branch.',
    volume: 'medium',
    buyers: [
      {
        name: 'Tessa Nguyen',
        email: 'tessa@deltabayplumbing.example',
        role: 'customer_admin',
        jobTitle: 'General manager',
      },
      {
        name: 'Owen Brandt',
        email: 'owen@deltabayplumbing.example',
        role: 'customer_buyer',
        jobTitle: 'Service lead',
      },
    ],
    addresses: [
      {
        label: 'Depot',
        line1: '2119 Northgate Boulevard',
        line2: 'Unit 7',
        city: 'Sacramento',
        state: 'CA',
        postcode: '95833',
        deliveryInstructions: 'Small gate, no artics. Van deliveries only.',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10139',
    name: 'Okonkwo Heating Services',
    tierCode: 'T2',
    branchCode: 'NWK',
    status: 'active',
    creditLimitMinor: 6_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '22-3904881',
    phone: '(973) 555-0377',
    email: 'chidi@okonkwoheating.example',
    volume: 'medium',
    buyers: [
      {
        name: 'Chidi Okonkwo',
        email: 'chidi@okonkwoheating.example',
        role: 'customer_admin',
        jobTitle: 'Owner',
      },
    ],
    addresses: [
      {
        label: 'Unit 3, Ironbound',
        line1: '245 Adams Street',
        city: 'Newark',
        state: 'NJ',
        postcode: '07105',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10152',
    name: 'Marquez Plumbing Contractors',
    tierCode: 'T2',
    branchCode: 'SAC',
    status: 'active',
    creditLimitMinor: 8_500_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: true,
    taxExemptionRef: 'CA-SR-Y-041-9928',
    taxId: '68-4102993',
    phone: '(916) 555-0402',
    email: 'purchasing@marquezplumbing.example',
    volume: 'medium',
    buyers: [
      {
        name: 'Elena Marquez',
        email: 'elena@marquezplumbing.example',
        role: 'customer_admin',
        jobTitle: 'Director',
      },
      {
        name: 'Sam Petrova',
        email: 'sam@marquezplumbing.example',
        role: 'customer_buyer',
        jobTitle: 'Buyer',
      },
    ],
    addresses: [
      {
        label: 'Yard',
        line1: '1580 Fee Drive',
        city: 'Sacramento',
        state: 'CA',
        postcode: '95815',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10168',
    name: 'Ironwood Facilities Services',
    tierCode: 'T2',
    branchCode: 'NWK',
    status: 'active',
    creditLimitMinor: 12_000_000,
    creditTermsDays: 60,
    paymentTermsLabel: 'Net 60 days',
    taxExempt: false,
    taxId: '22-4416038',
    phone: '(973) 555-0431',
    email: 'supplies@ironwoodfacilities.example',
    notes: 'Net 60 by agreement — property management group, pays on the day.',
    volume: 'medium',
    buyers: [
      {
        name: 'Priya Raghunathan',
        email: 'priya@ironwoodfacilities.example',
        role: 'customer_admin',
        jobTitle: 'Head of maintenance',
      },
      {
        name: 'Devin Clarke',
        email: 'devin@ironwoodfacilities.example',
        role: 'customer_buyer',
        jobTitle: 'Maintenance supervisor',
      },
    ],
    addresses: [
      {
        label: 'Central stores',
        line1: '900 Passaic Avenue',
        line2: 'Stores entrance',
        city: 'Harrison',
        state: 'NJ',
        postcode: '07029',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10181',
    name: 'Sparrow & Sons Plumbing',
    tierCode: 'T3',
    branchCode: 'CMH',
    status: 'active',
    creditLimitMinor: 2_500_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '31-2088174',
    phone: '(614) 555-0466',
    email: 'jim@sparrowandsons.example',
    volume: 'low',
    buyers: [
      {
        name: 'Jim Sparrow',
        email: 'jim@sparrowandsons.example',
        role: 'customer_admin',
        jobTitle: 'Owner',
      },
    ],
    addresses: [
      {
        label: 'Home yard',
        line1: '318 Harmon Avenue',
        city: 'Columbus',
        state: 'OH',
        postcode: '43223',
        deliveryInstructions: 'Leave with neighbour at 320 if out.',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10197',
    name: 'Petrillo Brothers Heating',
    tierCode: 'T3',
    branchCode: 'CMH',
    status: 'active',
    creditLimitMinor: 3_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '31-2451190',
    phone: '(614) 555-0498',
    email: 'office@petrillobros.example',
    volume: 'low',
    buyers: [
      {
        name: 'Anthony Petrillo',
        email: 'anthony@petrillobros.example',
        role: 'customer_admin',
        jobTitle: 'Partner',
      },
      {
        name: 'Gina Petrillo',
        email: 'gina@petrillobros.example',
        role: 'customer_buyer',
        jobTitle: 'Office manager',
      },
    ],
    addresses: [
      {
        label: 'Workshop',
        line1: '1744 Joyce Avenue',
        city: 'Columbus',
        state: 'OH',
        postcode: '43219',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10203',
    name: 'Cascade Ridge Plumbing',
    tierCode: 'T3',
    branchCode: 'SAC',
    status: 'active',
    creditLimitMinor: 1_800_000,
    creditTermsDays: 14,
    paymentTermsLabel: 'Net 14 days',
    taxExempt: false,
    taxId: '68-4490117',
    phone: '(916) 555-0523',
    email: 'hello@cascaderidgeplumbing.example',
    notes: 'New account, opened this year. Short terms until payment history builds.',
    volume: 'low',
    buyers: [
      {
        name: 'Brett Sandoval',
        email: 'brett@cascaderidgeplumbing.example',
        role: 'customer_admin',
        jobTitle: 'Owner',
      },
    ],
    addresses: [
      {
        label: 'Unit 12',
        line1: '4455 Auburn Boulevard',
        line2: 'Unit 12',
        city: 'Sacramento',
        state: 'CA',
        postcode: '95841',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
  {
    accountNumber: 'BW-10218',
    name: 'Fairhaven Property Maintenance',
    tierCode: 'T3',
    branchCode: 'DAL',
    status: 'on_hold',
    creditLimitMinor: 4_000_000,
    creditTermsDays: 30,
    paymentTermsLabel: 'Net 30 days',
    taxExempt: false,
    taxId: '75-3902884',
    phone: '(214) 555-0559',
    email: 'accounts@fairhavenpm.example',
    notes: 'ON HOLD — two invoices past 60 days. Credit control chasing since last month.',
    volume: 'low',
    buyers: [
      {
        name: 'Lorna Beckett',
        email: 'lorna@fairhavenpm.example',
        role: 'customer_admin',
        jobTitle: 'Accounts',
      },
    ],
    addresses: [
      {
        label: 'Office',
        line1: '215 Munger Avenue',
        line2: 'Suite 140',
        city: 'Dallas',
        state: 'TX',
        postcode: '75202',
        isDefaultDelivery: true,
        isBilling: true,
      },
    ],
  },
];

/** Brightwater's own people. */
export interface StaffSeed {
  name: string;
  email: string;
  role: 'staff_admin' | 'staff';
  jobTitle: string;
  branchCode: BranchCode;
}

export const STAFF_SEED: StaffSeed[] = [
  {
    name: 'Marcy Kwan',
    email: 'marcy.kwan@brightwatertrade.example',
    role: 'staff_admin',
    jobTitle: 'Operations manager',
    branchCode: 'NWK',
  },
  {
    name: 'Tom Iverson',
    email: 'tom.iverson@brightwatertrade.example',
    role: 'staff',
    jobTitle: 'Trade counter supervisor',
    branchCode: 'NWK',
  },
  {
    name: 'Denise Okafor',
    email: 'denise.okafor@brightwatertrade.example',
    role: 'staff_admin',
    jobTitle: 'Commercial manager',
    branchCode: 'CMH',
  },
  {
    name: 'Rafael Ibarra',
    email: 'rafael.ibarra@brightwatertrade.example',
    role: 'staff',
    jobTitle: 'Warehouse lead',
    branchCode: 'DAL',
  },
  {
    name: 'Sandy Lindqvist',
    email: 'sandy.lindqvist@brightwatertrade.example',
    role: 'staff',
    jobTitle: 'Internal sales',
    branchCode: 'SAC',
  },
];

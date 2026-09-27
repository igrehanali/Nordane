/**
 * Brightwater's four branches.
 *
 * Tax rates are the headline state rate for each location, which is the level of
 * fidelity this build commits to — see DECISIONS.md on why real jurisdiction
 * logic is out of scope. Phone numbers use the 555 exchange reserved for fiction.
 */
export const BRANCH_SEED = [
  {
    code: 'NWK',
    name: 'Newark Distribution Center',
    line1: '1480 Doremus Avenue',
    line2: 'Unit B',
    city: 'Newark',
    state: 'NJ',
    postcode: '07105',
    phone: '(973) 555-0142',
    email: 'newark@brightwatertrade.example',
    taxRateBps: 663,
    openingHours: 'Mon–Fri 6:30am–5pm · Sat 7am–12pm',
    sortOrder: 1,
  },
  {
    code: 'CMH',
    name: 'Columbus Branch',
    line1: '2255 Westbelt Drive',
    line2: null,
    city: 'Columbus',
    state: 'OH',
    postcode: '43228',
    phone: '(614) 555-0188',
    email: 'columbus@brightwatertrade.example',
    taxRateBps: 750,
    openingHours: 'Mon–Fri 7am–5pm · Sat 7am–12pm',
    sortOrder: 2,
  },
  {
    code: 'DAL',
    name: 'Dallas Branch',
    line1: '4107 Simonton Road',
    line2: 'Suite 300',
    city: 'Dallas',
    state: 'TX',
    postcode: '75244',
    phone: '(214) 555-0119',
    email: 'dallas@brightwatertrade.example',
    taxRateBps: 825,
    openingHours: 'Mon–Fri 6:30am–5:30pm · Sat 7am–1pm',
    sortOrder: 3,
  },
  {
    code: 'SAC',
    name: 'Sacramento Branch',
    line1: '3390 Bradshaw Road',
    line2: null,
    city: 'Sacramento',
    state: 'CA',
    postcode: '95827',
    phone: '(916) 555-0173',
    email: 'sacramento@brightwatertrade.example',
    taxRateBps: 875,
    openingHours: 'Mon–Fri 7am–5pm · Sat closed',
    sortOrder: 4,
  },
] as const;

export type BranchCode = (typeof BRANCH_SEED)[number]['code'];

/**
 * Price tiers. A customer with no explicit tier price on a product gets list less
 * the tier's default discount, which is how a real merchant's file behaves: a
 * headline discount with negotiated exceptions layered on top.
 */
export const PRICE_TIER_SEED = [
  {
    code: 'T1',
    name: 'Contract',
    description: 'Large mechanical contractors on negotiated contract rates',
    defaultDiscountBps: 3_200,
    sortOrder: 1,
  },
  {
    code: 'T2',
    name: 'Trade',
    description: 'Established trade accounts with regular monthly spend',
    defaultDiscountBps: 2_400,
    sortOrder: 2,
  },
  {
    code: 'T3',
    name: 'Standard',
    description: 'Smaller accounts and newer customers',
    defaultDiscountBps: 1_500,
    sortOrder: 3,
  },
] as const;

export type TierCode = (typeof PRICE_TIER_SEED)[number]['code'];

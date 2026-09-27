import {
  Banknote,
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Package,
  PackageSearch,
  Percent,
  Receipt,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  UserPlus,
  Users,
} from 'lucide-react';
import type * as React from 'react';
import type { Role } from './auth/roles';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Roles allowed to see this item. Omitted means everyone in that section. */
  roles?: readonly Role[];
  /**
   * False while the slice that builds this screen has not shipped. The item
   * renders disabled rather than linking to a 404 — the app stays walkable at
   * every point in the build.
   */
  available?: boolean;
  section?: string;
}

export const PORTAL_NAV: readonly NavItem[] = [
  { href: '/portal', label: 'Overview', icon: LayoutDashboard, available: true },
  { href: '/portal/catalogue', label: 'Catalogue', icon: PackageSearch, available: false },
  { href: '/portal/quick-order', label: 'Quick order', icon: ClipboardList, available: false },
  { href: '/portal/lists', label: 'Saved lists', icon: Star, available: false },
  { href: '/portal/cart', label: 'Cart', icon: ShoppingCart, available: false },
  { href: '/portal/orders', label: 'Orders', icon: Package, available: false, section: 'Account' },
  {
    href: '/portal/invoices',
    label: 'Invoices',
    icon: Receipt,
    roles: ['customer_admin'],
    available: false,
    section: 'Account',
  },
  {
    href: '/portal/statements',
    label: 'Statements',
    icon: FileText,
    roles: ['customer_admin'],
    available: false,
    section: 'Account',
  },
  {
    href: '/portal/addresses',
    label: 'Addresses',
    icon: MapPin,
    available: false,
    section: 'Account',
  },
  {
    href: '/portal/users',
    label: 'Buyers',
    icon: Users,
    roles: ['customer_admin'],
    available: false,
    section: 'Account',
  },
];

export const STAFF_NAV: readonly NavItem[] = [
  { href: '/staff', label: 'Dashboard', icon: Gauge, available: true },
  { href: '/staff/orders', label: 'Orders', icon: ClipboardList, available: false },
  { href: '/staff/customers', label: 'Customers', icon: Users, available: false },
  {
    href: '/staff/products',
    label: 'Products',
    icon: Package,
    available: false,
    section: 'Catalogue',
  },
  { href: '/staff/stock', label: 'Stock', icon: Boxes, available: false, section: 'Catalogue' },
  {
    href: '/staff/pricing',
    label: 'Price tiers',
    icon: Tags,
    roles: ['staff_admin'],
    available: false,
    section: 'Commercial',
  },
  {
    href: '/staff/promotions',
    label: 'Promotions',
    icon: Percent,
    roles: ['staff_admin'],
    available: false,
    section: 'Commercial',
  },
  {
    href: '/staff/credit',
    label: 'Credit control',
    icon: Banknote,
    roles: ['staff_admin'],
    available: false,
    section: 'Commercial',
  },
  {
    href: '/staff/applications',
    label: 'Applications',
    icon: UserPlus,
    available: false,
    section: 'Enquiries',
  },
  {
    href: '/staff/quotes',
    label: 'Quote requests',
    icon: FileText,
    available: false,
    section: 'Enquiries',
  },
  {
    href: '/staff/reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['staff_admin'],
    available: false,
    section: 'Enquiries',
  },
  {
    href: '/staff/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['staff_admin'],
    available: false,
    section: 'Enquiries',
  },
];

/**
 * Nav trees are looked up by key rather than passed around as data.
 *
 * Each item carries an icon, and an icon is a React component — a function, which
 * cannot be serialised across the server/client boundary. So the server tells the
 * client *which* nav to render and the client resolves it here, instead of
 * handing over the items themselves.
 */
export const NAVS = {
  portal: PORTAL_NAV,
  staff: STAFF_NAV,
} as const;

export type NavKey = keyof typeof NAVS;

export function navForRole(key: NavKey, role: Role): NavItem[] {
  return NAVS[key].filter((item) => !item.roles || item.roles.includes(role));
}

/** Groups nav items under their section heading, preserving order. */
export function groupNav(items: NavItem[]): { section: string | null; items: NavItem[] }[] {
  const groups: { section: string | null; items: NavItem[] }[] = [];
  for (const item of items) {
    const section = item.section ?? null;
    const last = groups.at(-1);
    if (last && last.section === section) last.items.push(item);
    else groups.push({ section, items: [item] });
  }
  return groups;
}

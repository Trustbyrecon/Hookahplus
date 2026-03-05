#!/usr/bin/env tsx
/**
 * Seed CODIGO pilot config + floorplan for loungeID_CODIGO.
 *
 * Usage:
 *   npx tsx scripts/seed-codigo-pilot.ts
 *
 * Run from apps/app directory. Requires add_pilot_floorplan_tables.sql applied first.
 */

import { prisma } from '../lib/db';

const LOUNGE_ID_CODIGO = 'CODIGO';

const PILOT_CONFIG = {
  layoutMode: 'floor' as const, // Foundation: POS-mirrored UI (Toast), reduces cognitive switching
  peakNights: ['Thursday', 'Friday', 'Saturday'],
  operatingWindow: { start: '22:00', end: '02:00' },
  pricing: {
    hookah: { amountCents: 6000, label: 'Hookah $60 + tax/gratuity' },
    refill: { amountCents: 3000, label: 'Refills $30 + tax/gratuity' },
  },
  staff: [
    { name: 'Rose', role: 'Host/FOH' },
    { name: 'Shisha', role: 'Server/FOH' },
    { name: 'Master', role: 'Coal Master/BOH' },
  ],
  menuPresets: [
    { id: '1', name: "Noor Al Ein", flavors: ['Lemon Mint', 'Blackberry', 'Ice'] },
    { id: '2', name: "Shah's Eclipse", flavors: ['Black Grape', 'Blueberry', 'Cooling Mint'] },
    { id: '3', name: 'Zarafshan Gold', flavors: ['Honeydew Melon', 'Pear', 'Soft Vanilla'] },
    { id: '4', name: 'Lailat Al Ward', flavors: ['Pomegranate', 'Blood Orange', 'Raspberry'] },
    { id: '5', name: 'Noor al-Layl', flavors: ['Blueberry', 'Soft Vanilla', 'Cooling Mint'] },
  ],
  menuCatalogs: {
    'Al Fakher x Cookies': ['Blueberry Caviar', 'Citrus Zen', 'Lemon Icy', 'Purple Sunset', 'Sandia'],
    'Al Fakher x Snoop Dogg': ["Dogg's Delight", 'Midnight Blues', 'Money Honey', "Tha G'z Miz", 'Cloud 92'],
    Adalya: ['Love 66', 'Lady Killer', 'Mi Amor', 'Skyfall', 'Hawaii', 'Strawberry Splash', 'Punkman', 'Ice Bonbon'],
    Fumari: ['White Gummi Bear', 'Red Gummi Bear', 'Orange Gummi Bear', 'Pink Gummi Bear', "Blueberry N'Ice", 'Ambrosia', 'Blueberry Muffin', 'Caramel Kiss', 'Hola Peaches', 'Lemon Mint', 'Lemoncello', 'Mint Chocolate Chill', "Peach N'Ice", 'Summer Sorbetto', 'Tropical Punch', 'Watermelon Sugamint'],
    Serbetli: ['Soft Mint', 'Ice Citrus Mango', 'Ice Lemon Mint', 'Toasted Berries', 'Lychee Lime Blueberry', 'Ice Orange', 'Ice Grapefruit', 'Ice Strawberry Melon', 'Ice Watermelon', 'Ice Blueberry', 'Bubble Fruit', 'Istanbul Nights', 'Lime Spice Peach', 'Pistachio Ice Cream', 'Marbella'],
    'Serbetli Hard Line': ['Raspberry', 'Spice Lime Peach', 'Bananna Kiwi Strawberry', 'Blueberry', 'Green Squash', 'Jusberry', 'Lemon Lime', 'Mandarine', 'Maracuja', 'Pineapple', 'Corn', 'Cane Mint', 'Berry Brew', 'Cranberry Shake'],
    Darkside: ['Arabic Shake', 'Asian Shake', 'Capital Shake', 'Central Shake', 'Mexican Shake', 'Liberty Shake', 'Bananapapa', 'Falling Star', 'Bounty Hunter', 'Supernova (Ultranova)', 'Wild Forest', 'Darkside Cola', 'Wildberry', 'Red Tea', 'Mango Lassi 2.0', 'Deep Blue Sea', 'Waffle Shuffle', 'Lemon Blast', 'Barvy Orange'],
    BlackBurn: ['Nutella', 'Blackburn Haribon', 'Ezko Mango', 'Cheesecake', 'Sweet Papaya', 'Grape Lollipop', 'Creme Brulee', 'Black Honey', 'Lemon Shock', 'Etalon Melon', 'Pineapple Yogurt'],
    Starline: ['Belgian Waffles', 'Wild Strawberry', 'Raspberry Waffle', 'Tropical Smoothie', 'Blueberry Crumble', 'Island Papaya', 'Strawberry Millefeuille', 'Butter Cream', 'Bananna Marshmellow', 'Apple Juice'],
    MustHave: ['Pistachio', 'Frosty', 'Honey Halls', 'Pineapple Rings', 'Choco Mint', 'Cacao', 'Charlottle Pie', 'Tropic Juice'],
    'Saphhire Crown': ['Yuzu Honey', 'Cream Soda', 'Sunny Peach', 'Classy Aperol', 'Passion Fruit', 'Waffles', 'Crispy Pear', 'Ripe Mango', 'Turbo', 'Hazlenut Crush', 'Alpine Strawberry', 'Apple Strudel', 'Italian Tiramisu', 'Pink Tonic', 'Lavender Tonic', 'Blueberry Granola', 'Creme Caramel', 'Lemon Pie'],
  },
};

// Third Floor layout: approximate x,y grid (0-100). Compatible with future Visual Layout Grounder output.
const FLOORPLAN_F3_NODES = [
  { id: 'KB1', label: 'KB1', type: 'kiosk', x: 12, y: 8, capacity: 2 },
  { id: 'KB2', label: 'KB2', type: 'kiosk', x: 18, y: 8, capacity: 2 },
  { id: 'KB3', label: 'KB3', type: 'kiosk', x: 24, y: 8, capacity: 2 },
  { id: 'KB4', label: 'KB4', type: 'kiosk', x: 30, y: 8, capacity: 2 },
  { id: 'KB5', label: 'KB5', type: 'kiosk', x: 36, y: 8, capacity: 2 },
  { id: '501', label: '501', type: 'table', x: 15, y: 28, capacity: 4 },
  { id: '502', label: '502', type: 'table', x: 22, y: 28, capacity: 4 },
  { id: '601', label: '601', type: 'table', x: 12, y: 48, capacity: 4 },
  { id: '602', label: '602', type: 'table', x: 12, y: 55, capacity: 4 },
  { id: '603', label: '603', type: 'table', x: 12, y: 62, capacity: 4 },
  { id: '401', label: '401', type: 'table', x: 28, y: 52, capacity: 4 },
  { id: '402', label: '402', type: 'table', x: 28, y: 59, capacity: 4 },
  { id: '403', label: '403', type: 'table', x: 28, y: 66, capacity: 4 },
  { id: '701', label: '701', type: 'table', x: 68, y: 52, capacity: 4 },
  { id: '702', label: '702', type: 'table', x: 65, y: 48, capacity: 4 },
  { id: '703', label: '703', type: 'table', x: 62, y: 44, capacity: 4 },
  { id: '704', label: '704', type: 'table', x: 72, y: 44, capacity: 4 },
  { id: '705', label: '705', type: 'table', x: 75, y: 48, capacity: 4 },
  { id: '301', label: '301', type: 'table', x: 90, y: 12, capacity: 4 },
  { id: '302', label: '302', type: 'table', x: 90, y: 18, capacity: 4 },
  { id: '303', label: '303', type: 'table', x: 90, y: 24, capacity: 4 },
  { id: '304', label: '304', type: 'table', x: 90, y: 30, capacity: 4 },
  { id: '305', label: '305', type: 'table', x: 90, y: 36, capacity: 4 },
  { id: '306', label: '306', type: 'table', x: 90, y: 42, capacity: 4 },
  { id: '307', label: '307', type: 'table', x: 90, y: 48, capacity: 4 },
  { id: '308', label: '308', type: 'table', x: 90, y: 54, capacity: 4 },
  { id: '309', label: '309', type: 'table', x: 90, y: 60, capacity: 4 },
  { id: '310', label: '310', type: 'table', x: 90, y: 66, capacity: 4 },
  { id: '311', label: '311', type: 'table', x: 90, y: 72, capacity: 4 },
  { id: '312', label: '312', type: 'table', x: 90, y: 78, capacity: 4 },
  { id: '313', label: '313', type: 'table', x: 90, y: 84, capacity: 4 },
];

async function main() {
  await prisma.pilotConfig.upsert({
    where: { loungeId: LOUNGE_ID_CODIGO },
    update: { configData: PILOT_CONFIG as object },
    create: {
      loungeId: LOUNGE_ID_CODIGO,
      configData: PILOT_CONFIG as object,
    },
  });
  console.log('✅ Pilot config seeded for CODIGO');

  await prisma.floorplanLayout.upsert({
    where: {
      loungeId_floorId: { loungeId: LOUNGE_ID_CODIGO, floorId: 'F3' },
    },
    update: {
      nodes: FLOORPLAN_F3_NODES as object[],
      metadata: { imageRef: null, note: 'Third Floor. Schema compatible with future Visual Layout Grounder output.' },
    },
    create: {
      loungeId: LOUNGE_ID_CODIGO,
      floorId: 'F3',
      nodes: FLOORPLAN_F3_NODES as object[],
      metadata: { imageRef: null, note: 'Third Floor. Schema compatible with future Visual Layout Grounder output.' },
    },
  });
  console.log('✅ Floorplan F3 seeded for CODIGO');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

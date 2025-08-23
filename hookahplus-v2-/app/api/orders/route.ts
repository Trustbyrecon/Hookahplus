import { NextRequest, NextResponse } from 'next/server';

// Types
export type MarginRow = {
  id: string;
  item: string; // flavor / product name
  price: number; // selling price
  cost: number; // unit cost
  sold: number; // count in period
};

// Mock data
const MOCK_MARGINS: MarginRow[] = [
  { id: "m1", item: "Mint Storm", price: 32, cost: 11, sold: 58 },
  { id: "m2", item: "Blue Mist", price: 30, cost: 10, sold: 46 },
  { id: "m3", item: "Double Apple", price: 34, cost: 13, sold: 39 },
  { id: "m4", item: "Grape Burst", price: 28, cost: 9, sold: 27 },
  { id: "m5", item: "Peach Wave", price: 33, cost: 12, sold: 24 },
  { id: "m6", item: "Lemon Mint", price: 31, cost: 10, sold: 35 },
  { id: "m7", item: "Strawberry", price: 29, cost: 8, sold: 42 },
  { id: "m8", item: "Vanilla", price: 27, cost: 7, sold: 38 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lounge = searchParams.get('lounge');
    const range = searchParams.get('range');

    // TODO: Replace with actual database query
    // const orders = await getOrders(lounge, range);
    
    // For now, return mock data with some randomization
    const randomizedMargins: MarginRow[] = MOCK_MARGINS.map(item => ({
      ...item,
      sold: item.sold + Math.floor(Math.random() * 10) - 5,
      price: item.price + (Math.random() * 4) - 2,
      cost: item.cost + (Math.random() * 2) - 1,
    }));

    return NextResponse.json({
      success: true,
      orders: randomizedMargins,
      lounge,
      range,
      timestamp: new Date().toISOString(),
      summary: {
        totalItems: randomizedMargins.length,
        totalSold: randomizedMargins.reduce((sum, item) => sum + item.sold, 0),
        totalRevenue: randomizedMargins.reduce((sum, item) => sum + (item.price * item.sold), 0),
        totalCost: randomizedMargins.reduce((sum, item) => sum + (item.cost * item.sold), 0),
        avgMargin: randomizedMargins.reduce((sum, item) => sum + ((item.price - item.cost) / item.price * 100), 0) / randomizedMargins.length
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        fallback: MOCK_MARGINS 
      },
      { status: 500 }
    );
  }
}

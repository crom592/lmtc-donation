import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 주문 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyerName, buyerPhone, quantity, totalAmount } = body;

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        buyerName,
        buyerPhone,
        quantity,
        totalAmount,
        status: 'pending',
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const buyerPhone = searchParams.get('phone');
    const buyerName = searchParams.get('name');

    const where: Record<string, string> = {};
    
    if (status) where.status = status;
    if (buyerPhone) where.buyerPhone = buyerPhone;
    if (buyerName) where.buyerName = buyerName;

    const orders = await prisma.order.findMany({
      where,
      include: {
        tickets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
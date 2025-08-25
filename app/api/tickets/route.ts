import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 티켓 조회 (이름과 전화번호로)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buyerPhone = searchParams.get('phone');
    const buyerName = searchParams.get('name');

    if (!buyerPhone || !buyerName) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    // 주문 찾기
    const orders = await prisma.order.findMany({
      where: {
        buyerName,
        buyerPhone,
        status: 'paid', // 결제 완료된 주문만
      },
      include: {
        tickets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
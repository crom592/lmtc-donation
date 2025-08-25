import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 주문 상태 업데이트 (입금 확인)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 주문 업데이트
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : undefined,
      },
    });

    // 입금 확인 시 티켓 생성
    if (status === 'paid') {
      // 현재까지 발행된 티켓 수 확인
      const ticketCount = await prisma.ticket.count();
      
      const tickets = [];
      for (let i = 0; i < order.quantity; i++) {
        // 순차적인 티켓 번호 생성 (0001, 0002, 0003...)
        const ticketNumber = String(ticketCount + i + 1).padStart(4, '0');
        tickets.push({
          orderId: order.id,
          ticketNumber,
          status: 'active',
        });
      }

      await prisma.ticket.createMany({
        data: tickets,
      });
    }

    // 업데이트된 주문을 티켓과 함께 반환
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { tickets: true },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// 주문 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 관련 티켓 먼저 삭제
    await prisma.ticket.deleteMany({
      where: { orderId: id },
    });

    // 주문 삭제
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
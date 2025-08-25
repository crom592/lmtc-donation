import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 티켓 사용 처리
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { usedBy } = body;

    // 티켓 확인
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.status === 'used') {
      return NextResponse.json(
        { error: 'Ticket already used', usedAt: ticket.usedAt },
        { status: 400 }
      );
    }

    if (ticket.status !== 'active') {
      return NextResponse.json(
        { error: 'Ticket is not active' },
        { status: 400 }
      );
    }

    // 티켓 사용 처리
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: 'used',
        usedAt: new Date(),
        usedBy: usedBy || 'staff',
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Ticket use error:', error);
    return NextResponse.json(
      { error: 'Failed to use ticket' },
      { status: 500 }
    );
  }
}
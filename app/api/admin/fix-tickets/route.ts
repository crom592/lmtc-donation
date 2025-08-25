import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Admin password check
    const { password } = await request.json();
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting ticket fix...');
    
    // Get all tickets ordered by creation date
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        order: {
          select: {
            buyerName: true,
          }
        }
      }
    });

    console.log(`Found ${tickets.length} tickets to fix`);

    const updates = [];
    
    // Update each ticket with correct sequential number
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const newNumber = String(i + 1).padStart(4, '0');
      
      // Only update if the number is different
      if (ticket.ticketNumber !== newNumber) {
        console.log(`Updating ticket ${ticket.ticketNumber} -> ${newNumber} (${ticket.order.buyerName})`);
        
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { ticketNumber: newNumber }
        });
        
        updates.push({
          old: ticket.ticketNumber,
          new: newNumber,
          buyer: ticket.order.buyerName
        });
      }
    }

    // Verify the fix
    const fixedTickets = await prisma.ticket.findMany({
      orderBy: { ticketNumber: 'asc' },
      select: {
        ticketNumber: true,
        status: true,
        order: {
          select: {
            buyerName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} tickets out of ${tickets.length} total`,
      updates,
      currentTickets: fixedTickets.map(t => ({
        number: t.ticketNumber,
        buyer: t.order.buyerName,
        status: t.status
      }))
    });

  } catch (error) {
    console.error('Fix tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fix tickets' },
      { status: 500 }
    );
  }
}
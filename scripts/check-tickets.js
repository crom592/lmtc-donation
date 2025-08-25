const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTickets() {
  try {
    // Get all tickets
    const tickets = await prisma.ticket.findMany({
      orderBy: { ticketNumber: 'asc' },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        createdAt: true,
        order: {
          select: {
            buyerName: true,
          }
        }
      }
    });

    console.log('\n=== Current Tickets in Database ===');
    console.log('Total tickets:', tickets.length);
    console.log('\nTicket Numbers:');
    
    // Group by ticket number to find duplicates
    const ticketGroups = {};
    tickets.forEach(ticket => {
      const num = ticket.ticketNumber;
      if (!ticketGroups[num]) {
        ticketGroups[num] = [];
      }
      ticketGroups[num].push(ticket);
    });

    // Show all tickets and highlight duplicates
    Object.keys(ticketGroups).sort().forEach(num => {
      const group = ticketGroups[num];
      if (group.length > 1) {
        console.log(`\n❌ DUPLICATE: ${num} (${group.length} tickets)`);
        group.forEach(t => {
          console.log(`   - ID: ${t.id}, Buyer: ${t.order.buyerName}, Status: ${t.status}`);
        });
      } else {
        console.log(`✅ ${num} - ${group[0].order.buyerName} (${group[0].status})`);
      }
    });

    // Find tickets with wrong format (not 4 digits)
    const wrongFormat = tickets.filter(t => {
      return t.ticketNumber.length !== 4 || !/^\d{4}$/.test(t.ticketNumber);
    });

    if (wrongFormat.length > 0) {
      console.log('\n=== Tickets with Wrong Format ===');
      wrongFormat.forEach(t => {
        console.log(`${t.ticketNumber} - ${t.order.buyerName}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTickets();
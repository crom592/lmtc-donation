const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTickets() {
  try {
    console.log('=== Starting Ticket Fix ===\n');
    
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

    console.log(`Found ${tickets.length} tickets to fix\n`);

    // Update each ticket with correct sequential number
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const newNumber = String(i + 1).padStart(4, '0');
      
      console.log(`Updating ticket ${ticket.ticketNumber} -> ${newNumber} (${ticket.order.buyerName})`);
      
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { ticketNumber: newNumber }
      });
    }

    console.log('\n=== Verification ===');
    
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

    console.log('\nFixed tickets:');
    fixedTickets.forEach(t => {
      console.log(`✅ ${t.ticketNumber} - ${t.order.buyerName} (${t.status})`);
    });

    console.log('\n✅ All tickets have been fixed!');

  } catch (error) {
    console.error('Error fixing tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('This will renumber all tickets sequentially. Continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    fixTickets();
  } else {
    console.log('Operation cancelled.');
    process.exit(0);
  }
  rl.close();
});
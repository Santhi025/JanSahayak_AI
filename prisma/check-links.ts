import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schemes = await prisma.scheme.findMany({
    select: { id: true, name: true, application_link: true, offline_process: true }
  });

  const withLink = schemes.filter(s => s.application_link && s.application_link.trim());
  const withoutLink = schemes.filter(s => !s.application_link || !s.application_link.trim());

  console.log(`\nTotal schemes: ${schemes.length}`);
  console.log(`With application_link: ${withLink.length}`);
  console.log(`Without application_link: ${withoutLink.length}\n`);

  console.log('--- SCHEMES WITHOUT OFFICIAL LINK ---');
  withoutLink.forEach(s => {
    console.log(`  [${s.id}] ${s.name}`);
  });

  console.log('\n--- SCHEMES WITH LINK (sample 10) ---');
  withLink.slice(0, 10).forEach(s => {
    console.log(`  [${s.id}] ${s.name}\n    -> ${s.application_link}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

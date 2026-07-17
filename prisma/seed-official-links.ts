/**
 * seed-official-links.ts
 * 
 * Seeds official government portal URLs for known Indian government schemes.
 * These URLs are curated from well-known official government portals.
 * Schemes not in this list will use the Google Search fallback in the frontend.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated official links for major Indian government schemes
// Key = scheme ID in database (slug format)
const OFFICIAL_LINKS: Record<string, string> = {
  // Central Schemes - Agriculture
  'pm-fasal-bima-yojana': 'https://pmfby.gov.in/',
  'pm-kisan': 'https://pmkisan.gov.in/',
  'soil-health-card': 'https://soilhealth.dac.gov.in/',
  'kisan-credit-card': 'https://www.nabard.org/content.aspx?id=596',
  'pradhan-mantri-krishi-sinchayee-yojana': 'https://pmksy.gov.in/',
  'paramparagat-krishi-vikas-yojana': 'https://pgsindia-ncof.gov.in/pkvy/Index.aspx',
  'national-food-security-mission': 'https://nfsm.gov.in/',
  'rashtriya-krishi-vikas-yojana': 'https://rkvy.nic.in/',
  'agricultural-infrastructure-fund': 'https://agriinfra.dac.gov.in/',
  'ysr-rythu-bharosa': 'https://ysrrythubharosa.ap.gov.in/',
  'weather-based-crop-insurance-scheme': 'https://pmfby.gov.in/',
  'wire-fencing-around-the-farm-for-crop-protection': 'https://mkisan.gov.in/',
  'zero-budget-natural-farming': 'https://naturalfarming.dac.gov.in/',

  // Education & Scholarships
  'national-scholarship-portal': 'https://scholarships.gov.in/',
  'pm-yasasvi': 'https://yet.nta.ac.in/',
  'aicte-pragati': 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati-Scholarship-Scheme',
  'post-matric-scholarship-sc-students': 'https://scholarships.gov.in/',
  'pre-matric-scholarship-sc-students': 'https://scholarships.gov.in/',
  'central-sector-scheme-of-scholarship': 'https://scholarships.gov.in/',
  'national-means-cum-merit-scholarship': 'https://scholarships.gov.in/',
  'prime-ministers-scholarship-scheme': 'https://scholarships.gov.in/',
  'ishan-uday': 'https://scholarships.gov.in/',
  'vidyasiri-food-and-accommodation-scholarship-scheme': 'https://ssp.postmatric.karnataka.gov.in/',
  'west-bengal-student-credit-card-scheme': 'https://wbscc.wb.gov.in/',
  'wise-fellowship-for-ph-d': 'https://online-wosa.gov.in/',
  'women-scientist-scheme-a': 'https://online-wosa.gov.in/',
  'women-scientist-scheme-c': 'https://online-wosa.gov.in/',
  'young-investigators-programme-in-biotechnology': 'https://dbtindia.gov.in/',
  'vocational-education-and-training-loan-scheme': 'https://www.nabard.org/',
  'youth-art-training-fellowship-scheme': 'https://ccrt.gov.in/',

  // Labour & Employment
  'e-shram': 'https://eshram.gov.in/',
  'pm-shram-yogi-maandhan': 'https://maandhan.in/shramyogi',
  'atal-pension-yojana': 'https://npscra.nsdl.co.in/scheme-details.php',
  'employees-provident-fund': 'https://www.epfindia.gov.in/',
  'employees-state-insurance': 'https://www.esic.in/',
  'pradhan-mantri-rojgar-protsahan-yojana': 'https://pmrpy.gov.in/',
  'national-rural-employment-guarantee': 'https://nreganarep.nic.in/',
  'mnrega': 'https://nrega.nic.in/',
  'mgnregs': 'https://nrega.nic.in/',
  'national-career-service-portal': 'https://www.ncs.gov.in/',
  'skill-india-mission': 'https://www.skillindia.gov.in/',
  'pradhan-mantri-kaushal-vikas-yojana': 'https://www.pmkvyofficial.org/',
  'deen-dayal-upadhyaya-grameen-kaushalya-yojana': 'https://ddugky.gov.in/',
  'young-interns-program': 'https://mygov.in/',
  'youth-engagement-through-empowered-youth-organisations-yess': 'https://nyks.nic.in/',

  // Health & Maternity
  'pmmvy': 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana',
  'pradhan-mantri-matru-vandana-yojana': 'https://pmmvy.nic.in/',
  'ayushman-bharat': 'https://pmjay.gov.in/',
  'pm-jan-arogya-yojana': 'https://pmjay.gov.in/',
  'janani-suraksha-yojana': 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
  'pradhan-mantri-surakshit-matritva-abhiyan': 'https://pmsma.nhm.gov.in/',
  'national-health-mission': 'https://nhm.gov.in/',
  'weekly-iron-folic-acid-tablets-free-distribution-uttarakhand': 'https://nhm.gov.in/',
  'yoga-wellness-center': 'https://ayush.gov.in/',

  // Pension & Social Security
  'ignoaps': 'https://nsap.nic.in/',
  'national-social-assistance-programme': 'https://nsap.nic.in/',
  'pm-vaya-vandana-yojana': 'https://licindia.in/Products/Pension-Plans/PM-Vaya-Vandana-Yojana',
  'indira-gandhi-national-widow-pension-scheme': 'https://nsap.nic.in/',
  'widow-destitute-women-pension-scheme-punjab': 'https://socialsecuritypb.gov.in/',
  'widow-pension-cbocwwb': 'https://bocw.labour.gov.in/',
  'widow-abandoned-single-woman-pension-scheme': 'https://nsap.nic.in/',
  'viswakarma-pension-scheme': 'https://pmvishwakarma.gov.in/',
  'vishesh-samman-pension-yojana-for-the-state-agitators-who-became-disabled-and-completely-bedridden-during-the-uttarakhand-state-movement': 'https://socialwelfare.uk.gov.in/',

  // Housing
  'pradhan-mantri-awas-yojana': 'https://pmaymis.gov.in/',
  'pm-awas-yojana-urban': 'https://pmaymis.gov.in/',
  'pm-awas-yojana-gramin': 'https://pmayg.nic.in/',

  // Financial Inclusion
  'pm-jan-dhan-yojana': 'https://pmjdy.gov.in/',
  'pradhan-mantri-jeevan-jyoti-bima': 'https://jansuraksha.gov.in/',
  'pradhan-mantri-suraksha-bima': 'https://jansuraksha.gov.in/',
  'pm-mudra-yojana': 'https://www.mudra.org.in/',
  'stand-up-india': 'https://www.standupmitra.in/',
  'startup-india': 'https://www.startupindia.gov.in/',

  // Women & Child
  'beti-bachao-beti-padhao': 'https://wcd.nic.in/bbbp-schemes',
  'sukanya-samriddhi-yojana': 'https://www.nsiindia.gov.in/',
  'one-stop-centre': 'https://wcd.nic.in/schemes/one-stop-centre-scheme',
  'women-helpline': 'https://wcd.nic.in/schemes/universalization-women-helpline',
  'integrated-child-development-services': 'https://wcd.nic.in/schemes/icds',
  'pm-poshan': 'https://pmposhan.education.gov.in/',
  'welfare-services-for-women': 'https://wcd.nic.in/',
  'welfare-services-for-children': 'https://wcd.nic.in/',
  'welfare-services-for-disabled-persons': 'https://disabilityaffairs.gov.in/',
  'welfare-measures-for-children-of-labourers': 'https://labour.gov.in/',
  'vocational-training-of-destitute-women-and-adolescent-girls': 'https://wcd.nic.in/',
  'women-involvement-in-science-and-engineering-research': 'https://online-wosa.gov.in/',
  "women-s-instinct-for-developing-and-ushering-in-scientific-heights-innovation": 'https://online-wosa.gov.in/',
  'zero-ticket-bus-travel-scheme-for-women': 'https://delhi.gov.in/',
  'widow-daughter-marriage-scheme': 'https://socialsecurity.rajasthan.gov.in/',
  'widow-re-marriage-scheme': 'https://wcd.nic.in/',

  // Digital & Technology
  'digital-india': 'https://www.digitalindia.gov.in/',
  'common-service-centres': 'https://www.csc.gov.in/',
  'pm-wani': 'https://dot.gov.in/',

  // Disability
  'national-scholarship-for-persons-with-disabilities': 'https://scholarships.gov.in/',
  'assistive-devices-scheme': 'https://alimco.in/',
  'workers-in-case-of-permanent-disablement-jkbocwwb': 'https://bocw.labour.gov.in/',

  // Minority & Backward Classes
  'pre-matric-scholarship-minorities': 'https://minorityaffairs.gov.in/',
  'post-matric-scholarship-minorities': 'https://scholarships.gov.in/',
  'maulana-azad-education-foundation': 'https://maef.nic.in/',
  'seekho-aur-kamao': 'https://minorityaffairs.gov.in/',
  'naya-savera': 'https://minorityaffairs.gov.in/',

  // Fishermen
  'pradhan-mantri-matsya-sampada-yojana': 'https://pmmsy.dof.gov.in/',
  'kisan-credit-card-for-fishermen': 'https://dof.gov.in/',
  'immediate-relief-assistance-under-welfare-and-relief-for-fishermen-during-lean-seasons-and-natural-calamities-scheme': 'https://dof.gov.in/',
  'whale-shark-conservation-programme': 'https://forest.gujarat.gov.in/',

  // MSME & Business
  'khadi-gramodyog-vikas-yojana-khadi-vikas-yojana': 'https://www.kviconline.gov.in/',
  'west-bengal-incentive-scheme-for-approved-industrial-park-saip-for-msmes-reimbursement-of-stamp-duty': 'https://www.wbidc.com/',
  'west-bengal-incentive-scheme-for-approved-industrial-park-saip-for-msmes-incentive-for-setting-up-a-power-sub-station': 'https://www.wbidc.com/',
  'west-bengal-incentive-scheme-for-approved-industrial-park-saip-for-msmes-incentive-for-common-effluent-treatment-plant-cetp': 'https://www.wbidc.com/',
  'west-bengal-incentive-scheme-for-approved-industrial-park-saip-for-msmes-incentive-for-basic-and-essential-common-infrastructure-facilities': 'https://www.wbidc.com/',
  'west-bengal-incentive-scheme-for-approved-industrial-park-saip-for-msmes-construction-of-approach-road': 'https://www.wbidc.com/',
  'vishesh-katan-vankari-vanat-sahay-spinning-weaving-assistance-scheme': 'https://www.gujtextboard.com/',

  // Transport Workers
  'yatra-pass-in-dtc-non-ac-buses-for-the-construction-workers': 'https://bocw.delhi.gov.in/',
  'west-bengal-transport-workers-social-security-scheme-assistance-on-hospitalization': 'https://wblabour.gov.in/',
  'west-bengal-transport-workers-social-security-scheme-pension': 'https://wblabour.gov.in/',
  'west-bengal-transport-workers-social-security-scheme-medical-benefit-for-major-ailments': 'https://wblabour.gov.in/',

  // Migrant Workers
  'west-bengal-migrant-workers-welfare-scheme-accidental-disability': 'https://wblabour.gov.in/',
  'west-bengal-migrant-workers-welfare-scheme-cremation': 'https://wblabour.gov.in/',

  // Artisans / Crafts
  'pm-vishwakarma': 'https://pmvishwakarma.gov.in/',
  'west-bengal-artisans-financial-benefit-scheme-2024-grant-to-industrial-cooperative-society': 'https://wbmsme.gov.in/',
  'west-bengal-handloom-and-khadi-weavers-financial-benefit-scheme-2024-support-for-one-time-settlement-ots-of-npa-accounts-of-pwcs': 'https://wbmsme.gov.in/',

  // Water & Sanitation
  'jal-jeevan-mission': 'https://jaljeevanmission.gov.in/',
  'swachh-bharat-mission': 'https://swachhbharatmission.gov.in/',
  'water-connection-for-100-to-bpl-poor-families-residing-in-urban-areas-of-uttarakhand': 'https://udd.uk.gov.in/',
  'world-bank-funded-uttarakhand-drinking-water-programme-for-semi-urban-areas': 'https://ujvnl.com/',

  // Other / State-specific
  'vidya-scheme': 'https://scholarships.gov.in/',
  'yatra-anudan': 'https://labour.gujarat.gov.in/',
  'yuvasree-prakalpa': 'https://wb.gov.in/',
  'yashwantrao-chavan-mukta-vasahat-yojana-for-vjnts': 'https://sjsa.maharashtra.gov.in/',
  'yuvak-mangal-dal-and-mahila-mangal-dal-swavalamban-yojana': 'https://yd.maharashtra.gov.in/',
  'yuva-srujan-puraskar-navsarjan-chetana-puraskar': 'https://gujaratculture.gov.in/',
  'youth-hostel-scheme': 'https://tourismindia.com/',
  'youth-and-eco-club': 'https://moef.gov.in/',
  'young-achievers-awards': 'https://nyks.nic.in/',
  'vehicle-loan-scheme-gtkvn': 'https://gtkvn.gujarat.gov.in/',
  'vocational-training-of-destitute-women-and-adolescent-girls': 'https://wcd.nic.in/',
  'winter-cropping-development-of-cultivable-land-scheme': 'https://agri.rajasthan.gov.in/',
  'world-war-ii-pension': 'https://ksb.gov.in/',
  'workers-for-class-9th-to-12th-through-national-scholarship-jkbocwwb': 'https://bocw.labour.gov.in/',
  'vivah-sahayata-yojana': 'https://bocw.labour.gov.in/',
};

async function main() {
  console.log('🔍 Fetching all schemes from database...');
  const schemes = await prisma.scheme.findMany({
    select: { id: true, name: true, application_link: true }
  });

  console.log(`📋 Total schemes: ${schemes.length}`);
  console.log(`🗂  Known official links to seed: ${Object.keys(OFFICIAL_LINKS).length}\n`);

  let updated = 0;
  let alreadyHad = 0;
  let notFound = 0;

  for (const scheme of schemes) {
    const knownLink = OFFICIAL_LINKS[scheme.id];

    if (knownLink) {
      if (scheme.application_link === knownLink) {
        alreadyHad++;
        continue;
      }
      try {
        await prisma.scheme.update({
          where: { id: scheme.id },
          data: { application_link: knownLink }
        });
        console.log(`  ✅ ${scheme.name}`);
        console.log(`     -> ${knownLink}`);
        updated++;
      } catch (e) {
        console.error(`  ❌ Failed to update ${scheme.name}:`, e);
      }
    } else {
      notFound++;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Newly updated with official links: ${updated}`);
  console.log(`   Already had correct link: ${alreadyHad}`);
  console.log(`   Not in curated list (will use Google Search fallback): ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

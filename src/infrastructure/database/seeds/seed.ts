import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://nasif:1234@localhost:5433/voymate';

const adapter = new PrismaPg({
  connectionString,
  ssl: false,
});

const prisma = new PrismaClient({ adapter });

const ROLES = [
  {
    name: 'SUPER_ADMIN',
    description: 'Super Administrator with full system privileges',
  },
  {
    name: 'MODERATOR',
    description:
      'Moderator handling user moderation, support, and identity verifications',
  },
  {
    name: 'ANALYST',
    description:
      'Analyst with read-only access to dashboards, reports, and logs',
  },
];

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', phonePrefix: '+93', flagEmoji: '🇦🇫' },
  { code: 'AL', name: 'Albania', phonePrefix: '+355', flagEmoji: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', phonePrefix: '+213', flagEmoji: '🇩🇿' },
  { code: 'AD', name: 'Andorra', phonePrefix: '+376', flagEmoji: '🇦🇩' },
  { code: 'AO', name: 'Angola', phonePrefix: '+244', flagEmoji: '🇦🇴' },
  { code: 'AR', name: 'Argentina', phonePrefix: '+54', flagEmoji: '🇦🇷' },
  { code: 'AM', name: 'Armenia', phonePrefix: '+374', flagEmoji: '🇦🇲' },
  { code: 'AU', name: 'Australia', phonePrefix: '+61', flagEmoji: '🇦🇺' },
  { code: 'AT', name: 'Austria', phonePrefix: '+43', flagEmoji: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', phonePrefix: '+994', flagEmoji: '🇦🇿' },
  { code: 'BH', name: 'Bahrain', phonePrefix: '+973', flagEmoji: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', phonePrefix: '+880', flagEmoji: '🇧🇩' },
  { code: 'BY', name: 'Belarus', phonePrefix: '+375', flagEmoji: '🇧🇾' },
  { code: 'BE', name: 'Belgium', phonePrefix: '+32', flagEmoji: '🇧🇪' },
  { code: 'BZ', name: 'Belize', phonePrefix: '+501', flagEmoji: '🇧🇿' },
  { code: 'BT', name: 'Bhutan', phonePrefix: '+975', flagEmoji: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', phonePrefix: '+591', flagEmoji: '🇧🇴' },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    phonePrefix: '+387',
    flagEmoji: '🇧🇦',
  },
  { code: 'BW', name: 'Botswana', phonePrefix: '+267', flagEmoji: '🇧🇼' },
  { code: 'BR', name: 'Brazil', phonePrefix: '+55', flagEmoji: '🇧🇷' },
  { code: 'BG', name: 'Bulgaria', phonePrefix: '+359', flagEmoji: '🇧🇬' },
  { code: 'KH', name: 'Cambodia', phonePrefix: '+855', flagEmoji: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', phonePrefix: '+237', flagEmoji: '🇨🇲' },
  { code: 'CA', name: 'Canada', phonePrefix: '+1', flagEmoji: '🇨🇦' },
  { code: 'CL', name: 'Chile', phonePrefix: '+56', flagEmoji: '🇨🇱' },
  { code: 'CN', name: 'China', phonePrefix: '+86', flagEmoji: '🇨🇳' },
  { code: 'CO', name: 'Colombia', phonePrefix: '+57', flagEmoji: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', phonePrefix: '+506', flagEmoji: '🇨🇷' },
  { code: 'HR', name: 'Croatia', phonePrefix: '+385', flagEmoji: '🇭🇷' },
  { code: 'CU', name: 'Cuba', phonePrefix: '+53', flagEmoji: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', phonePrefix: '+357', flagEmoji: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', phonePrefix: '+420', flagEmoji: '🇨🇿' },
  { code: 'DK', name: 'Denmark', phonePrefix: '+45', flagEmoji: '🇩🇰' },
  { code: 'EC', name: 'Ecuador', phonePrefix: '+593', flagEmoji: '🇪🇨' },
  { code: 'EG', name: 'Egypt', phonePrefix: '+20', flagEmoji: '🇪🇬' },
  { code: 'EE', name: 'Estonia', phonePrefix: '+372', flagEmoji: '🇪🇪' },
  { code: 'ET', name: 'Ethiopia', phonePrefix: '+251', flagEmoji: '🇪🇹' },
  { code: 'FI', name: 'Finland', phonePrefix: '+358', flagEmoji: '🇫🇮' },
  { code: 'FR', name: 'France', phonePrefix: '+33', flagEmoji: '🇫🇷' },
  { code: 'GE', name: 'Georgia', phonePrefix: '+995', flagEmoji: '🇬🇪' },
  { code: 'DE', name: 'Germany', phonePrefix: '+49', flagEmoji: '🇩🇪' },
  { code: 'GH', name: 'Ghana', phonePrefix: '+233', flagEmoji: '🇬🇭' },
  { code: 'GR', name: 'Greece', phonePrefix: '+30', flagEmoji: '🇬🇷' },
  { code: 'GT', name: 'Guatemala', phonePrefix: '+502', flagEmoji: '🇬🇹' },
  { code: 'HK', name: 'Hong Kong', phonePrefix: '+852', flagEmoji: '🇭🇰' },
  { code: 'HU', name: 'Hungary', phonePrefix: '+36', flagEmoji: '🇭🇺' },
  { code: 'IS', name: 'Iceland', phonePrefix: '+354', flagEmoji: '🇮🇸' },
  { code: 'IN', name: 'India', phonePrefix: '+91', flagEmoji: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', phonePrefix: '+62', flagEmoji: '🇮🇩' },
  { code: 'IR', name: 'Iran', phonePrefix: '+98', flagEmoji: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', phonePrefix: '+964', flagEmoji: '🇮🇶' },
  { code: 'IE', name: 'Ireland', phonePrefix: '+353', flagEmoji: '🇮🇪' },
  { code: 'IL', name: 'Israel', phonePrefix: '+972', flagEmoji: '🇮🇱' },
  { code: 'IT', name: 'Italy', phonePrefix: '+39', flagEmoji: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', phonePrefix: '+1-876', flagEmoji: '🇯🇲' },
  { code: 'JP', name: 'Japan', phonePrefix: '+81', flagEmoji: '🇯🇵' },
  { code: 'JO', name: 'Jordan', phonePrefix: '+962', flagEmoji: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', phonePrefix: '+7', flagEmoji: '🇰🇿' },
  { code: 'KE', name: 'Kenya', phonePrefix: '+254', flagEmoji: '🇰🇪' },
  { code: 'KW', name: 'Kuwait', phonePrefix: '+965', flagEmoji: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', phonePrefix: '+996', flagEmoji: '🇰🇬' },
  { code: 'LA', name: 'Laos', phonePrefix: '+856', flagEmoji: '🇱🇦' },
  { code: 'LV', name: 'Latvia', phonePrefix: '+371', flagEmoji: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', phonePrefix: '+961', flagEmoji: '🇱🇧' },
  { code: 'LT', name: 'Lithuania', phonePrefix: '+370', flagEmoji: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', phonePrefix: '+352', flagEmoji: '🇱🇺' },
  { code: 'MY', name: 'Malaysia', phonePrefix: '+60', flagEmoji: '🇲🇾' },
  { code: 'MV', name: 'Maldives', phonePrefix: '+960', flagEmoji: '🇲🇻' },
  { code: 'MX', name: 'Mexico', phonePrefix: '+52', flagEmoji: '🇲🇽' },
  { code: 'MC', name: 'Monaco', phonePrefix: '+377', flagEmoji: '🇲🇨' },
  { code: 'MA', name: 'Morocco', phonePrefix: '+212', flagEmoji: '🇲🇦' },
  { code: 'NP', name: 'Nepal', phonePrefix: '+977', flagEmoji: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', phonePrefix: '+31', flagEmoji: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', phonePrefix: '+64', flagEmoji: '🇳🇿' },
  { code: 'NO', name: 'Norway', phonePrefix: '+47', flagEmoji: '🇳🇴' },
  { code: 'OM', name: 'Oman', phonePrefix: '+968', flagEmoji: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', phonePrefix: '+92', flagEmoji: '🇵🇰' },
  { code: 'PA', name: 'Panama', phonePrefix: '+507', flagEmoji: '🇵🇦' },
  { code: 'PE', name: 'Peru', phonePrefix: '+51', flagEmoji: '🇵🇪' },
  { code: 'PH', name: 'Philippines', phonePrefix: '+63', flagEmoji: '🇵🇭' },
  { code: 'PL', name: 'Poland', phonePrefix: '+48', flagEmoji: '🇵🇱' },
  { code: 'PT', name: 'Portugal', phonePrefix: '+351', flagEmoji: '🇵🇹' },
  { code: 'QA', name: 'Qatar', phonePrefix: '+974', flagEmoji: '🇶🇦' },
  { code: 'RO', name: 'Romania', phonePrefix: '+40', flagEmoji: '🇷🇴' },
  { code: 'RU', name: 'Russia', phonePrefix: '+7', flagEmoji: '🇷🇺' },
  { code: 'SA', name: 'Saudi Arabia', phonePrefix: '+966', flagEmoji: '🇸🇦' },
  { code: 'RS', name: 'Serbia', phonePrefix: '+381', flagEmoji: '🇷🇸' },
  { code: 'SG', name: 'Singapore', phonePrefix: '+65', flagEmoji: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', phonePrefix: '+27', flagEmoji: '🇿🇦' },
  { code: 'KR', name: 'South Korea', phonePrefix: '+82', flagEmoji: '🇰🇷' },
  { code: 'ES', name: 'Spain', phonePrefix: '+34', flagEmoji: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', phonePrefix: '+94', flagEmoji: '🇱🇰' },
  { code: 'SE', name: 'Sweden', phonePrefix: '+46', flagEmoji: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', phonePrefix: '+41', flagEmoji: '🇨🇭' },
  { code: 'TW', name: 'Taiwan', phonePrefix: '+886', flagEmoji: '🇹🇼' },
  { code: 'TH', name: 'Thailand', phonePrefix: '+66', flagEmoji: '🇹🇭' },
  { code: 'TR', name: 'Turkey', phonePrefix: '+90', flagEmoji: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', phonePrefix: '+380', flagEmoji: '🇺🇦' },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    phonePrefix: '+971',
    flagEmoji: '🇦🇪',
  },
  { code: 'GB', name: 'United Kingdom', phonePrefix: '+44', flagEmoji: '🇬🇧' },
  { code: 'US', name: 'United States', phonePrefix: '+1', flagEmoji: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', phonePrefix: '+84', flagEmoji: '🇻🇳' },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  console.log(`Seeding ${ROLES.length} roles...`);
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('✓ Roles seeded successfully.');

  console.log(`Seeding ${COUNTRIES.length} countries...`);
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
        phonePrefix: country.phonePrefix,
        flagEmoji: country.flagEmoji,
      },
      create: country,
    });
  }
  console.log('✓ Countries seeded successfully.');

  console.log('✨ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

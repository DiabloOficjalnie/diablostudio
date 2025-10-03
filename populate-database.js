#!/usr/bin/env node

// Script to populate DiabloStudio database with initial data
// This script will add default colors, sample reviews, and sample realizations

const fs = require('fs');
const path = require('path');

console.log('🚀 DiabloStudio Database Population Script');
console.log('==========================================');
console.log('');
console.log('This script will help you populate your database with:');
console.log('• 87 default colors (RAL, quartz sands, decorative chips)');
console.log('• Sample customer reviews');
console.log('• Sample project realizations');
console.log('• Set up your admin user account');
console.log('');
console.log('📋 INSTRUCTIONS:');
console.log('');
console.log('1. COLORS - Copy and run this SQL in Supabase SQL Editor:');
console.log('');

// Read and display the colors data
const colorsData = [
  // Yellows
  { code: 'RAL 1000', name: 'Green beige', hex: '#C2B078', rgb_r: 194, rgb_g: 176, rgb_b: 120, category: 'yellow' },
  { code: 'RAL 1001', name: 'Beige', hex: '#C2B078', rgb_r: 194, rgb_g: 176, rgb_b: 120, category: 'yellow' },
  { code: 'RAL 1002', name: 'Sand yellow', hex: '#C6A664', rgb_r: 198, rgb_g: 166, rgb_b: 100, category: 'yellow' },
  { code: 'RAL 1003', name: 'Signal yellow', hex: '#F8A800', rgb_r: 248, rgb_g: 168, rgb_b: 0, category: 'yellow' },
  { code: 'RAL 1004', name: 'Golden yellow', hex: '#E5B63F', rgb_r: 229, rgb_g: 182, rgb_b: 63, category: 'yellow' },
  { code: 'RAL 1005', name: 'Honey yellow', hex: '#C89F04', rgb_r: 200, rgb_g: 159, rgb_b: 4, category: 'yellow' },
  { code: 'RAL 1006', name: 'Maize yellow', hex: '#C9A304', rgb_r: 201, rgb_g: 163, rgb_b: 4, category: 'yellow' },
  { code: 'RAL 1007', name: 'Daffodil yellow', hex: '#DC9D00', rgb_r: 220, rgb_g: 157, rgb_b: 0, category: 'yellow' },

  // Oranges
  { code: 'RAL 2000', name: 'Yellow orange', hex: '#DD7F2E', rgb_r: 221, rgb_g: 127, rgb_b: 46, category: 'orange' },
  { code: 'RAL 2001', name: 'Red orange', hex: '#C04F2F', rgb_r: 192, rgb_g: 79, rgb_b: 47, category: 'orange' },
  { code: 'RAL 2002', name: 'Vermilion', hex: '#C3592C', rgb_r: 195, rgb_g: 89, rgb_b: 44, category: 'orange' },
  { code: 'RAL 2003', name: 'Pastel orange', hex: '#F5A638', rgb_r: 245, rgb_g: 166, rgb_b: 56, category: 'orange' },
  { code: 'RAL 2004', name: 'Pure orange', hex: '#E75B2F', rgb_r: 231, rgb_g: 91, rgb_b: 47, category: 'orange' },

  // Reds
  { code: 'RAL 3000', name: 'Flame red', hex: '#AF2B1E', rgb_r: 175, rgb_g: 43, rgb_b: 30, category: 'red' },
  { code: 'RAL 3001', name: 'Signal red', hex: '#A52019', rgb_r: 165, rgb_g: 32, rgb_b: 25, category: 'red' },
  { code: 'RAL 3002', name: 'Carmine red', hex: '#A2231D', rgb_r: 162, rgb_g: 35, rgb_b: 29, category: 'red' },
  { code: 'RAL 3003', name: 'Ruby red', hex: '#9B2321', rgb_r: 155, rgb_g: 35, rgb_b: 33, category: 'red' },
  { code: 'RAL 3004', name: 'Purple red', hex: '#75151E', rgb_r: 117, rgb_g: 21, rgb_b: 30, category: 'red' },
  { code: 'RAL 3005', name: 'Wine red', hex: '#5E2129', rgb_r: 94, rgb_g: 33, rgb_b: 41, category: 'red' },

  // Quartz Sands (Weber) - M series
  { code: 'Piasek kwarcowy M01', name: 'Piasek kwarcowy MIX', hex: '#F8F6F0', rgb_r: 248, rgb_g: 246, rgb_b: 240, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_01.jpg' },
  { code: 'Piasek kwarcowy M02', name: 'Piasek kwarcowy MIX', hex: '#E8E4D8', rgb_r: 232, rgb_g: 228, rgb_b: 216, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_02.jpg' },
  { code: 'Piasek kwarcowy M03', name: 'Piasek kwarcowy MIX', hex: '#D0C8B8', rgb_r: 208, rgb_g: 200, rgb_b: 184, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_03.jpg' },
  { code: 'Piasek kwarcowy M04', name: 'Piasek kwarcowy MIX', hex: '#E6D7C3', rgb_r: 230, rgb_g: 215, rgb_b: 195, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_04.jpg' },
  { code: 'Piasek kwarcowy M05', name: 'Piasek kwarcowy MIX', hex: '#C4A882', rgb_r: 196, rgb_g: 168, rgb_b: 130, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_05.jpg' },
  { code: 'Piasek kwarcowy M06', name: 'Piasek kwarcowy MIX', hex: '#A68B5B', rgb_r: 166, rgb_g: 139, rgb_b: 91, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_06.jpg' },
  { code: 'Piasek kwarcowy M07', name: 'Piasek kwarcowy MIX', hex: '#D2A4A4', rgb_r: 210, rgb_g: 164, rgb_b: 164, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_07.jpg' },
  { code: 'Piasek kwarcowy M08', name: 'Piasek kwarcowy MIX', hex: '#A8C8A8', rgb_r: 168, rgb_g: 200, rgb_b: 168, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_08.jpg' },
  { code: 'Piasek kwarcowy M09', name: 'Piasek kwarcowy MIX', hex: '#A8B8C8', rgb_r: 168, rgb_g: 184, rgb_b: 200, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_09.jpg' },
  { code: 'Piasek kwarcowy M10', name: 'Piasek kwarcowy MIX', hex: '#F4E4A6', rgb_r: 244, rgb_g: 228, rgb_b: 166, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_10.jpg' },
  { code: 'Piasek kwarcowy M11', name: 'Piasek kwarcowy MIX', hex: '#C0C0C0', rgb_r: 192, rgb_g: 192, rgb_b: 192, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_11.jpg' },
  { code: 'Piasek kwarcowy M12', name: 'Piasek kwarcowy MIX', hex: '#B87333', rgb_r: 184, rgb_g: 115, rgb_b: 51, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_12.jpg' },
  { code: 'Piasek kwarcowy M13', name: 'Piasek kwarcowy MIX', hex: '#708090', rgb_r: 112, rgb_g: 128, rgb_b: 144, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_13.jpg' },
  { code: 'Piasek kwarcowy M14', name: 'Piasek kwarcowy MIX', hex: '#2F4F4F', rgb_r: 47, rgb_g: 79, rgb_b: 79, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_14.jpg' },
  { code: 'Piasek kwarcowy M15', name: 'Piasek kwarcowy MIX', hex: '#F5F5DC', rgb_r: 245, rgb_g: 245, rgb_b: 220, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_15.jpg' },
  { code: 'Piasek kwarcowy M16', name: 'Piasek kwarcowy MIX', hex: '#808000', rgb_r: 128, rgb_g: 128, rgb_b: 0, category: 'sand', image_path: '/assets/Piaski/webersys mix PU M_16.jpg' },

  // Decorative Chips
  { code: 'Chips 01', name: 'Dekoracyjne chips 01', hex: '#8B4513', rgb_r: 139, rgb_g: 69, rgb_b: 19, category: 'chips', image_path: '/assets/Chips/webersys chips_01.jpg' },
  { code: 'Chips 02', name: 'Dekoracyjne chips 02', hex: '#A0522D', rgb_r: 160, rgb_g: 82, rgb_b: 45, category: 'chips', image_path: '/assets/Chips/webersys chips_02.jpg' },
  { code: 'Chips 03', name: 'Dekoracyjne chips 03', hex: '#CD853F', rgb_r: 205, rgb_g: 133, rgb_b: 63, category: 'chips', image_path: '/assets/Chips/webersys chips_03.jpg' },
  { code: 'Chips 05', name: 'Dekoracyjne chips 05', hex: '#D2691E', rgb_r: 210, rgb_g: 105, rgb_b: 30, category: 'chips', image_path: '/assets/Chips/webersys chips_05.jpg' },
  { code: 'Chips 07', name: 'Dekoracyjne chips 07', hex: '#8B0000', rgb_r: 139, rgb_g: 0, rgb_b: 0, category: 'chips', image_path: '/assets/Chips/webersys chips_07.jpg' },
  { code: 'Chips 08', name: 'Dekoracyjne chips 08', hex: '#FF6347', rgb_r: 255, rgb_g: 99, rgb_b: 71, category: 'chips', image_path: '/assets/Chips/webersys chips_08.jpg' },
  { code: 'Chips 09', name: 'Dekoracyjne chips 09', hex: '#4169E1', rgb_r: 65, rgb_g: 105, rgb_b: 225, category: 'chips', image_path: '/assets/Chips/webersys chips_09.jpg' },
  { code: 'Chips 10', name: 'Dekoracyjne chips 10', hex: '#32CD32', rgb_r: 50, rgb_g: 205, rgb_b: 50, category: 'chips', image_path: '/assets/Chips/webersys chips_10.jpg' },
  { code: 'Chips 11', name: 'Dekoracyjne chips 11', hex: '#FFD700', rgb_r: 255, rgb_g: 215, rgb_b: 0, category: 'chips', image_path: '/assets/Chips/webersys chips_11.jpg' },
  { code: 'Chips 12', name: 'Dekoracyjne chips 12', hex: '#C0C0C0', rgb_r: 192, rgb_g: 192, rgb_b: 192, category: 'chips', image_path: '/assets/Chips/webersys chips_12.jpg' },
  { code: 'Chips 13', name: 'Dekoracyjne chips 13', hex: '#800080', rgb_r: 128, rgb_g: 0, rgb_b: 128, category: 'chips', image_path: '/assets/Chips/webersys chips_13.jpg' },
  { code: 'Chips 16', name: 'Dekoracyjne chips 16', hex: '#008080', rgb_r: 0, rgb_g: 128, rgb_b: 128, category: 'chips', image_path: '/assets/Chips/webersys chips_16.jpg' },
  { code: 'Chips 17', name: 'Dekoracyjne chips 17', hex: '#FF1493', rgb_r: 255, rgb_g: 20, rgb_b: 147, category: 'chips', image_path: '/assets/Chips/webersys chips_17.jpg' },
  { code: 'Chips 18', name: 'Dekoracyjne chips 18', hex: '#00CED1', rgb_r: 0, rgb_g: 206, rgb_b: 209, category: 'chips', image_path: '/assets/Chips/webersys chips_18.jpg' },
  { code: 'Chips 19', name: 'Dekoracyjne chips 19', hex: '#FF8C00', rgb_r: 255, rgb_g: 140, rgb_b: 0, category: 'chips', image_path: '/assets/Chips/webersys chips_19.jpg' },
  { code: 'Chips 20', name: 'Dekoracyjne chips 20', hex: '#9932CC', rgb_r: 153, rgb_g: 50, rgb_b: 204, category: 'chips', image_path: '/assets/Chips/webersys chips_20.jpg' },
  { code: 'Chips 21', name: 'Dekoracyjne chips 21', hex: '#8FBC8F', rgb_r: 143, rgb_g: 188, rgb_b: 143, category: 'chips', image_path: '/assets/Chips/webersys chips_21.jpg' },
];

// Generate INSERT statements for colors
const colorInserts = colorsData.map(color => {
  return `INSERT INTO colors (code, name, hex, rgb_r, rgb_g, rgb_b, category, image_path) VALUES (
    '${color.code.replace(/'/g, "''")}',
    '${color.name.replace(/'/g, "''")}',
    '${color.hex}',
    ${color.rgb_r},
    ${color.rgb_g},
    ${color.rgb_b},
    '${color.category}',
    ${color.image_path ? `'${color.image_path.replace(/'/g, "''")}'` : 'NULL'}
  ) ON CONFLICT (code) DO NOTHING;`;
}).join('\n');

console.log('-- COLORS INSERT STATEMENTS');
console.log('-- Copy and paste this section into Supabase SQL Editor');
console.log(colorInserts);
console.log('');

console.log('2. SAMPLE REVIEWS - Copy and run this SQL:');
const reviewsData = [
  {
    first_name: 'Anna',
    last_name: 'Kowalska',
    email: 'anna.kowalska@example.com',
    project_date: '2024-01-15',
    project_type: 'Epoksyd Premium',
    square_meters: 45.5,
    rating: 5,
    review_text: 'Profesjonalne wykonanie posadzki epoksydowej w garażu. Efekt przekroczył oczekiwania! Chłopaki z ekipy są bardzo dokładni i terminowi. Polecam serdecznie!',
    status: 'approved',
    helpful: 12,
    project_location: 'Garaż'
  },
  {
    first_name: 'Jan',
    last_name: 'Nowak',
    email: 'jan.nowak@example.com',
    project_date: '2024-01-10',
    project_type: 'Poliuretan Standard',
    square_meters: 30.0,
    rating: 5,
    review_text: 'Posadzka poliuretanowa na tarasie wygląda rewelacyjnie! Szybka realizacja, świetny kontakt z biurem. Na pewno będę polecać znajomym.',
    status: 'approved',
    helpful: 8,
    project_location: 'Taras'
  },
  {
    first_name: 'Maria',
    last_name: 'Wiśniewska',
    email: 'maria.wisniewska@example.com',
    project_date: '2024-01-05',
    project_type: 'Efekt dekoracyjny',
    square_meters: 25.0,
    rating: 5,
    review_text: 'Efekt marmuru w salonie to strzał w dziesiątkę! Posadzka jest nie tylko piękna, ale też bardzo praktyczna w utrzymaniu. Dziękujemy za profesjonalną obsługę.',
    status: 'pending',
    helpful: 0,
    project_location: 'Salon'
  }
];

const reviewInserts = reviewsData.map(review => {
  return `INSERT INTO reviews (first_name, last_name, email, project_date, project_type, square_meters, rating, review_text, status, helpful, project_location) VALUES (
    '${review.first_name}',
    '${review.last_name}',
    '${review.email}',
    '${review.project_date}',
    '${review.project_type}',
    ${review.square_meters},
    ${review.rating},
    '${review.review_text.replace(/'/g, "''")}",
    '${review.status}',
    ${review.helpful},
    '${review.project_location}'
  );`;
}).join('\n');

console.log('-- REVIEWS INSERT STATEMENTS');
console.log(reviewInserts);
console.log('');

console.log('3. SAMPLE REALIZATIONS - Copy and run this SQL:');
const realizationsData = [
  {
    title: 'Hala produkcyjna - Zakład chemiczny',
    category: 'Przemysł',
    description: 'Kompleksowa realizacja posadzki epoksydowej w hali produkcyjnej zakładu chemicznego.',
    materials: ['Żywica epoksydowa Sika', 'Grunt epoksydowy', 'Kwarc dekoracyjny'],
    features: ['Odporność na chemikalia', 'Łatwość czyszczenia', 'Antypoślizgowa powierzchnia'],
    square_meters: 500,
    location: 'Łódź, Polska',
    tags: ['epoksyd', 'przemysł', 'chemia'],
    images: ['/images/realization-1-1.jpg', '/images/realization-1-2.jpg'],
    youtube_video_id: 'dQw4w9WgXcQ',
    completion_date: '2024-01-15',
    is_published: true
  },
  {
    title: 'Garaż podziemny - Apartamentowiec',
    category: 'Dom',
    description: 'Posadzka poliuretanowa w garażu podziemnym z systemem dekoracyjnym.',
    materials: ['Żywica poliuretanowa Mapei', 'Posypka kwarcowa'],
    features: ['Odporność na ścieranie', 'Łatwa konserwacja', 'Estetyczny wygląd'],
    square_meters: 300,
    location: 'Warszawa, Polska',
    tags: ['poliuretan', 'garaż', 'dom'],
    images: ['/images/realization-2-1.jpg'],
    completion_date: '2024-02-20',
    is_published: true
  }
];

const realizationInserts = realizationsData.map(realization => {
  return `INSERT INTO realizations (title, category, description, materials, features, square_meters, location, tags, images, youtube_video_id, completion_date, is_published) VALUES (
    '${realization.title.replace(/'/g, "''")}',
    '${realization.category}',
    '${realization.description.replace(/'/g, "''")}',
    ARRAY[${realization.materials.map(m => `'${m.replace(/'/g, "''")}'`).join(', ')}],
    ARRAY[${realization.features.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}],
    ${realization.square_meters},
    '${realization.location}',
    ARRAY[${realization.tags.map(t => `'${t}'`).join(', ')}],
    ARRAY[${realization.images.map(i => `'${i}'`).join(', ')}],
    ${realization.youtube_video_id ? `'${realization.youtube_video_id}'` : 'NULL'},
    '${realization.completion_date}',
    ${realization.is_published}
  );`;
}).join('\n');

console.log('-- REALIZATIONS INSERT STATEMENTS');
console.log(realizationInserts);
console.log('');

console.log('4. ADD YOURSELF AS ADMIN - Replace YOUR_EMAIL with your email:');
console.log(`-- Replace YOUR_EMAIL with your actual email address
INSERT INTO admin_users (id, email, is_active) VALUES (
  auth.uid(),
  'YOUR_EMAIL@example.com',
  true
);`);
console.log('');

console.log('🎉 After running all these SQL statements, your database will be fully populated!');
console.log('   Then restart your Next.js application and everything should work perfectly!');

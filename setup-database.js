#!/usr/bin/env node

// Database setup script for DiabloStudio
// Run this script to initialize all tables in Supabase

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📊 DiabloStudio Database Setup');
console.log('==============================');
console.log('');
console.log('To set up your database, you need to run the SQL schema in Supabase:');
console.log('');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the entire content of supabase-schema.sql');
console.log('4. Run the SQL script');
console.log('');
console.log('The schema will create the following tables:');
console.log('- colors (RAL colors, quartz sands, decorative chips)');
console.log('- reviews (customer reviews)');
console.log('- realizations (project showcases)');
console.log('- admin_users (admin authentication)');
console.log('- customers (customer data)');
console.log('- customer_quotes (valuation requests)');
console.log('');
console.log('After running the schema, your database will be ready! 🎉');
console.log('');
console.log('Schema file location:', schemaPath);

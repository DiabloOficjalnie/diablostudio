// DiabloStudio Vercel Deployment Script
// Run this script to prepare and deploy your application to Vercel

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🚀 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function deployToVercel() {
  console.log('🎨 DiabloStudio Vercel Deployment\n');
  console.log('=' .repeat(50));

  // Check if Vercel CLI is installed
  console.log('🔍 Checking Vercel CLI...');
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is available\n');
  } catch (error) {
    console.log('📦 Installing Vercel CLI...');
    if (!runCommand('npm install -g vercel', 'Installing Vercel CLI globally')) {
      console.log('⚠️  Could not install Vercel CLI globally. You can still deploy manually.');
      console.log('   Alternative: Visit https://vercel.com and deploy manually');
      return;
    }
  }

  // Check if project is ready for deployment
  console.log('🔍 Checking project readiness...');

  // Check if .env.local exists and has required variables
  if (!fs.existsSync('.env.local')) {
    console.error('❌ .env.local file not found!');
    console.log('   Please ensure your .env.local file exists with Supabase configuration.');
    return;
  }

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found!');
    return;
  }

  // Check if Next.js build works
  console.log('🔨 Testing Next.js build...');
  if (!runCommand('npm run build', 'Testing Next.js build')) {
    console.error('❌ Build test failed. Please fix build errors before deploying.');
    return;
  }

  console.log('✅ Project is ready for deployment!\n');

  // Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  console.log('📝 You will be prompted to:');
  console.log('   1. Login to Vercel (if not already logged in)');
  console.log('   2. Select/create a team');
  console.log('   3. Configure project settings');
  console.log('   4. Set up environment variables');
  console.log('');

  const deploySuccess = runCommand('npx vercel --prod', 'Deploying to Vercel production');

  if (deploySuccess) {
    console.log('🎉 Deployment successful!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up your environment variables in Vercel dashboard');
    console.log('   2. Configure your custom domain (optional)');
    console.log('   3. Set up automatic deployments from Git');
    console.log('\n🔧 Required Environment Variables in Vercel:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://epujffkujstgprcamgpi.supabase.co/');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('\n💡 Tip: You can find these values in your .env.local file');
  } else {
    console.log('\n🔄 Manual deployment instructions:');
    console.log('   1. Go to https://vercel.com');
    console.log('   2. Import your Git repository');
    console.log('   3. Set environment variables from .env.local');
    console.log('   4. Deploy!');
  }
}

// Environment variables setup guide
function showEnvironmentSetup() {
  console.log('\n🔧 Environment Variables Setup Guide');
  console.log('=' .repeat(40));
  console.log('\nIn your Vercel dashboard, go to:');
  console.log('Project Settings > Environment Variables');
  console.log('\nAdd these variables:');
  console.log('');

  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#') && line.includes('=')) {
        const [key, value] = line.split('=');
        console.log(`📝 ${key}=${value}`);
      }
    });
  } catch (error) {
    console.log('❌ Could not read .env.local file');
    console.log('   Please manually copy your environment variables from .env.local');
  }

  console.log('\n⚠️  Important:');
  console.log('   • NEXT_PUBLIC_ variables are exposed to the browser');
  console.log('   • Keep service role key secure (not public)');
  console.log('   • Update your Supabase RLS policies for production');
}

// Run deployment
if (require.main === module) {
  deployToVercel().then(() => {
    showEnvironmentSetup();
  }).catch(error => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = { deployToVercel, showEnvironmentSetup };

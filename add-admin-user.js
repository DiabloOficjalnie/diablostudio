const { createClient } = require('@supabase/supabase-js')

// This script adds an admin user to the DiabloStudio system
// You need to set the SUPABASE_SERVICE_ROLE_KEY environment variable

const supabaseUrl = 'https://epujffkujstgprcamgpi.supabase.co/'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Please set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function addAdminUser() {
  try {
    const email = 'm.mejza@proton.me'
    const name = 'Mateusz Mejza'

    console.log('Looking up existing user...')

    // First, get the user ID from auth.users table
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      throw userError
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.error('User not found in auth system')
      console.log('Please make sure the user exists first by logging in at least once')
      process.exit(1)
    }

    console.log('Found user with ID:', user.id)

    // First, check if user is already in admin_users table
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing admin:', checkError)
    }

    if (existingAdmin) {
      console.log('✅ User is already an admin!')
      console.log('Admin record:', existingAdmin)
      return
    }

    // Add user to admin_users table
    console.log('Adding user to admin_users table...')
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: user.id,
        email,
        name,
        role: 'admin',
        is_active: true
      })

    if (adminError) {
      console.error('❌ Error inserting admin record:', adminError)
      throw adminError
    }

    console.log('✅ Admin user added successfully!')
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('Role: admin')
    console.log('User ID:', user.id)

  } catch (error) {
    console.error('❌ Error adding admin user:', error.message)
    process.exit(1)
  }
}

addAdminUser()

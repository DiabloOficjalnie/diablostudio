// Script to manually create a client profile in the database
// Run this in the browser console or as a Node.js script

const createClientProfile = async (userData) => {
  try {
    // First, create user in Supabase Auth (you'll need to do this manually in Supabase Dashboard)
    console.log('1. Create user in Supabase Auth Dashboard first')
    console.log('2. Copy the user UUID from the auth.users table')

    const userUUID = userData.userUUID || prompt('Enter the user UUID from Supabase Auth:')

    if (!userUUID) {
      throw new Error('User UUID is required')
    }

    // Then create the client profile
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('client_profiles')
      .insert({
        id: userUUID,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone || null,
        company: userData.company || null
      })
      .select()

    if (error) {
      console.error('Error creating client profile:', error)
      return { success: false, error }
    }

    console.log('✅ Client profile created successfully:', data)

    // Optionally create default consents
    if (userData.createDefaultConsents) {
      const consents = [
        { consent_type: 'rodo', consent_given: true },
        { consent_type: 'terms', consent_given: true },
        { consent_type: 'communication', consent_given: true }
      ]

      const consentPromises = consents.map(consent =>
        supabase.from('client_consents').insert({
          client_id: userUUID,
          ...consent,
          consent_ip: '127.0.0.1',
          consent_user_agent: navigator.userAgent
        })
      )

      await Promise.all(consentPromises)
      console.log('✅ Default consents created')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createClientProfile:', error)
    return { success: false, error }
  }
}

// Example usage:
// createClientProfile({
//   userUUID: 'your-user-uuid-here',
//   firstName: 'Jan',
//   lastName: 'Kowalski',
//   email: 'jan@example.com',
//   phone: '+48 123 456 789',
//   company: 'Example Company',
//   createDefaultConsents: true
// })

// Alternative: Create a simple HTML form for manual creation
const createClientProfileForm = () => {
  return `
    <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
      <h2>Create Client Profile</h2>
      <form id="clientProfileForm">
        <div style="margin-bottom: 15px;">
          <label>User UUID:</label><br>
          <input type="text" id="userUUID" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label>First Name:</label><br>
          <input type="text" id="firstName" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label>Last Name:</label><br>
          <input type="text" id="lastName" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label>Email:</label><br>
          <input type="email" id="email" required style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label>Phone:</label><br>
          <input type="tel" id="phone" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 15px;">
          <label>Company:</label><br>
          <input type="text" id="company" style="width: 100%; padding: 8px;">
        </div>
        <button type="submit" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px;">
          Create Profile
        </button>
      </form>
    </div>

    <script>
      document.getElementById('clientProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault()

        const userData = {
          userUUID: document.getElementById('userUUID').value,
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          company: document.getElementById('company').value,
          createDefaultConsents: true
        }

        console.log('Creating client profile:', userData)

        // Note: This would need to be adapted to work in browser environment
        // For now, it just logs the data that should be inserted
        alert('Check console for the data to insert manually in Supabase Dashboard')
      })
    </script>
  `
}

console.log('Client profile creation utilities loaded')
console.log('Use createClientProfile() function or createClientProfileForm() for HTML form')

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createClientProfile, createClientProfileForm }
}

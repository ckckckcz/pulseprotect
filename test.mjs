import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRegistration() {
  console.log('🧪 Testing registration process...')
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    full_name: 'Test User Registration',
    password_hash: '$2a$10$test.hash.for.testing.purposes.only',
    role: 'user'
  }

  try {
    // Test registration
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select('id, email, full_name, role, created_at')
      .single()

    if (error) {
      console.error('❌ Registration test failed:', error.message)
      return false
    }

    console.log('✅ Registration test passed!')

    // Clean up test user
    await supabase.from('users').delete().eq('id', data.id)
    console.log('🧹 Test user cleaned up')
    
    return true
  } catch (err) {
    console.error('❌ Registration test error:', err.message)
    return false
  }
}

// Run test
testRegistration()

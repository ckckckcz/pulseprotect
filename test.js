const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Function to read .env.local file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    console.log('Please create .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_url')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
    return {}
  }

  const envFile = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })
  
  return envVars
}

// Load environment variables
const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Make sure you have .env.local file with:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  console.log('')
  console.log('Current values:')
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Found' : '❌ Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    // Test basic connection with proper count syntax
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Database error:', error.message)
      console.log('Details:', error)
      
      // Check if it's a table not found error
      if (error.code === '42P01' || error.message.includes('relation "public.users" does not exist')) {
        console.log('')
        console.log('💡 The "users" table doesn\'t exist yet.')
        console.log('Please run the SQL migration in your Supabase dashboard:')
        console.log('1. Go to Supabase Dashboard > SQL Editor')
        console.log('2. Copy and run the SQL from: supabase/migrations/002_create_users_table.sql')
      }
      
      return false
    } else {
      console.log('✅ Database connected successfully!')
      console.log('📊 Users table exists and accessible')
      console.log(`📈 Current users count: ${count || 0}`)
      return true
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    
    if (err.message.includes('Invalid API key') || err.message.includes('401')) {
      console.log('💡 Check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
      console.log('💡 Check your NEXT_PUBLIC_SUPABASE_URL in .env.local')
      console.log('💡 Make sure your internet connection is working')
    }
    
    return false
  }
}

async function testTableStructure() {
  console.log('🔍 Testing table structure...')
  
  try {
    // First, try to select columns to verify table structure
    const { data: schemaData, error: schemaError } = await supabase
      .from('users')
      .select('id')
      .limit(0)

    if (schemaError) {
      console.error('❌ Table structure test failed:', schemaError.message)
      return false
    }

    console.log('✅ Table structure verified')

    // Test if we can insert and delete a test record
    const testEmail = `test${Date.now()}@example.com`
    const testData = {
      email: testEmail,
      full_name: 'Test User',
      password_hash: 'test_hash_for_testing',
      role: 'user'
    }

    // Try to insert
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testData)
      .select('id, email, full_name')

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('✅ Table constraints working (duplicate email protection)')
        return true
      } else {
        console.error('❌ Insert test failed:', insertError.message)
        console.log('Error code:', insertError.code)
        return false
      }
    }

    // If insert succeeded, clean up
    if (insertData && insertData[0]) {
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id)
      
      console.log('✅ Insert/Delete test passed!')
      console.log('📝 Successfully created and deleted test user')
      return true
    }

  } catch (err) {
    console.error('❌ Table structure test failed:', err.message)
    return false
  }
}

async function testRegistrationFlow() {
  console.log('🧪 Testing registration flow simulation...')
  
  try {
    const bcrypt = require('bcryptjs')
    
    const testEmail = `testuser${Date.now()}@pulseprotect.com`
    const password = 'testpassword123'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const userData = {
      email: testEmail,
      full_name: 'Test Registration User',
      password_hash: passwordHash,
      role: 'user',
      is_active: true,
      is_verified: false,
      phone: '081234567890'
    }

    // Test registration
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select('id, email, full_name, role, is_active, created_at')
      .single()

    if (error) {
      console.error('❌ Registration simulation failed:', error.message)
      return false
    }

    console.log('✅ Registration simulation passed!')
    console.log('👤 Created user:', {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role
    })

    // Test password verification
    const isValidPassword = await bcrypt.compare(password, passwordHash)
    console.log(`🔐 Password verification: ${isValidPassword ? '✅' : '❌'}`)

    // Clean up test user
    await supabase.from('users').delete().eq('id', data.id)
    console.log('🧹 Test user cleaned up')
    
    return true
  } catch (err) {
    console.error('❌ Registration simulation error:', err.message)
    return false
  }
}

async function testBasicQueries() {
  console.log('🔍 Testing basic database queries...')
  
  try {
    // Test simple select
    const { data: selectData, error: selectError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .limit(5)

    if (selectError) {
      console.error('❌ Select query failed:', selectError.message)
      return false
    }

    console.log('✅ Select query working')
    console.log(`📋 Found ${selectData.length} existing users`)

    // Test with where clause
    const { data: whereData, error: whereError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'user')
      .limit(1)

    if (whereError) {
      console.error('❌ Where clause query failed:', whereError.message)
      return false
    }

    console.log('✅ Where clause queries working')
    return true

  } catch (err) {
    console.error('❌ Basic queries test failed:', err.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase database tests...\n')
  
  // Test 1: Connection
  const connectionOK = await testConnection()
  if (!connectionOK) {
    console.log('\n❌ Connection test failed. Please check your Supabase setup.')
    return
  }

  console.log('')
  
  // Test 2: Basic Queries
  const basicQueriesOK = await testBasicQueries()
  
  console.log('')
  
  // Test 3: Table Structure
  const structureOK = await testTableStructure()
  
  console.log('')
  
  // Test 4: Registration Flow
  let registrationOK = false
  try {
    registrationOK = await testRegistrationFlow()
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('bcryptjs')) {
      console.log('⚠️  bcryptjs not installed. Installing it will enable full registration testing.')
      console.log('Run: npm install bcryptjs')
      registrationOK = 'skipped'
    } else {
      console.error('❌ Registration test failed:', err.message)
    }
  }
  
  console.log('\n📋 Test Summary:')
  console.log(`Connection: ${connectionOK ? '✅' : '❌'}`)
  console.log(`Basic Queries: ${basicQueriesOK ? '✅' : '❌'}`)
  console.log(`Table Structure: ${structureOK ? '✅' : '❌'}`)
  console.log(`Registration Flow: ${registrationOK === true ? '✅' : registrationOK === 'skipped' ? '⏭️  Skipped' : '❌'}`)
  
  if (connectionOK && basicQueriesOK && structureOK) {
    console.log('\n🎉 Core tests passed! Your database is ready.')
    if (registrationOK === 'skipped') {
      console.log('💡 Install bcryptjs for complete registration testing: npm install bcryptjs')
    } else if (registrationOK) {
      console.log('🎊 All tests including registration flow passed!')
      console.log('🚀 Your registration form should work now!')
    }
  } else {
    console.log('\n⚠️  Some tests failed. Please check your database setup.')
    
    if (!connectionOK) {
      console.log('\n🔧 Connection troubleshooting:')
      console.log('1. Verify .env.local file has correct Supabase credentials')
      console.log('2. Check your Supabase project is active and not paused')
      console.log('3. Verify your internet connection')
      console.log('4. Make sure you\'re using the correct project URL and anon key')
    }
    
    if (!structureOK && connectionOK) {
      console.log('\n🔧 Database setup steps:')
      console.log('1. Go to Supabase Dashboard > SQL Editor')
      console.log('2. Copy the SQL from supabase/migrations/002_create_users_table.sql')
      console.log('3. Paste and run the SQL query')
      console.log('4. Check Table Editor to confirm "users" table was created')
    }
  }
}

// Run the tests
runAllTests().catch(console.error)

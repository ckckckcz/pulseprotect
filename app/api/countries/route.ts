import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app/api/data/country.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const countries = JSON.parse(fileContents)
    
    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error reading country data:', error)
    return NextResponse.json(
      { error: 'Failed to load country data' },
      { status: 500 }
    )
  }
}

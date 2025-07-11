import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    JWT_SECRET: process.env.JWT_SECRET || 'not found',
    DB_HOST: process.env.DB_HOST || 'not found',
    DB_PASSWORD: process.env.DB_PASSWORD || 'not found',
    NODE_ENV: process.env.NODE_ENV || 'not found'
  })
}
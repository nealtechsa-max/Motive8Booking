import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { addMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only seed if database is empty
  const existing = await prisma.user.findFirst()
  if (existing) {
    return NextResponse.json({ message: 'Already seeded', skipped: true })
  }

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      name: 'Studio Admin',
      email: 'admin@motive8creative.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Demo regular user
  const userHash = await bcrypt.hash('user123', 12)
  await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'user@example.com',
      passwordHash: userHash,
      phone: '555-0101',
      role: 'USER',
    },
  })

  // Membership plans
  await prisma.membershipPlan.createMany({
    data: [
      {
        id: 'plan-starter',
        name: 'Starter',
        description: 'Perfect for occasional creators',
        monthlyFee: 299,
        hoursIncluded: 6,
        discountedHourlyRate: 40,
        regularHourlyRate: 65,
        color: '#8e17b5',
        sortOrder: 1,
      },
      {
        id: 'plan-pro',
        name: 'Pro Creator',
        description: 'Our most popular plan for regular creators',
        monthlyFee: 500,
        hoursIncluded: 10,
        discountedHourlyRate: 35,
        regularHourlyRate: 65,
        color: '#c441f5',
        sortOrder: 2,
      },
      {
        id: 'plan-elite',
        name: 'Elite',
        description: 'Maximum access for power users',
        monthlyFee: 800,
        hoursIncluded: 20,
        discountedHourlyRate: 28,
        regularHourlyRate: 65,
        color: '#f59e0b',
        sortOrder: 3,
      },
    ],
  })

  // Studio spaces
  await prisma.studioSpace.createMany({
    data: [
      {
        id: 'space-main',
        name: 'Main Studio',
        description: 'Our flagship creative space featuring professional lighting, backdrops, and full production capabilities.',
        capacity: 20,
        amenities: JSON.stringify(['Professional Lighting', 'Multiple Backdrops', 'Green Screen', 'Changing Room', 'WiFi', 'Climate Control', 'Sound System']),
        regularHourlyRate: 65,
        color: '#c441f5',
        sortOrder: 1,
      },
      {
        id: 'space-podcast',
        name: 'Podcast Suite',
        description: 'Acoustically treated recording suite with professional microphones, mixer, and streaming equipment.',
        capacity: 6,
        amenities: JSON.stringify(['Soundproofing', 'Professional Microphones', 'Audio Interface', 'Mixing Board', 'Streaming Setup', 'WiFi', 'Lounge Seating']),
        regularHourlyRate: 45,
        color: '#8e17b5',
        sortOrder: 2,
      },
      {
        id: 'space-event',
        name: 'Event Hall',
        description: 'Versatile open floor plan perfect for workshops, pop-up events, product launches, and private gatherings.',
        capacity: 80,
        amenities: JSON.stringify(['Projector & Screen', 'PA System', 'Flexible Layout', 'Catering Area', 'WiFi', 'Climate Control', 'Parking']),
        regularHourlyRate: 120,
        color: '#f59e0b',
        sortOrder: 3,
      },
    ],
  })

  // Studio hours
  await prisma.studioHours.createMany({
    data: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isOpen: true },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00', isOpen: true },
    ],
  })

  // Site settings
  await prisma.siteSettings.create({
    data: {
      siteName: 'Motive 8 Creative',
      tagline: 'Your Creative Space Awaits',
      contactEmail: 'info@motive8creative.com',
      minBookingHours: 1,
      maxBookingHours: 8,
      advanceBookingDays: 60,
      cancellationHours: 24,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    accounts: {
      admin: 'admin@motive8creative.com / admin123',
      user: 'user@example.com / user123',
    },
  })
}

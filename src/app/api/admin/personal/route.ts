import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPersonalInfo, updatePersonalInfo } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';

export async function GET() {
  try {
    await requireAuth();
    const personalInfo = await getPersonalInfo();
    return NextResponse.json(personalInfo);
  } catch (error) {
    console.error('Error fetching personal info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal info' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const data = await request.json();
    const updatedInfo = await updatePersonalInfo(data);
    
    await notifyContentUpdate('Personal Information', {
      name: data.name,
      title: data.title
    });
    
    return NextResponse.json(updatedInfo);
  } catch (error) {
    console.error('Error updating personal info:', error);
    return NextResponse.json(
      { error: 'Failed to update personal info' },
      { status: 500 }
    );
  }
}
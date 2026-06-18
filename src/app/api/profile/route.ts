import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { Profile } from '@/lib/types';

const DEFAULT_PROFILE: Profile = {
  hero: {
    name: 'Keanuccc',
    title: 'Intern Product Manager',
    subtitle: 'Building intelligent products that solve real-world problems',
  },
  whoami: {
    bio: 'Passionate about AI and product development.',
    skills: ['Product Management', 'AI/ML', 'Data Analysis'],
  },
  contact: {
    email: 'your.email@example.com',
    socialLinks: [],
  },
};

export async function GET() {
  try {
    const profile = await kv.get<Profile>('profile:data');
    return NextResponse.json({ profile: profile || DEFAULT_PROFILE });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hero, whoami, contact } = body;

    const currentProfile = (await kv.get<Profile>('profile:data')) || DEFAULT_PROFILE;

    const updatedProfile: Profile = {
      hero: hero ? { ...currentProfile.hero, ...hero } : currentProfile.hero,
      whoami: whoami
        ? { ...currentProfile.whoami, ...whoami }
        : currentProfile.whoami,
      contact: contact
        ? { ...currentProfile.contact, ...contact }
        : currentProfile.contact,
    };

    await kv.set('profile:data', updatedProfile);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

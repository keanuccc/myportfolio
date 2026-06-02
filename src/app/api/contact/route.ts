import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { verifySession } from '@/lib/auth';
import { ContactMessage } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await kv.get<ContactMessage[]>('contact:messages');
    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const messages = (await kv.get<ContactMessage[]>('contact:messages')) || [];

    const newMessage: ContactMessage = {
      id: nanoid(),
      name,
      email,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    messages.unshift(newMessage);
    await kv.set('contact:messages', messages);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
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
    const { id, read } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const messages = (await kv.get<ContactMessage[]>('contact:messages')) || [];
    const index = messages.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    messages[index] = {
      ...messages[index],
      read: read !== undefined ? read : !messages[index].read,
    };

    await kv.set('contact:messages', messages);

    return NextResponse.json({ message: messages[index] });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

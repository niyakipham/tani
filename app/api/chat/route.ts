import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room') || 'global';
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room', room)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tải tin nhắn.', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const room = String(body.room || 'global');
    const senderName = String(body.sender_name || 'Guest');
    const content = String(body.content || '').trim();

    if (!content) {
      return NextResponse.json({ error: 'Nội dung tin nhắn trống.' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ room, sender_name: senderName, content })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể lưu tin nhắn.', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

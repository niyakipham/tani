import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const hasChatDbConfig = () => Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
);

const isMissingTableError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.toLowerCase().includes('does not exist') || message.toLowerCase().includes('relation \"chat_messages\"');
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room') || 'global';

    if (!hasChatDbConfig()) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room', room)
      .order('created_at', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ messages: [] }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ messages: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Không thể tải tin nhắn.',
        message: error instanceof Error ? error.message : 'Unknown error',
        messages: [],
      },
      { status: 200 }
    );
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

    if (!hasChatDbConfig()) {
      return NextResponse.json({ error: 'Chat database chưa được cấu hình trên Vercel.' }, { status: 503 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ room, sender_name: senderName, content })
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ error: 'Bảng chat_messages chưa tồn tại trong Supabase.' }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json({ message: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Không thể lưu tin nhắn.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

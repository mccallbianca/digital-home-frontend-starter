'use client';

import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

interface CommunityChatProps {
  userId: string;
  displayName: string;
  apiKey: string;
}

export default function CommunityChat({ userId, displayName, apiKey }: CommunityChatProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let chatClient: StreamChat | null = null;

    async function initChat() {
      try {
        // Get token from server
        const res = await fetch('/api/stream/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: displayName }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to get chat token');
        }

        const { token } = await res.json();

        chatClient = StreamChat.getInstance(apiKey);
        await chatClient.connectUser(
          { id: userId, name: displayName },
          token
        );

        setClient(chatClient);
      } catch (err) {
        console.error('[CommunityChat] Init error:', err);
        setError(err instanceof Error ? err.message : 'Chat initialization failed');
      } finally {
        setLoading(false);
      }
    }

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [userId, displayName, apiKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--herr-cobalt)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--herr-muted)]">Connecting to HERR Nation…</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-pink)] p-8">
        <p className="herr-label text-[var(--herr-pink)] mb-3">Connection Error</p>
        <p className="text-[var(--herr-muted)] leading-relaxed">
          {error || 'Could not connect to HERR Nation.'} Please try refreshing the page.
        </p>
      </div>
    );
  }

  const filters = { type: 'messaging', members: { $in: [userId] } };
  const sort = { last_message_at: -1 as const };

  return (
    <div className="herr-stream-chat" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
      <style>{`
        .herr-stream-chat .str-chat {
          --str-chat__primary-color: #D946EF;
          --str-chat__active-primary-color: #D946EF;
          --str-chat__primary-surface-color: #16161F;
          --str-chat__secondary-surface-color: #111118;
          --str-chat__primary-surface-color-low-emphasis: #0A0A0F;
          --str-chat__text-color: #F0EEE9;
          --str-chat__text-low-emphasis-color: rgba(240, 238, 233, 0.5);
          --str-chat__border-color: rgba(240, 238, 233, 0.08);
          --str-chat__message-input__border-color: rgba(240, 238, 233, 0.14);
          height: 100%;
        }
        .herr-stream-chat .str-chat__channel-list {
          background: #0A0A0F;
        }
        .herr-stream-chat .str-chat__channel-preview-messenger--active {
          background: #16161F;
        }
        .herr-stream-chat .str-chat__main-panel {
          background: #111118;
        }
      `}</style>
      <Chat client={client} theme="str-chat__theme-dark">
        <ChannelList filters={filters} sort={sort} />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput audioRecordingEnabled />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}

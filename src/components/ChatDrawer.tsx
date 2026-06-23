import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageSquare } from 'lucide-react';
import type { Message } from '../types';

interface ChatDrawerProps {
  jobId: string;
  partnerId: string;
  partnerName: string;
  currentUserId: string;
  messages: Message[];
  onSendMessage: (jobId: string, content: string, receiverId: string) => void;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  jobId,
  partnerId,
  partnerName,
  currentUserId,
  messages,
  onSendMessage,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this specific job conversation
  const chatMessages = messages.filter(
    (msg) =>
      msg.jobId === jobId &&
      ((msg.senderId === currentUserId && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === currentUserId))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(jobId, inputText.trim(), partnerId);
    setInputText('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 900,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.25s forwards',
    }}>
      {/* Click outside backdrop container */}
      <div 
        onClick={onClose} 
        style={{ flex: 1 }} 
      />

      {/* Drawer Panel */}
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '100%',
          borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
          borderRight: 'none',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-solid)',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
            }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {partnerName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #10b981',
                  animation: 'pulseGlow 2s infinite'
                }}></span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {chatMessages.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              gap: '8px',
              textAlign: 'center',
              padding: '2rem',
            }}>
              <MessageSquare size={32} color="var(--border-color)" />
              <span>No messages yet. Send a greeting to initiate discussion and finalize rates.</span>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginBottom: '2px',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    fontWeight: 600,
                  }}>
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: isMe 
                      ? 'var(--radius-lg) var(--radius-lg) 2px var(--radius-lg)' 
                      : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 2px',
                    backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-surface-hover)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                  }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ borderRadius: 'var(--radius-lg)' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-lg)',
              minWidth: '42px',
              height: '42px',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

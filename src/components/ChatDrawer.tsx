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
    <div className="chat-overlay">
      <div className="chat-backdrop" onClick={onClose} />

      <div className="glass-panel chat-panel">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-profile">
            <div className="chat-header-avatar">
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {partnerName}
              </h3>
              <div className="flex-center" style={{ gap: '4px', fontSize: '0.7rem' }}>
                <span className="chat-online-dot" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Active Online</span>
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close chat">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-empty">
              <MessageSquare size={32} color="var(--border-color)" />
              <span>No messages yet. Send a greeting to initiate discussion and finalize rates.</span>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`chat-bubble ${isMe ? 'mine' : 'theirs'}`}>
                  <span className="chat-bubble-sender">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <div className="chat-bubble-body">{msg.content}</div>
                  <span className="chat-bubble-time">{msg.timestamp}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            className="form-input"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary chat-send-btn" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

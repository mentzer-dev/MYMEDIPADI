import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Send, User, Stethoscope, ShieldCheck, Clock, MessageSquare } from 'lucide-react';

export const SecureMessaging: React.FC = () => {
  const { messages, sendChatMessage, patient } = useClinic();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim(), 'patient');
    setInputText('');
  };

  const quickPrompts = [
    'I just arrived and checked in via app.',
    'Can I request a refill on my inhaler prescription?',
    'Should I fast before my upcoming lab visit?',
    'My symptoms have improved slightly this morning.',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col h-[580px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Care Team Direct Messaging
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Dr. Adeyemi Thorne & Triage Desk</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Active for Checked-In Patients
              </span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>HIPAA Compliant Tunnel</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">No Messages Yet</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Start a direct conversation with Dr. Thorne or the nursing triage desk below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'patient';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block text-[11px] text-slate-500 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/70 font-mono">
                    {msg.content} · {msg.timestamp}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5 px-1">
                  <span className="font-semibold text-slate-700">{msg.senderName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-md p-3 rounded-xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick questions:</span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(q)}
            className="text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message Dr. Thorne or clinic triage staff...`}
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg transition-colors shadow-xs shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

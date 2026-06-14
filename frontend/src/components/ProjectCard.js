import React, { useState } from 'react';

const ProjectCard = ({ title, leader, current, max, skills, status, onJoin }) => {
  const [busy, setBusy] = useState(false);
  const isFull = current >= max;

  const handleClick = async () => {
    if (!onJoin || busy || isFull || status === 'sent') return;
    setBusy(true);
    try { await onJoin(); } finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-navy mb-4 h-14 overflow-hidden">{title}</h3>
      <div className="flex justify-between text-[11px] text-gray-500 mb-4">
        <p>Team Leader: <span className="font-semibold text-gray-700">{leader}</span></p>
        <p>Members: <span className="font-semibold text-gray-700">{current}/{max} Joined</span></p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8 flex-grow">
        {skills.map((s, i) => (
          <span key={i} className="bg-[#B6D7FF] text-[#2D60FF] px-3 py-1 rounded-full text-[10px] font-bold">{s}</span>
        ))}
      </div>
      <button
        onClick={handleClick}
        disabled={isFull || status === 'sent' || busy}
        className={`w-full py-3 rounded-full font-bold text-sm transition ${
          status === 'sent' ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic' :
          isFull ? 'bg-[#FF4D4D] text-white' : 'bg-navy text-white hover:bg-opacity-90 shadow-md'
        }`}>
        {status === 'sent' ? 'Request Sent' : isFull ? 'Completed' : (busy ? 'Sending…' : 'Send Request')}
      </button>
    </div>
  );
};

export default ProjectCard;

import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20 shrink-0">
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 text-xl select-none">
        KEYSTONE
      </span>
    </div>
  );
};

export default Logo;
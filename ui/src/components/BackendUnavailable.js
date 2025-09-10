import React from 'react';

export default function BackendUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-10 shadow-lg max-w-lg">
        <div className="text-5xl mb-4 text-red-400">🚫</div>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Backend Unavailable</h1>
        <p className="text-red-600 mb-4">We couldn't connect to the backend server.<br/>Please check your internet connection or try again later.</p>
        <div className="text-sm text-gray-500">If you are the site owner, make sure the backend service is running and accessible.</div>
      </div>
    </div>
  );
}


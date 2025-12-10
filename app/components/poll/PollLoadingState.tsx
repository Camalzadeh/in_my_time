import React from 'react';
import { Loader, Clock } from 'lucide-react';

export default function PollLoadingState() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-3xl shadow-xl border border-indigo-100">
        <div className="relative">
        <Clock className="w-10 h-10 text-indigo-500 animate-pulse" />
        <Loader className="w-10 h-10 absolute inset-0 text-indigo-700 animate-spin-slow" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Loading Poll Data...</h3>
    <p className="text-sm text-gray-500 max-w-xs text-center">
        Fetching real-time updates and availability slots. Please wait a moment.
    </p>
    </div>
    </div>
);
}
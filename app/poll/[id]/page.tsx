"use client"
import { Calendar, Users, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

// Temporary mock data - replace with your actual data fetching
async function getPollData(pollId: string) {
  // This should be replaced with your actual API call
  // Example: fetch(`/api/polls/${pollId}`)
  
  return {
    id: pollId,
    title: "Weekly Team Meeting",
    description: "Let's discuss the upcoming project milestones and team updates",
    availableDates: [
      "2024-01-15T14:00:00",
      "2024-01-16T10:00:00", 
      "2024-01-17T15:00:00",
      "2024-01-18T11:00:00"
    ],
    votes: [
      { date: "2024-01-15T14:00:00", count: 3 },
      { date: "2024-01-16T10:00:00", count: 5 },
      { date: "2024-01-17T15:00:00", count: 2 },
      { date: "2024-01-18T11:00:00", count: 4 }
    ],
    totalVotes: 14,
    created: "2024-01-10T09:00:00"
  };
}

interface PollPageProps {
  params: {
    id: string;
  };
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params;
  const poll = await getPollData(id);

  const getVoteCount = (date: string) => {
    const vote = poll.votes.find(v => v.date === date);
    return vote ? vote.count : 0;
  };

  const getPercentage = (date: string) => {
    const votes = getVoteCount(date);
    return poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: poll.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Main Poll Card */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
          {/* Poll Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">{poll.title}</h1>
            </div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              {poll.description}
            </p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-700">{poll.totalVotes}</div>
              <div className="text-sm text-indigo-600">Total Votes</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {poll.availableDates.length}
              </div>
              <div className="text-sm text-green-600">Time Options</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {new Date(poll.created).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-blue-600">Created</div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Available Time Slots
            </h2>

            <div className="space-y-4">
              {poll.availableDates.map((date, index) => {
                const votes = getVoteCount(date);
                const percentage = getPercentage(date);
                const isMostPopular = votes === Math.max(...poll.votes.map(v => v.count));

                return (
                  <div
                    key={date}
                    className={`p-4 border rounded-xl transition-all duration-200 ${
                      isMostPopular 
                        ? 'border-green-300 bg-green-50 ring-2 ring-green-200' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">
                        {new Date(date).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        {isMostPopular && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Most Popular
                          </span>
                        )}
                        <span className="text-sm font-semibold text-indigo-600">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isMostPopular ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {votes} vote{votes !== 1 ? 's' : ''}
                      </span>
                      
                      <button className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200">
                        Vote for this time
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              Share this poll with participants to collect more votes
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
"use client"

import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, ArrowLeft, Share2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Vote {
  date: string
  count: number
}

interface PollData {
  id: string
  title: string
  description: string
  availableDates: string[]
  votes: Vote[]
  totalVotes: number
  created: string
  participants: number
}

export default function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const [poll] = useState<PollData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showVoteSuccess, setShowVoteSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadPollData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Failed to load poll:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPollData()
  }, [params])

  const getVoteCount = (date: string) => {
    if (!poll) return 0
    const vote = poll.votes.find(v => v.date === date)
    return vote ? vote.count : 0
  }

  const getPercentage = (date: string) => {
    if (!poll || poll.totalVotes === 0) return 0
    const votes = getVoteCount(date)
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const getMostPopularDate = () => {
    if (!poll) return null
    const maxVotes = Math.max(...poll.votes.map(v => v.count))
    return poll.votes.find(v => v.count === maxVotes)?.date || null
  }

  const handleVote = (date: string) => {
    if (hasVoted) return
    setSelectedDate(date)
    setHasVoted(true)
    setShowVoteSuccess(true)
    setTimeout(() => setShowVoteSuccess(false), 3000)
  }

  const handleShare = async () => {
    const pollUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll?.title || 'Poll',
          text: poll?.description || '',
          url: pollUrl
        })
      } catch (_) {
        fallbackCopy(pollUrl)
      }
    } else {
      fallbackCopy(pollUrl)
    }
  }

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </main>
    )
  }

  if (!poll) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Poll Not Found</h1>
          <p className="text-gray-600 mb-6">The poll you are looking for does not exist.</p>
          <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  const mostPopularDate = getMostPopularDate()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {showVoteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Vote Submitted!</p>
              <p className="text-green-600 text-sm">Thanks for participating in the poll</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{poll.title}</h1>
            </div>
            <p className="text-indigo-100 text-lg opacity-90 leading-relaxed">
              {poll.description}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{poll.participants}</div>
                <div className="text-sm text-blue-600 font-medium">Participants</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{poll.totalVotes}</div>
                <div className="text-sm text-green-600 font-medium">Total Votes</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{poll.availableDates.length}</div>
                <div className="text-sm text-purple-600 font-medium">Options</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {new Date(poll.created).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-orange-600 font-medium">Created</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  Available Time Slots
                </h2>
                {mostPopularDate && (
                  <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    🏆 Most Popular: {formatShortDate(mostPopularDate)}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {poll.availableDates.map((date) => {
                  const votes = getVoteCount(date)
                  const percentage = getPercentage(date)
                  const isMostPopular = date === mostPopularDate
                  const isSelected = selectedDate === date

                  return (
                    <div
                      key={date}
                      className={`p-6 border-2 rounded-xl transition-all duration-300 ${
                        isMostPopular 
                          ? 'border-green-300 bg-green-50 shadow-lg shadow-green-100' 
                          : isSelected
                          ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            {formatDate(date)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{votes} votes</span>
                            <span className="font-semibold text-indigo-600">{percentage}%</span>
                            {isMostPopular && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                Most Popular
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleVote(date)}
                          disabled={hasVoted}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            hasVoted
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isSelected
                              ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200'
                              : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-200'
                          }`}
                        >
                          {isSelected ? 'Voted ✓' : 'Vote for this time'}
                        </button>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isMostPopular ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">
                Share this poll with participants to collect more votes and find the best time for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

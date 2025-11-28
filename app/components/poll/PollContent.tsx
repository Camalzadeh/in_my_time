"use client"

import { useState } from 'react';
import {
    User,
    Calendar,
    Check,
    ArrowRight,
    Loader2,
    Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    _id: string;
    time: string;
    votes: string[];
}

interface PollData {
    _id?: string;
    title: string;
    description: string;
    options: Option[];
    totalVoters?: number;
    currentUser?: string;
}

interface PollContentProps {
    pollData: PollData;
    pollId: string;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

export function PollContent({ pollData, pollId }: PollContentProps) {

    const safePollData: PollData = {
        ...pollData,
        options: pollData?.options || [],
        title: pollData?.title || "No Poll Title",
        description: pollData?.description || "",
        totalVoters: (() => {
            const uniqueVoters = new Set<string>();
            pollData.options?.forEach(option => option.votes?.forEach(voter => uniqueVoters.add(voter)));
            return uniqueVoters.size > 0 ? uniqueVoters.size : 1;
        })(),
        currentUser: pollData?.currentUser || 'Anonymous',
    };

    const [poll, setPoll] = useState(safePollData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy');

    const [userVotes, setUserVotes] = useState<string[]>(
        safePollData.options
            .filter(option => Array.isArray(option.votes) && option.votes.includes(safePollData.currentUser!))
            .map(option => option._id)
    );

    const handleVote = async (optionId: string) => {
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);
        const currentlyVoted = userVotes.includes(optionId);
        const originalUserVotes = userVotes;
        const originalPollData = poll;

        setUserVotes(prevVotes =>
            currentlyVoted
                ? prevVotes.filter(id => id !== optionId)
                : [...prevVotes, optionId]
        );

        setPoll(prevPoll => {
            const newOptions = prevPoll.options.map(option => {
                if (option._id === optionId) {
                    const newVotes = currentlyVoted
                        ? option.votes.filter(voter => voter !== prevPoll.currentUser)
                        : [...option.votes, prevPoll.currentUser!];

                    return { ...option, votes: newVotes };
                }
                return option;
            });

            const uniqueVoters = new Set<string>();
            newOptions.forEach(opt => opt.votes.forEach(voter => uniqueVoters.add(voter)));
            const newTotalVoters = uniqueVoters.size;

            return {
                ...prevPoll,
                options: newOptions,
                totalVoters: newTotalVoters > 0 ? newTotalVoters : 1
            };
        });


        try {
            const res = await fetch(`/api/poll/${pollId}/vote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    optionId: optionId,
                    action: currentlyVoted ? 'remove' : 'add',
                    voterName: poll.currentUser
                }),
            });

            if (!res.ok) {
                setUserVotes(originalUserVotes);
                setPoll(originalPollData);
                const errorData = await res.json();
                setError(errorData.message || 'Voting operation failed.');
            } else {
                console.log(`[CLIENT]: Vote ID ${pollId} successfully updated.`);
            }

        } catch (_) {
            setUserVotes(originalUserVotes);
            setPoll(originalPollData);
            setError('Network Error: Could not connect to the server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        const pollUrl = window.location.href;
        navigator.clipboard.writeText(pollUrl).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('copy'), 2000);
        }).catch(() => {
            alert("Failed to copy link. Please copy the URL manually.");
        });
    };

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden py-12 md:py-20">

            <div className="absolute inset-0 -z-20 overflow-hidden">
                <div className="absolute -top-1/4 left-1/4 w-full h-full max-w-2xl">
                    <div className="w-full h-full rounded-full bg-primary/10 blur-[120px] opacity-40" />
                </div>
                <div className="absolute -bottom-1/4 right-0 w-full h-full max-w-3xl">
                    <div className="w-full h-full rounded-full bg-accent/10 blur-[100px] opacity-50" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center space-y-4 mb-10 md:mb-16"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={fadeInUp} className="inline-block">
                        <div
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                            <Calendar className="w-4 h-4"/>
                            Poll ID: <span className="font-semibold">{pollId}</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance"
                    >
                        {poll.title}
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-lg text-foreground/60 max-w-2xl mx-auto"
                    >
                        {poll.description}
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 pt-2">
                        <span className="flex items-center gap-2 text-sm text-foreground/70">
                            <User className="w-4 h-4 text-accent"/>
                            Participants: {poll.totalVoters} people
                        </span>
                    </motion.div>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 text-center font-medium"
                        >
                            Error: {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {poll.options.map((option) => {
                        const isVoted = userVotes.includes(option._id);
                        const voteCount = option.votes.length;
                        const votePercentage = (poll.totalVoters && poll.totalVoters > 0) ? (voteCount / poll.totalVoters) * 100 : 0;

                        return (
                            <motion.div
                                key={option._id}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className={`
                                    p-6 rounded-2xl border transition-all duration-300 relative
                                    ${
                                    isVoted
                                        ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                                        : "border-border bg-card/50 hover:border-accent/50"
                                }
                                `}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {option.time}
                                    </h3>
                                    <motion.button
                                        onClick={() => handleVote(option._id)}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors border w-full sm:w-auto
                                            ${
                                            isVoted
                                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                                                : "bg-muted text-foreground/80 border-border hover:bg-muted/90"
                                        } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.span
                                                key={isSubmitting ? "loading" : isVoted ? "voted" : "vote"}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-2"
                                            >
                                                {isSubmitting
                                                    ? <Loader2 className="w-4 h-4 animate-spin"/>
                                                    : isVoted
                                                        ? <Check className="w-4 h-4"/>
                                                        : <ArrowRight className="w-4 h-4"/>
                                                }
                                                {isSubmitting ? "Loading" : isVoted ? "Voted" : "Vote"}
                                            </motion.span>
                                        </AnimatePresence>
                                    </motion.button>
                                </div>

                                <div className="mt-5">
                                    <div className="flex justify-between items-center text-sm text-foreground/70 mb-2">
                                        <span>{voteCount} / {poll.totalVoters} votes</span>
                                        <span className="font-semibold"
                                              style={{color: votePercentage >= 70 ? 'var(--color-primary)' : 'var(--color-accent)'}}>
                                            {Math.round(votePercentage)}%
                                        </span>
                                    </div>
                                    <div className="bg-muted rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${votePercentage}%` }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.2,
                                                ease: [0.25, 0.1, 0.25, 1.0]
                                            }}
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent))'
                                            }}
                                        />
                                    </div>
                                </div>

                                {option.votes.length > 0 && (
                                    <motion.div
                                        className="mt-5 pt-5 border-t border-border/70"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <p className="text-sm font-medium text-foreground/80 mb-3">Voters:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {option.votes.map((voter) => (
                                                <span
                                                    key={voter}
                                                    className={`text-xs px-3 py-1.5 rounded-full border ${
                                                        voter === poll.currentUser
                                                            ? 'bg-accent/10 text-accent border-accent/30 font-medium'
                                                            : 'bg-muted/50 text-foreground/70 border-muted'
                                                    }`}
                                                >
                                                    {voter} {voter === poll.currentUser && '(You)'}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    className="mt-20 pt-10 border-t border-border/70 text-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: poll.options.length * 0.1 + 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-foreground">Ready to Share?</h2>
                    <p className="text-lg text-foreground/60 max-w-xl mx-auto">
                        Copy the link and send it to your teammates to speed up the voting process.
                    </p>
                    <motion.button
                        onClick={handleCopyLink}
                        whileHover={{ scale: copyStatus === 'copied' ? 1 : 1.05 }}
                        whileTap={{ scale: copyStatus === 'copied' ? 1 : 0.95 }}
                        className={`inline-flex items-center gap-3 px-8 py-3 rounded-xl text-lg font-semibold transition-colors duration-200 shadow-xl
                            ${
                            copyStatus === 'copied'
                                ? "bg-green-500/80 text-white border border-green-600/50"
                                : "bg-primary text-primary-foreground border border-primary hover:bg-primary/90"
                        }
                        `}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={copyStatus}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                {copyStatus === 'copied'
                                    ? <Check className="w-5 h-5"/>
                                    : <Copy className="w-5 h-5"/>
                                }
                                {copyStatus === 'copied' ? "Copied!" : "Copy Link"}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

            </div>
        </main>
    );
}
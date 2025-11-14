"use client"

import { useState } from 'react';
// DİQQƏT: Animasiyalar və 'Loading' ikonu üçün əlavə importlar
import {
    User,
    Calendar,
    Check,
    ArrowRight,
    Loader2, // Yüklənmə ikonu
    Share2, // Paylaşma ikonu
    Copy // Kopyalama ikonu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Datalarınızın tipi (API-dən gələnə uyğun olmalıdır)
interface Option {
    _id: string; // MongoDB sub-document ID
    time: string;
    votes: string[];
}

interface PollData {
    _id?: string; // MongoDB document ID
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

// --- Animasiya Variantları ---

// Elementlərin aşağıdan yuxarı səlis şəkildə daxil olması üçün
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

// Kartlar kimi elementlərin bir-birinin ardınca daxil olması üçün
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Hər element arasında 0.1 saniyə
        }
    }
};

// --- Komponent ---

export function PollContent({ pollData, pollId }: PollContentProps) {

    const safePollData: PollData = {
        ...pollData,
        options: pollData?.options || [],
        title: pollData?.title || "Səsvermə Başlığı Yoxdur",
        description: pollData?.description || "",
        totalVoters: pollData?.totalVoters || (pollData?.options?.length || 0),
        currentUser: pollData?.currentUser || 'Anonim',
    };

    const [poll, setPoll] = useState(safePollData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'copy' | 'copied'>('copy'); // Kopyalama statusu

    // İstifadəçinin səs verdiyi variantların ID-lərini saxlayır
    const [userVotes, setUserVotes] = useState<string[]>(
        poll.options
            .filter(option => Array.isArray(option.votes) && option.votes.includes(poll.currentUser))
            .map(option => option._id)
    );

    const handleVote = async (optionId: string) => {
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);
        const currentlyVoted = userVotes.includes(optionId);
        const originalUserVotes = userVotes;

        // Optimistik Yenilənmə (Local state-i dərhal yeniləyir)
        setUserVotes(prevVotes =>
            currentlyVoted
                ? prevVotes.filter(id => id !== optionId)
                : [...prevVotes, optionId]
        );

        // Həmçinin, Poll state-i də optimistik olaraq yenilənməlidir ki, UI dərhal dəyişsin
        setPoll(prevPoll => {
            const newOptions = prevPoll.options.map(option => {
                if (option._id === optionId) {
                    const newVotes = currentlyVoted
                        ? option.votes.filter(voter => voter !== prevPoll.currentUser)
                        : [...option.votes, prevPoll.currentUser];

                    // totalVoters-i düzgün hesablamaq üçün bütün voteləri yenidən sayırıq
                    const allVotes = new Set<string>();
                    prevPoll.options.forEach(opt => {
                        if (opt._id === optionId) {
                            newVotes.forEach(v => allVotes.add(v));
                        } else {
                            opt.votes.forEach(v => allVotes.add(v));
                        }
                    });

                    return { ...option, votes: newVotes };
                }
                return option;
            });

            // Yeni totalVoters-i yenidən hesabla
            const uniqueVoters = new Set<string>();
            newOptions.forEach(opt => opt.votes.forEach(voter => uniqueVoters.add(voter)));
            const newTotalVoters = uniqueVoters.size;


            return {
                ...prevPoll,
                options: newOptions,
                totalVoters: newTotalVoters > 0 ? newTotalVoters : 1 // Sıfır olarsa, minimum 1 qoyuruq ki, bölmə xətası olmasın
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
                // Əməliyyat uğursuz olarsa, state-i əvvəlki vəziyyətinə qaytarın (Rollback)
                setUserVotes(originalUserVotes);
                setPoll(safePollData); // Səhvin miqyasına görə bunu sadəlik üçün tam dataya qaytarırıq
                const errorData = await res.json();
                setError(errorData.message || 'Səsvermə əməliyyatı uğursuz oldu.');
            } else {
                // API-dan gələn son məlumatlarla state-i yeniləmək olar (isteğe bağlı)
                // const updatedPoll = await res.json();
                // setPoll(updatedPoll);
                console.log(`[CLIENT]: Səsvermə ID ${pollId} uğurla yeniləndi.`);
            }

        } catch (err) {
            // Şəbəkə xətası olarsa, state-i əvvəlki vəziyyətinə qaytarın (Rollback)
            setUserVotes(originalUserVotes);
            setPoll(safePollData);
            setError('Şəbəkə xətası: Sunucuya qoşulmaq mümkün olmadı.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        const pollUrl = window.location.href; // Cari URL-i kopyalayır
        navigator.clipboard.writeText(pollUrl).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('copy'), 2000); // 2 saniyə sonra statusu sıfırla
        }).catch(() => {
            alert("Link kopyalanmadı. Zəhmət olmasa URL-i əl ilə kopyalayın.");
        });
    };

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden py-12 md:py-20">

            {/* --- Aurora Fon Effektləri --- */}
            <div className="absolute inset-0 -z-20 overflow-hidden">
                <div className="absolute -top-1/4 left-1/4 w-full h-full max-w-2xl">
                    <div className="w-full h-full rounded-full bg-primary/10 blur-[120px] opacity-40" />
                </div>
                <div className="absolute -bottom-1/4 right-0 w-full h-full max-w-3xl">
                    <div className="w-full h-full rounded-full bg-accent/10 blur-[100px] opacity-50" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Başlıq Bloku (Animasiya ilə) */}
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
                            Səsvermə ID: <span className="font-semibold">{pollId}</span>
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
                            İştirakçılar: {poll.totalVoters} nəfər
                        </span>
                    </motion.div>
                </motion.div>

                {/* Xəta Mesajı (Animasiya ilə) */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 text-center font-medium"
                        >
                            Xəta: {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Səsvermə Kartları (Stagger Animasiyası ilə) */}
                <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {poll.options.map((option) => {
                        const isVoted = userVotes.includes(option._id);
                        const voteCount = option.votes.length;
                        // totalVoters 0 olarsa, bölmə xətası olmaması üçün yoxlama
                        const votePercentage = (poll.totalVoters && poll.totalVoters > 0) ? (voteCount / poll.totalVoters) * 100 : 0;

                        return (
                            <motion.div
                                key={option._id}
                                variants={fadeInUp} // Hər kart aşağıdan yuxarı səlis daxil olur
                                whileHover={{ scale: 1.02, y: -4 }} // Hover zamanı yüngül effekt
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
                                        {/* Düymənin içindəki mətnin animasiyası */}
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
                                                {isSubmitting ? "Yüklənir" : isVoted ? "Səs Verilib" : "Səs Ver"}
                                            </motion.span>
                                        </AnimatePresence>
                                    </motion.button>
                                </div>

                                {/* Progress Bar (Animasiya ilə) */}
                                <div className="mt-5">
                                    <div className="flex justify-between items-center text-sm text-foreground/70 mb-2">
                                        <span>{voteCount} / {poll.totalVoters} səs</span>
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
                                                delay: 0.2, // Yüngül gecikmə
                                                ease: [0.25, 0.1, 0.25, 1.0]
                                            }}
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent))'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Səs Verənlərin Siyahısı (Animasiya ilə) */}
                                {option.votes.length > 0 && (
                                    <motion.div
                                        className="mt-5 pt-5 border-t border-border/70"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <p className="text-sm font-medium text-foreground/80 mb-3">Səs verənlər:</p>
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
                                                    {voter} {voter === poll.currentUser && '(Sən)'}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Nəticə və Paylaşma Bloku */}
                <motion.div
                    className="mt-20 pt-10 border-t border-border/70 text-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: poll.options.length * 0.1 + 0.5 }} // Kartlar bitdikdən sonra
                >
                    <h2 className="text-3xl font-bold text-foreground">Paylaşmağa Hazırsan?</h2>
                    <p className="text-lg text-foreground/60 max-w-xl mx-auto">
                        Link kopyalayın və komanda yoldaşlarınıza göndərərək səsverməni sürətləndirin.
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
                                {copyStatus === 'copied' ? "Kopyalandı!" : "Link Kopyala"}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </motion.div>

            </div>
        </main>
    );
}
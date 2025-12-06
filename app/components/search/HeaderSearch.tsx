import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { UI_PATHS} from "@/lib/routes";
import {getPollStatusClient} from "@/lib/data/client/get-poll-status";

export default function HeaderSearch() {
    const [pollId, setPollId] = useState("");
    const [isError, setIsError] = useState(false);
    const router = useRouter();

    const checkPoll = useCallback(async () => {
        if (!pollId.trim()) {
            setIsError(true);
            return;
        }
        setIsError(false);

        try {
            const status = await getPollStatusClient(pollId);

            if (status === 200) {
                router.push(UI_PATHS.POLL_DETAIL(pollId));
                setPollId("");
            }
            else {
                setIsError(true);
            }
        } catch (e) {
            console.error("Səsvermə yoxlanılarkən xəta:", e);
            setIsError(true);
        }
    }, [pollId, router]);

    const handleKeyDown = useCallback(async (e: { key: string; }) => {
        if (e.key === 'Enter') {
            await checkPoll();
        }
    }, [checkPoll]);

    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        setPollId(value);
        if (isError && value.trim()) {
            setIsError(false);
        }
    };

    const dynamicWidthStyle = useMemo(() => {
        const baseWidth = 256;
        const charWidth = 8;
        const initialCharsToFill = 27;

        let calculatedWidth;

        if (pollId.length <= initialCharsToFill) {
            calculatedWidth = baseWidth;
        } else {
            const extraWidth = (pollId.length - initialCharsToFill) * charWidth;
            calculatedWidth = baseWidth + extraWidth;
        }
        const maxWidth = 350;
        const finalWidth = Math.min(calculatedWidth, maxWidth);

        return {
            width: `${finalWidth}px`
        };
    }, [pollId.length]);


    const isSubmitDisabled = !pollId.trim();

    return (
        <div className="flex items-center gap-2">

            <div className="relative flex items-center shrink-0" style={dynamicWidthStyle}>

                <Search className="absolute left-3 w-4 h-4 text-foreground/50" />

                <input
                    type="text"
                    value={pollId}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search Poll ID"

                    className={`
                        w-full h-10 pl-10 pr-4 text-sm bg-border/50 rounded-full transition-all
                        focus:outline-none focus:ring-1 
                        placeholder:text-foreground/50
                        ${isError
                        ? 'border border-red-600 focus:border-red-600 focus:ring-red-600/50'
                        : 'border border-transparent focus:border-primary/50 focus:ring-primary/50'
                    }
                    `}
                />
            </div>

            <button
                onClick={checkPoll}
                disabled={isSubmitDisabled}
                className={`
                    p-2 rounded-full h-8 w-8 shrink-0 transition-colors flex items-center justify-center
                    ${(isError) 
                    ? 'bg-red-500 text-white hover:bg-red-800 disabled:bg-red-500/50 disabled:cursor-not-allowed'
                    : (isSubmitDisabled)
                    ? 'bg-primary text-primary-foreground disabled:bg-primary/70 disabled:cursor-not-allowed'
                    :'bg-primary text-primary-foreground hover:bg-primary/90'
                }
                `}
            >
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}
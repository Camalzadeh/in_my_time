"use client";

import { useState, useMemo } from "react"; // useMemo əlavə edildi
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react"; // ArrowRight ikonu əlavə edildi

export default function HeaderSearch() {
    const [pollId, setPollId] = useState("");
    const [isError, setIsError] = useState(false);
    const router = useRouter();

    const checkPoll = async () => {
        if (!pollId.trim()) {
            setIsError(true);
            return;
        }

        setIsError(false);

        try {
            const res = await fetch(`/api/polls/${pollId}`);

            if (res.status === 200) {
                router.push(`/poll/${pollId}`);
                setPollId("");
            }
            else {
                // Xəta halında qırmızı sərhədi göstər
                setIsError(true);
            }
        } catch (_) {
            setIsError(true);
        }
    };

    const handleKeyDown = (e: { key: string; }) => {
        if (e.key === 'Enter') {
            checkPoll();
        }
    };

    // Dinamik Eni Hesablamaq Üçün useMemo istifadə edirik
    const dynamicWidthStyle = useMemo(() => {
        // Təxmini başlanğıc en (əvvəlki kodunuzdakı 'w-64' kimi)
        const baseWidth = 256; // w-64 təxminən 256px-dir

        // Hər simvol üçün əlavə ediləcək piksel (təxmini)
        const charWidth = 8;

        // Başlanğıc eni tutmaq üçün tələb olunan simvol sayı (256 - 40 (padding/ikon yeri)) / 8
        // 27 simvoldan sonra artım başlasın (Başlanğıc eni dolu göstərmək üçün)
        const initialCharsToFill = 27;

        let calculatedWidth;

        if (pollId.length <= initialCharsToFill) {
            // Mətn hələ qısa olanda, ilkin böyük eni saxla
            calculatedWidth = baseWidth;
        } else {
            // Mətn initialCharsToFill-dən uzun olduqda, eni artır
            const extraWidth = (pollId.length - initialCharsToFill) * charWidth;
            calculatedWidth = baseWidth + extraWidth;
        }

        // Maksimum en (məsələn, 350px)
        const maxWidth = 350;

        // Eni maksimum həddə məhdudlaşdır
        const finalWidth = Math.min(calculatedWidth, maxWidth);

        return {
            width: `${finalWidth}px`
        };
    }, [pollId.length]);


    return (
        // flex-dən w-full-u çıxardıq
        <div className="flex items-center gap-2">

            {/* Axtarış Input Konteyneri - Dinamik eni style ilə tətbiq etdik */}
            <div className="relative flex items-center shrink-0" style={dynamicWidthStyle}>

                <Search className="absolute left-3 w-4 h-4 text-foreground/50" />

                <input
                    type="text"
                    value={pollId}
                    onChange={(e) => setPollId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search Poll ID"

                    // Sərhəd (Border) üçün dinamik sinif
                    className={`
                        w-full h-10 pl-10 pr-4 text-sm bg-border/50 rounded-full transition-all
                        focus:outline-none focus:ring-1 
                        placeholder:text-foreground/50
                        ${isError
                        ? 'border border-red-600 focus:border-red-600 focus:ring-red-600/50' // Xəta halında QIRMIZI
                        : 'border border-transparent focus:border-primary/50 focus:ring-primary/50' // Normal hal
                    }
                    `}
                />
            </div>

            {/* Yeni, Kiçik İkonlu Submit Düyməsi */}
            <button
                onClick={checkPoll}
                // Dəyişənin boş və ya xəta halında rəngini dəyişmək üçün sinif
                className={`
                    p-2 rounded-full h-8 w-8 shrink-0 transition-colors flex items-center justify-center
                    ${(isError)
                    ? 'bg-red-500 text-white hover:bg-red-800' // Xəta/Boş olduqda
                    : 'bg-primary text-primary-foreground hover:bg-primary/90' // Normal halda
                }
                `}
                // Düyməni disable etmək əvəzinə, rəngini dəyişib istifadəçiyə siqnal veririk
            >
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}
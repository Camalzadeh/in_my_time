// hooks/use-voter-identity.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // uuid paketi quraşdırılmalıdır: npm install uuid @types/uuid

const VOTER_ID_KEY = 'inmytime_voter_id';
const VOTER_NAME_KEY = 'inmytime_voter_name';


interface VoterIdentity {
    voterId: string;
    voterName: string | null;
    isIdentityReady: boolean;
    setVoterName: (name: string) => void;
}

const useVoterIdentity = (): VoterIdentity => {
    // ID state
    const [voterId, setVoterId] = useState<string>('');
    // Nickname state
    const [voterName, setLocalVoterName] = useState<string | null>(null);
    // Yüklənmənin bitdiyini göstərir (localStorage oxunub/yazılıb)
    const [isIdentityReady, setIsIdentityReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Voter ID-ni yoxlamaq/yaratmaq
        let storedId = localStorage.getItem(VOTER_ID_KEY);
        if (!storedId) {
            // Əgər ID yoxdursa, yeni unikal ID yaradın
            storedId = uuidv4();
            localStorage.setItem(VOTER_ID_KEY, storedId);
        }
        setVoterId(storedId);

        // 2. Nickname-i yoxlamaq
        const storedName = localStorage.getItem(VOTER_NAME_KEY);
        setLocalVoterName(storedName);

        setIsIdentityReady(true);
    }, []);

    // 3. Nickname-i yeniləmək üçün callback funksiya
    const handleSetVoterName = useCallback((name: string) => {
        localStorage.setItem(VOTER_NAME_KEY, name);
        setLocalVoterName(name);
    }, []);


    return {
        voterId,
        voterName,
        isIdentityReady,
        setVoterName: handleSetVoterName,
    };
};

export default useVoterIdentity;
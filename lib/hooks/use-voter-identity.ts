'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const VOTER_ID_KEY = 'inmytime_voter_id';
const VOTER_NAME_KEY = 'inmytime_voter_name';


interface VoterIdentity {
    voterId: string;
    voterName: string | null;
    isIdentityReady: boolean;
    setVoterName: (name: string) => void;
}

const useVoterIdentity = (): VoterIdentity => {
    const [voterId, setVoterId] = useState<string>('');
    const [voterName, setLocalVoterName] = useState<string | null>(null);
    const [isIdentityReady, setIsIdentityReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let storedId = localStorage.getItem(VOTER_ID_KEY);
        if (!storedId) {
            storedId = uuidv4();
            localStorage.setItem(VOTER_ID_KEY, storedId);
        }
        setVoterId(storedId);

        const storedName = localStorage.getItem(VOTER_NAME_KEY);
        setLocalVoterName(storedName);

        setIsIdentityReady(true);
    }, []);

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
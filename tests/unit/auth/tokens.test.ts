import {
    createToken,
    hashToken,
    tokenMatchesHash,
    ownerCookieName,
    voterCookieName,
} from '@/lib/auth/tokens';

describe('createToken', () => {
    it('returns 128 bits as hex', () => {
        expect(createToken()).toMatch(/^[0-9a-f]{32}$/);
    });

    it('does not repeat itself', () => {
        const seen = new Set(Array.from({ length: 500 }, createToken));
        expect(seen.size).toBe(500);
    });
});

describe('hashToken', () => {
    it('produces a SHA-256 hex digest', () => {
        expect(hashToken('abc')).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is stable for the same input', () => {
        expect(hashToken('abc')).toBe(hashToken('abc'));
    });

    it('does not reveal the token', () => {
        const token = createToken();
        expect(hashToken(token)).not.toContain(token);
    });
});

describe('tokenMatchesHash', () => {
    it('accepts the token it was made from', () => {
        const token = createToken();
        expect(tokenMatchesHash(token, hashToken(token))).toBe(true);
    });

    it('rejects a different token', () => {
        expect(tokenMatchesHash(createToken(), hashToken(createToken()))).toBe(false);
    });

    it('rejects a missing token or hash instead of throwing', () => {
        expect(tokenMatchesHash(undefined, hashToken('a'))).toBe(false);
        expect(tokenMatchesHash('a', undefined)).toBe(false);
        expect(tokenMatchesHash('', '')).toBe(false);
    });

    it('rejects a hash of the wrong length without throwing', () => {
        // timingSafeEqual throws on a length mismatch, so this must be guarded.
        expect(tokenMatchesHash('a', 'abcd')).toBe(false);
    });

    it('rejects a hash that is not hex', () => {
        expect(tokenMatchesHash('a', 'z'.repeat(64))).toBe(false);
    });
});

describe('cookie names', () => {
    it('are scoped per poll, so one poll grants nothing about another', () => {
        expect(ownerCookieName('p1')).toBe('imt_o_p1');
        expect(voterCookieName('p1')).toBe('imt_v_p1');
        expect(ownerCookieName('p1')).not.toBe(ownerCookieName('p2'));
    });

    it('keeps owner and voter tokens apart', () => {
        expect(ownerCookieName('p1')).not.toBe(voterCookieName('p1'));
    });
});

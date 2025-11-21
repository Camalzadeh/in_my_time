import { getBaseUrl, getPollData } from '@/lib/data-fetcher';

jest.mock('next/headers', () => ({
    headers: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    notFound: jest.fn().mockImplementation(() => {
        throw new Error('NOT_FOUND_CALLED');
    }),
}));

global.fetch = jest.fn();

describe('getBaseUrl', () => {
    const mockHeaders = require('next/headers').headers;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return default localhost URL when host header is missing', async () => {
        mockHeaders.mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        });

        const url = await getBaseUrl();
        expect(url).toBe('http://localhost:3000');
    });

    it('should return HTTP URL for a local host header', async () => {
        mockHeaders.mockReturnValue({
            get: jest.fn().mockReturnValue('127.0.0.1:3000'),
        });

        const url = await getBaseUrl();
        expect(url).toBe('http://127.0.0.1:3000');
    });

    it('should return HTTPS URL for a production host header', async () => {
        mockHeaders.mockReturnValue({
            get: jest.fn().mockReturnValue('inmytime.app'),
        });

        const url = await getBaseUrl();
        expect(url).toBe('https://inmytime.app');
    });
});

describe('getPollData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        require('next/headers').headers.mockReturnValue({
            get: jest.fn().mockReturnValue('test.app'),
        });
    });

    it('should return data on successful (200 OK) API response', async () => {
        const mockData = { id: 'abc', title: 'Test Poll' };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockData,
        });

        const data = await getPollData('testId');

        expect(fetch).toHaveBeenCalledWith('https://test.app/api/poll/testId', expect.any(Object));
        expect(data).toEqual(mockData);
    });

    it('should call notFound() on a 404 response', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        await expect(getPollData('testId')).rejects.toThrow('NOT_FOUND_CALLED');

        expect(require('next/navigation').notFound).toHaveBeenCalled();
    });

    it('should throw an error on other API failures (500)', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(getPollData('testId')).rejects.toThrow(/Failed to fetch poll data/);

        expect(require('next/navigation').notFound).not.toHaveBeenCalled();
    });
});
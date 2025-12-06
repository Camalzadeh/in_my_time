export const UI_PATHS = {
    BASE: '/',
    HOME: '/home',
    CREATE_POLL: '/polls/create',
    POLL_DETAIL: (id: string) => `/polls/${id}`,
};

export const API_ROUTES = {
    POLLS: '/api/polls',
    POLL_DETAIL: (id: string) => `/api/polls/${id}`,
    VOTE_API: (id: string) => `/api/polls/${id}/vote`,
    POLL_RESULTS: (id: string) => `/api/polls/${id}/results`,
};
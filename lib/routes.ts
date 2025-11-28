export const UI_PATHS = {
    HOME: '/',
    CREATE_POLL: '/poll/create',
    POLL_DETAIL: (id: string) => `/poll/${id}`,
};

export const API_ROUTES = {
    POLLS: '/api/polls',
    POLL_DETAIL: (id: string) => `/api/poll/${id}`,
    VOTE_API: (id: string) => `/api/poll/${id}/vote`,
    POLL_RESULTS: (id: string) => `/api/poll/${id}/results`,
};
export const UI_PATHS = {
    BASE: '/',
    HOME: '/home',
    CREATE_POLL: '/polls/create',
    POLL_DETAIL: (id: string) => `/polls/${id}`,
};

export const API_ROUTES = {
    POLLS_API: '/api/polls',
    POLL_DETAIL_API: (id: string) => `/api/polls/${id}`,
    VOTE_POLL_API: (id: string) => `/api/polls/${id}/vote`,
    FINALIZE_POLL_API: (id: string) => `/api/polls/${id}/finalize`,
};
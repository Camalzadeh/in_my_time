// Field limits, shared by the schema, the validators and the forms.
//
// These deliberately live away from models/Poll.ts. Forms need them to set
// maxLength, and forms are client components — importing them from the model
// pulled mongoose into the browser bundle, where it cannot run. The page
// server-rendered fine and then threw on hydration, so it only showed up in a
// real browser.
//
// Nothing may be imported here. That is the point.

export const LIMITS = {
    TITLE_MAX: 200,
    DESCRIPTION_MAX: 2000,
    DATES_MAX: 60,
    VOTER_NAME_MAX: 60,
    SLOTS_PER_VOTE_MAX: 2000,
    SLOT_DURATION_MIN: 5,
    SLOT_DURATION_MAX: 480,
} as const;

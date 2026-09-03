import { z } from 'zod';
import { LIMITS } from '@/models/Poll';
import { isValidTimeZone } from '@/lib/time/zone';
import { parseCalendarDate, parseWallTime } from '@/lib/time/slots';

// Input validation.
//
// `zod` was already a dependency but no route used it. The visible consequence
// was that a badly formatted date returned 500 "Server error" — the user saw
// the server break because of their own typo. Every bad input is a 400 now, and
// it names the field.

const calendarDate = z
    .string()
    .refine((v) => parseCalendarDate(v) !== null, 'must be a real date in YYYY-MM-DD form');

const wallTime = z
    .string()
    .refine((v) => parseWallTime(v) !== null, 'must be a time in HH:mm form');

const timezone = z.string().refine(isValidTimeZone, 'unrecognised time zone');

export const createPollSchema = z
    .object({
        title: z.string().trim().min(1, 'cannot be empty').max(LIMITS.TITLE_MAX),
        description: z.string().trim().max(LIMITS.DESCRIPTION_MAX).optional().default(''),
        config: z.object({
            targetDates: z
                .array(calendarDate)
                .min(1, 'pick at least one day')
                .max(LIMITS.DATES_MAX, `pick at most ${LIMITS.DATES_MAX} days`)
                // Deduplicate here so the stored document is always tidy.
                .transform((dates) => [...new Set(dates)].sort()),
            dailyStartTime: wallTime,
            dailyEndTime: wallTime,
            slotDuration: z
                .number()
                .int('must be a whole number of minutes')
                .min(LIMITS.SLOT_DURATION_MIN)
                .max(LIMITS.SLOT_DURATION_MAX),
            timezone,
        }),
    })
    .refine(
        ({ config }) => {
            const start = parseWallTime(config.dailyStartTime)!;
            const end = parseWallTime(config.dailyEndTime)!;
            return start.hour * 60 + start.minute < end.hour * 60 + end.minute;
        },
        { message: 'must be after the start time', path: ['config', 'dailyEndTime'] },
    );

export const voteSchema = z.object({
    voterId: z.string().trim().min(1).max(100),
    voterName: z.string().trim().min(1, 'cannot be empty').max(LIMITS.VOTER_NAME_MAX),
    selectedSlots: z
        .array(z.string().datetime({ message: 'must be an ISO-8601 timestamp' }))
        .max(LIMITS.SLOTS_PER_VOTE_MAX, 'too many slots selected'),
});

export const clearVoteSchema = z.object({
    voterId: z.string().trim().min(1).max(100),
});

export const finalizeSchema = z.object({
    /** The chosen slot, ISO-8601. */
    finalSlot: z.string().datetime({ message: 'must be an ISO-8601 timestamp' }),
});

/** Turns a zod error into one line a user can act on. */
export function firstIssue(error: z.ZodError): string {
    const issue = error.issues[0];
    if (!issue) return 'Invalid request body.';

    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
}

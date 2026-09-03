// Shown while a server component waits on the database. Without it the browser
// sat on the previous page with no sign that anything was happening.
export default function Loading() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-screen items-center justify-center bg-background"
        >
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span className="sr-only">Loading</span>
        </div>
    );
}

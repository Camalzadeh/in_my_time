import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import PollContent from "@/app/components/poll/PollRealtimeUpdates";
import { getPollDataServer } from "@/lib/data/server/get-poll-data";

interface Context {
  params: Promise<{
    id: string;
  }>
}

export default async function PollPage(context: Context) {
  const ctx = await context.params;
  const pollId = ctx.id;

  if (!pollId) return null;

  try {
    const data = await getPollDataServer(pollId);

    if (!data) {
      throw new Error("Poll not found");
    }

    return <PollContent pollId={pollId} initialPollData={data} />;

  } catch (_) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <FileQuestion className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Poll Not Found
          </h2>
          <p className="text-gray-500 max-w-md mb-8">
            The poll you are looking for does not exist, has been deleted, or the link is incorrect.
          </p>
          <Link
              href="/home"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
    );
  }
}
import PollContent from "@/app/components/poll/PollRealtimeUpdates";
import {getPollDataServer} from "@/lib/data/server/get-poll-data";

interface Context{
  params : Promise<{
    id: string;
  }>
}
export default async function PoolPage(context:Context){
  const ctx = await context.params;
  const pollId = ctx.id;
  if(!pollId) return;
  if(!pollId) return;
  const data = await getPollDataServer(pollId);

  return <PollContent pollId={pollId} initialPollData={data} />
}
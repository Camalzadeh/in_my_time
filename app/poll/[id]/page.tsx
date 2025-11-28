import PollContent from "@/app/components/poll/PollContent";
import {getPollData} from "@/lib/data-fetcher";

interface Context{
    params : Promise<{
        id: string;
    }>
}
export default async function PoolPage(context:Context){
    let ctx = await context.params;
    let pollId = ctx.id;
    if(!pollId) return;
    let data = await getPollData(pollId);

    return <PollContent pollId={pollId} initialPollData={data} />
}
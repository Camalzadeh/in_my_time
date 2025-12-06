import {headers} from "next/headers";

export  async function getBaseUrl() {
    const headersList = await headers();
    const host = headersList.get('host');

    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return `http://${host}`;
    }
    if (host) {
        return `https://${host}`;
    }
    return '';
}

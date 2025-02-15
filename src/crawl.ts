
export function  normalizeURL( url : string) :string {
    console.log(`url - ${url}`)
    const urlobj = new URL(url);
        const urlHost = `${urlobj.hostname}${urlobj.pathname}`.toLocaleLowerCase();
        const lastChar = urlHost.slice(-1);
   
        return lastChar ==='/' ? urlHost.slice(0,-1) : urlHost;

    }
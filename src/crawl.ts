
import { JSDOM } from 'jsdom'

export function getURLsFromHTML(htmlBody: string, baseURL: string): Array<string> {
    // return all clickable link in an array of strings
    const urls = new Array<string>;
    const dom = new JSDOM(htmlBody);
    dom.window.document.querySelectorAll('a').forEach((e) => {
        console.log(`href ${e.href}`)
        if (e.href.slice(0,1)==='/'){
            // relative
            urls.push(`${baseURL}${e.href}`)
        }
        else{
            // absolute
            urls.push(e.href);
        }
    });
    return urls;
}

export function normalizeURL(url: string): string {
    // removes protocol and normalized the host and path
    const urlobj = new URL(url);
    const urlHost = `${urlobj.hostname}${urlobj.pathname}`.toLocaleLowerCase();
    const lastChar = urlHost.slice(-1);

    return lastChar === '/' ? urlHost.slice(0, -1) : urlHost;
}

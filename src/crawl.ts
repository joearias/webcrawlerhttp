
import { JSDOM } from 'jsdom'

export function getURLsFromHTML(htmlBody: string, baseURL: string): Array<string> {
    // return all clickable link in an array of strings
    const urls = new Array<string>;
    const dom = new JSDOM(htmlBody);
    dom.window.document.querySelectorAll('a').forEach((e) => {
        console.log(`href ${e.href}`)
        if (e.href.slice(0,1)==='/'){
            // relative
            try{
                const urlobj = new URL(`${baseURL}${e.href}`);
                urls.push(urlobj.href);
            }
            catch (error) {
                console.log(`error with relative url ${error}`)
            }
        }
        else{
            // absolute
            try {
                const urlobj = new URL(e.href);
                urls.push(urlobj.href);
            }
            catch(error) {
                console.log(`error with absolute url ${error}`)
            }
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

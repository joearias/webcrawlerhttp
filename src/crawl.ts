
import { JSDOM } from 'jsdom'

export async function crawlPage(baseURL: string, currentURL: string, pages: { [x: string]: number }) {
    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)

    if (baseURLObj.hostname !== currentURLObj.hostname) {
        return pages
    }
    const normalizedCurrentURL = normalizeURL(currentURL)
    if (pages[normalizedCurrentURL] > 0) {
        pages[normalizedCurrentURL]++
        return pages;
    }
    pages[normalizedCurrentURL] = 1
    console.log(`actively crawling url ${currentURL}`)


    try {
        const resp = await fetch(currentURL);
        if (resp.status > 399) {
            console.log(`error in fetch with status code ${resp.status} on page ${currentURL}`)
            return pages
        }

        const contentType = resp.headers.get("content-type");
        if (!contentType?.includes("text/html")) {
            console.log(`non html response, content-type ${contentType} on page: ${currentURL} `)
            return pages
        }
        const htmlBody = await resp.text()
        const nextURLs = getURLsFromHTML(htmlBody, baseURL)
        for (const nextURL of nextURLs) {
            pages = await crawlPage(baseURL, nextURL, pages)
        }
    } catch (err) {
        console.log(`error in fetch: ${currentURL}`)
    }

    return pages
}

export function getURLsFromHTML(htmlBody: string, baseURL: string): Array<string> {
    // return all clickable link in an array of strings
    const urls = new Array<string>;
    const dom = new JSDOM(htmlBody);
    dom.window.document.querySelectorAll('a').forEach((e) => {
        if (e.href.slice(0, 1) === '/') {
            // relative
            try {
                const urlobj = new URL(`${baseURL}${e.href}`);
                urls.push(urlobj.href);
            }
            catch (error) {
                console.log(`error with relative url ${error}`)
            }
        }
        else {
            // absolute
            try {
                const urlobj = new URL(e.href);
                urls.push(urlobj.href);
            }
            catch (error) {
                console.log(`error with absolute url ${error} - ${e.href}`)
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

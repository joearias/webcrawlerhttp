
import { JSDOM } from 'jsdom'

export async function crawlPage(baseURL: string, currentURL: string, pages: { [x: string]: number }) {
    let baseURLObj, currentURLObj;
    try {
        baseURLObj = new URL(baseURL);
        currentURLObj = new URL(currentURL);
    } catch (err) {
        console.log(`Invalid URL: ${currentURL}`);
        return pages;
    }
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
    const urls: string[] = [];
    const dom = new JSDOM(htmlBody);
    const linkElements = dom.window.document.querySelectorAll('a');
    for (const linkElement of linkElements) {
        if (!linkElement.href) {
            continue;
        }
        try {
            // The URL constructor will resolve relative URLs against the base URL
            const urlObj = new URL(linkElement.href, baseURL);
            urls.push(urlObj.href);
        } catch (err) {
            console.log(`Could not get absolute URL from ${linkElement.href}: ${(err as Error).message}`);
        }
    }
    return urls;
}

export function normalizeURL(url: string): string {
    // removes protocol and normalized the host and path
    const urlobj = new URL(url);
    let urlPath = `${urlobj.hostname}${urlobj.pathname}`.toLowerCase();
    if (urlPath.endsWith('/')) {
        return urlPath.slice(0, -1);
    }
    return urlPath;
}

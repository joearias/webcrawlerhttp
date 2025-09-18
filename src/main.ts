import { crawlPage } from "./crawl";
import  * as argsParser from 'args-parser';

// Parse command-line arguments
export async function main() {
    const args = argsParser(process.argv);

    if (Object.keys(args).length === 0) {
        console.log('No website provided');
        process.exit(1);
    }
    if (Object.keys(args).length > 1 || !args.url) {
        console.log('Too many command line args');
        process.exit(1);
    }

    const baseURL = args.url as string;
    console.log(`Starting Crawl ${baseURL}`);
    const pages = await crawlPage(baseURL, baseURL, {});

    for (const page of Object.entries(pages)) {
        console.log(page)
    }
}
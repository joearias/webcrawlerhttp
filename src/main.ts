import { crawlPage } from "./crawl";
import arg from 'arg'; // Import the 'arg' module

// Parse command-line arguments
export async function main() {
    const args = arg(
        {
            '--url': String,
            '-u': '--url',
        },
        {
            permissive: false,
            argv: process.argv.slice(2),
        }
    )

    if (!args['--url']) {
        console.log('No website provided');
        process.exit(1);
    }

    console.log(args);

    const baseURL = args['--url'] as string;
    console.log(`Starting Crawl ${baseURL}`);
    const pages = await crawlPage(baseURL, baseURL, {});

    console.log('==========');
    console.log('CRAWL REPORT');
    console.log('==========');
    const sortedPages = Object.entries(pages).sort((a, b) => b[1] - a[1]);

    const report = sortedPages.map(([url, count]) => ({ url, count }));

    console.table(report);
}
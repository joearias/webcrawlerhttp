import { crawlPage } from "./crawl";
import arg from 'arg'; // Import the 'arg' module
import * as readline from 'node:readline/promises';
import { writeFile } from 'node:fs/promises';

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

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await rl.question('Export report to CSV? (y/n) ');

    if (answer.toLowerCase() === 'y') {
        const csvHeader = 'url,count\n';
        const csvBody = report.map(({ url, count }) => `"${url}",${count}`).join('\n');
        const csvContent = csvHeader + csvBody;
        await writeFile('report.csv', csvContent);
        console.log('Report exported to report.csv');
    }

    rl.close();
}
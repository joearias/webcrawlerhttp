import * as crawl from './crawl';
import { main } from './main';

describe('main', () => {
    let consoleSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;
    let crawlPageSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => { }) as any);
        crawlPageSpy = jest.spyOn(crawl, 'crawlPage').mockResolvedValue({});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        processExitSpy.mockRestore();
        crawlPageSpy.mockRestore();
    });

    test('should exit with code 1 if no website is provided', async () => {
        process.argv = ['node', 'main.ts']; // args-parser will produce {}
        await main();
        expect(consoleSpy).toHaveBeenCalledWith('No website provided');
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should throw an error for unknown command line args', async () => {
        process.argv = ['node', 'main.ts', '--url=url1', '--extra=url2'];
        // We expect the main function to reject because 'arg' will throw an error
        await expect(main()).rejects.toThrow('unknown or unexpected option: --extra');
        expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should start crawl with the provided URL', async () => {
        const testURL = 'https://example.com';
        process.argv = ['node', 'main.ts', `--url=${testURL}`];
        await main();
        expect(consoleSpy).toHaveBeenCalledWith(`Starting Crawl ${testURL}`);
        expect(crawlPageSpy).toHaveBeenCalledWith(testURL, testURL, {});
    });

    test('should log crawled pages', async () => {
        const testURL = 'https://example.com';
        const crawledPages = {
            'example.com/path1': 1,
            'example.com/path2': 2,
        };
        crawlPageSpy.mockResolvedValue(crawledPages);
        process.argv = ['node', 'main.ts', `--url=${testURL}`];
        await main();
        for (const page of Object.entries(crawledPages)) {
            expect(consoleSpy).toHaveBeenCalledWith(page)
        }
    });
});
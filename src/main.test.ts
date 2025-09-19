import * as crawl from './crawl';
import { main } from './main';

describe('main', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleTableSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;
    let crawlPageSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleTableSpy = jest.spyOn(console, 'table').mockImplementation(() => { });
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => { }) as any);
        crawlPageSpy = jest.spyOn(crawl, 'crawlPage').mockResolvedValue({});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleTableSpy.mockRestore();
        processExitSpy.mockRestore();
        crawlPageSpy.mockRestore();
    });

    test('should exit with code 1 if no website is provided', async () => {
        process.argv = ['node', 'main.ts']; // args-parser will produce {}
        await main();
        expect(consoleLogSpy).toHaveBeenCalledWith('No website provided');
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
        expect(consoleLogSpy).toHaveBeenCalledWith(`Starting Crawl ${testURL}`);
        expect(crawlPageSpy).toHaveBeenCalledWith(testURL, testURL, {});
    });

    test('should log crawled pages', async () => {
        const testURL = 'https://example.com';
        const crawledPages = {
            'example.com/path2': 2,
            'example.com/path1': 1,
        };
        crawlPageSpy.mockResolvedValue(crawledPages);
        process.argv = ['node', 'main.ts', `--url=${testURL}`];
        await main();

        const expectedReport = [
            { url: 'example.com/path2', count: 2 },
            { url: 'example.com/path1', count: 1 },
        ];
        expect(consoleTableSpy).toHaveBeenCalledWith(expectedReport);
    });
});
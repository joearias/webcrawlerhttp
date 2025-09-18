import { crawlPage, checkUrlBasicFormat, getURLsFromHTML, normalizeURL } from "./crawl";
import { jest } from '@jest/globals';

describe('crawlPage', () => {

    let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
    let fetchMock: jest.SpiedFunction<typeof global.fetch>;

    beforeEach(() => {
        fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: () => Promise.resolve(''),
            } as unknown as Response)
        );

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        fetchMock.mockRestore();
    });

    test('should not crawl off-site URLs', async () => {
        const baseURL = 'https://internal.com';
        const offsiteURL = 'https://external.com';
        const pages = await crawlPage(baseURL, offsiteURL, {});
        expect(pages).toEqual({});
        expect(fetch).not.toHaveBeenCalled();
    });

    test('should increment count for already visited pages', async () => {
        const baseURL = 'https://example.com';
        const initialPages = { 'example.com': 1 };
        const pages = await crawlPage(baseURL, `${baseURL}/`, initialPages); // Use trailing slash to test normalization
        expect(pages['example.com']).toBe(2);
        expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle fetch errors gracefully', async () => {
        fetchMock.mockRejectedValue(new Error('Network error'));
        const baseURL = 'https://example.com';
        const pages = await crawlPage(baseURL, baseURL, {});
        // The page is added before the fetch attempt, so it should exist in the map.
        expect(pages).toEqual({ 'example.com': 1 });
    });

    test('should handle non-2xx HTTP status codes', async () => {
        fetchMock.mockImplementation(() => Promise.resolve({
            status: 404,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: () => Promise.resolve(''),
        } as unknown as Response));
        const baseURL = 'https://example.com';
        const pages = await crawlPage(baseURL, baseURL, {});
        expect(pages).toEqual({ 'example.com': 1 });
    });

    test('should not attempt to parse non-HTML content', async () => {
        fetchMock.mockImplementation(() => Promise.resolve({
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            text: () => Promise.resolve('{}'),
        } as unknown as Response));
        const baseURL = 'https://example.com';
        const pages = await crawlPage(baseURL, baseURL, {});
        expect(pages).toEqual({ 'example.com': 1 });
    });
});

describe('Utils', () => {

    describe('getURLsFromHTML', () => {

        test('ignores invalid urls', () => {
            const inputBaseURL = 'https://google.com'
            const inputHtmlBody = `
                <html>
                <body>
                <a href="invalid">
                invalid
                </>
                </<body>
                </html>
            `;

            const actual = getURLsFromHTML(inputHtmlBody, inputBaseURL)
            const expected: string[] = [];
            expect(actual).toEqual(expected)

        });
        test('supports absolute urls', () => {
            const inputBaseURL = 'https://google.com'
            const inputHtmlBody = `
                <html>
                <body>
                <a href="https://google.com/path">
                    google landing page
                </>
                </<body>
                </html>
            `;

            const actual = getURLsFromHTML(inputHtmlBody, inputBaseURL)
            const expected = ['https://google.com/path']
            expect(actual).toEqual(expected)

        });

        test('supports relative links', () => {
            const inputBaseURL = 'https://google.com'
            const inputHtmlBody = `
                <html>
                <body>
                <a href="/path">
                    google landing page
                </a>
                </<body>
                </html>
            `;

            const actual = getURLsFromHTML(inputHtmlBody, inputBaseURL)
            const expected = ['https://google.com/path']
            expect(actual).toEqual(expected)

        });

        test('multiple mixed urls', () => {
            const inputBaseURL = 'https://google.com'
            const inputHtmlBody = `
                <html>
                <body>
                <a href="/path1">
                    google landing page
                </a>
                <a href="https://google.com/path2">
                    google landing page
                </a>
                </<body>
                </html>
            `;

            const actual = getURLsFromHTML(inputHtmlBody, inputBaseURL)
            const expected = ['https://google.com/path1', 'https://google.com/path2']
            expect(actual).toEqual(expected)

        });
    });

    describe('normalizeURL', () => {
        describe('host', () => {
            const cases = [
                ['Strips protocol', `http://google.com`, 'google.com'],
                ['Strips secure protocol', `https://google.com`, 'google.com'],
                ['supports hosts with trailing slash', "http://google.com/", 'google.com'],
                ['is case insesitive', `http://GooglE.Com`, 'google.com'],

            ]

            test.each(cases)(
                "should return host - %p %p",
                (description, input, output) => {

                    const actual = normalizeURL(input);
                    expect(actual).toBe(output);

                });

        });

        describe('paths', () => {
            const cases = [
                ['supports path', `https://google.com/path`, 'google.com/path'],
                ['is case insensitive', `http://google.com/Path`, 'google.com/path'],
                ['supports hosts with trailing slash', "http://google.com/path/", 'google.com/path'],
            ]

            test.each(cases)(
                "should return host - %p %p",
                (description, input, output) => {

                    const actual = normalizeURL(input);
                    expect(actual).toBe(output);

                });

        });

    });

    describe('checkUrlBasicFormat', () => {
        test('should return true for valid http/https urls', () => {
            expect(checkUrlBasicFormat('http://example.com')).toBe(true);
            expect(checkUrlBasicFormat('https://example.com')).toBe(true);
        });

        test('should return false for invalid urls', () => {
            expect(checkUrlBasicFormat('ftp://example.com')).toBe(false);
            expect(checkUrlBasicFormat('example.com')).toBe(false);
        });
    });

});

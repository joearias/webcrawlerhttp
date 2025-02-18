import { getURLsFromHTML, normalizeURL } from "./crawl";


describe('crawler', () => {

    describe('getURLsFromHTML', () => {

        //test('', ()=>{});

        test('to return string array of links', () => {
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
    
        test('to return string array of relative links', () => {
            const inputBaseURL = 'https://google.com'
            const inputHtmlBody = `
                <html>
                <body>
                <a href="/path">
                    google landing page
                </>
                </<body>
                </html>
            `;

            const actual = getURLsFromHTML(inputHtmlBody, inputBaseURL)
            const expected = ['https://google.com/path']
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
                    console.log(actual);
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
                    console.log(actual);
                    expect(actual).toBe(output);

                });

        });

    })

});


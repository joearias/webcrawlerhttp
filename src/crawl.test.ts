import { normalizeURL } from "./crawl";


describe('crawler', ()=>{

    describe('host' , () =>{
        const cases =[
            ['supports https',`https://google.com`, 'google.com'],
            ['supports http',`http://google.com`, 'google.com'],
            ['supports hosts with trailing slash',"http://google.com/", 'google.com'],
            ['is case insesitive',`http://GooglE.Com`, 'google.com'],
    
        ]
    
        test.each(cases)(
            "should return host - %p %p" , 
            (description , input, output) => {
    
            const actual = normalizeURL(input);
            console.log(actual);
            expect(actual).toBe(output);
            
        });

    });

    describe('paths' , () =>{
        const cases =[
            ['supports path',`https://google.com/path`, 'google.com/path'],
            ['is case insensitive',`http://google.com/Path`, 'google.com/path'],
            ['supports hosts with trailing slash',"http://google.com/path/", 'google.com/path'],    
        ]
    
        test.each(cases)(
            "should return host - %p %p" , 
            (description , input, output) => {
    
            const actual = normalizeURL(input);
            console.log(actual);
            expect(actual).toBe(output);
            
        });

    });

})
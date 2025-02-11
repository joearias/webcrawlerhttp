import { stringify } from "querystring";
import { getBaseUrl } from "./url_utils";


describe('url_utils', ()=>{

    const cases =[
        ['supports https', String.raw`https:\\google.com`, 'google.com'],
        ['supports http', String.raw`http:\\google.com`, 'google.com'],
        ['supports https',"http:\\\\google.com\\", 'google.com']
    ]

    test.each(cases)(
        "should return host - %p %p" , 
        (description , input, output) => {

        const actual = getBaseUrl(input);
        console.log(actual);
        expect(actual).toBe(output);
        
    });
})

export function  getBaseUrl( url : string) :string {
    console.log(`url - ${url}`)
    return new URL(url).host;
}
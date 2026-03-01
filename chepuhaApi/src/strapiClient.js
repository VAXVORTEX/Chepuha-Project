
const { default: fetch } = await import('node-fetch');
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
async function strapiRequest(method, path, body) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${STRAPI_URL}${path}`, options);
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }
    return { status: response.status, data };
}
export default strapiRequest;

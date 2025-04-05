const cache = new Map();

export async function useFetch(
    endpoint,
    {
        method = "GET",
        body = null,
        headers = {},
        timeout = 10000,
        cacheTTL = 20000,
        retry = 3,
        retryDelay = 1000
    } = {}
) {
    return await Fetch(endpoint, { method, body, headers, timeout, cacheTTL, retry, retryDelay });
}

async function Fetch(endpoint, { method, body, headers, timeout, cacheTTL, retry, retryDelay } = {}) {
    const baseURL = "http://localhost:3000/api/v1"

    const token = localStorage.getItem("token");

    const defaultHeaders = {
        "Content-Type": "application/json",
        "Accept-Language": "tr",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
    };

    const config = {
        method,
        headers: defaultHeaders,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const url = `${baseURL}${endpoint}`;

    if (method === "GET" && cache.has(url)) {
        const { data, timestamp } = cache.get(url);
        if (Date.now() - timestamp < cacheTTL) {
            return data;
        } else {
            cache.delete(url);
        }
    }

    let attempt = 0;

    while (attempt < retry) {
        attempt++;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            if (response.status == 401) {
                window.location.href = "/login"
            }
            if (!response.ok) {
                throw await response.json();
            }

            const data = await response.json();

            if (method === "GET") {
                cache.set(url, { data, timestamp: Date.now() });
            }

            return data;
        } catch (error) {
            console.error(`Fetch attempt ${attempt} failed:`, error);

            if (attempt >= retry) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

}
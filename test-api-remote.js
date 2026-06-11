(async () => {
    try {
        console.log("Fetching Dev App URL...");
        const res = await fetch("https://ais-dev-t7v3av7fyghytgxnom46sc-547934653027.asia-southeast1.run.app/api/generate-topic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: "React", difficulty: "Medium" })
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text.slice(0, 300));
    } catch(e) {
        console.error(e);
    }
})();

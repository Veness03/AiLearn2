(async () => {
    try {
        const getRes = await fetch("https://ais-dev-t7v3av7fyghytgxnom46sc-547934653027.asia-southeast1.run.app/api/health");
        console.log("Health GET Status:", getRes.status);
        console.log("Health GET Body:", await getRes.text());

        const postRes = await fetch("https://ais-dev-t7v3av7fyghytgxnom46sc-547934653027.asia-southeast1.run.app/api/echo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test: "data" })
        });
        console.log("Echo POST Status:", postRes.status);
        console.log("Echo POST Body:", await postRes.text());
    } catch(e) { console.error(e); }
})();

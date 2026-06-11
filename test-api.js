(async () => {
    try {
        const res = await fetch("http://localhost:3000/api/generate-topic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: "React", difficulty: "Medium" })
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch(e) {
        console.error(e);
    }
})();

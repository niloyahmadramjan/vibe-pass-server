const https = require("https");

const checkEmail = (email) => {
  return new Promise((resolve) => {
    if (!email) return resolve(false);

    // ✅ Basic format check
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return resolve(false);

    // ✅ Always allow common free domains
    const trustedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "protonmail.com",
      "icloud.com",
      "live.com",
    ];

    const domain = email.split("@")[1].toLowerCase();
    if (trustedDomains.includes(domain)) {
      return resolve(true);
    }

    // ✅ Otherwise, check via RapidAPI
    const options = {
      method: "GET",
      hostname: "email-verifier2.p.rapidapi.com",
      path: `/v2?email=${encodeURIComponent(email)}`,
      headers: {
        "x-rapidapi-key": "d2a789c195msha31fd10c626bdc6p134d6djsn2be305bdc488",
        "x-rapidapi-host": "email-verifier2.p.rapidapi.com",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const isValid =
            json.status === "valid" ||
            json.smtp_check === true ||
            json.result === "valid";
          resolve(isValid);
        } catch {
          resolve(true); // fallback accept
        }
      });
    });

    req.on("error", () => resolve(true)); // fallback accept
    req.end();
  });
};

module.exports = checkEmail;

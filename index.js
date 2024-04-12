const axios = require('axios').default;
const key = process.env.API_KEY /** process.env.API_KEY */
const webhook = process.env.WEBHOOK_URL/** process.env.WEBHOOK_URL */
var getAddedorRemovedItem = function (sourceArray1, sourceArray2) {
    var added = [], removed = [];
    sourceArray1.forEach(function (item) {
        if (sourceArray2.indexOf(item) == -1) {
            removed.push(item);
        }
    });
    sourceArray2.forEach(function (item) {
        if (sourceArray1.indexOf(item) == -1) {
            added.push(item);
        }
    });

    return { added, removed }
}
let current = []

async function doFetch() {
    const res = await axios.get("https://gateway.apiportal.ns.nl/disruptions/v3?isActive=true", { headers: { "Ocp-Apim-Subscription-Key": key } })
    const diff = getAddedorRemovedItem(current, res.data)
    diff.added.forEach(async (item) => {
        await axios.post(webhook, {
            "content": "",
            "tts": false,
            "embeds": [
                {
                    "author": {
                        "icon_url": "https://www.inschuytgraaf.nl/wp-content/uploads/2022/04/NS-logo-2.jpg",
                        "name": "NS"
                    },
                    "title": `New ${item.type.toLocaleLowerCase()}`,
                    "description": `**Line:** ${item.title}\n**Period:** ${item.period ?? "Unknown"}\n**Impact:** ${item.impact ? item.impact.value : "Unknown"}\n**Stations:** ${item.publicationSections ? item.publicationSections[0].section.stations ? item.publicationSections[0].section.stations.map(station => station.name).join(", ") : "Unknown" : "Unknown"}`,
                    "color": item.type == "CALAMITY" ? 16721703 : 16739111,
                    "fields": [],
                }
            ]
        })
    })
    diff.removed.forEach(async (item) => {
        await axios.post(webhook, {
            "content": "",
            "tts": false,

            "embeds": [
                {
                    "author": {
                        "icon_url": "https://www.inschuytgraaf.nl/wp-content/uploads/2022/04/NS-logo-2.jpg",
                        "name": "NS"
                    },
                    "title": "Disruption solved",
                    "description": `**Line:** ${item.title}\n**Period:** ${item.period ?? "Unknown"}\n**Impact:** ${item.impact ? item.impact.value : "Unknown"}`,
                    "color": 4521767,
                    "fields": [],
                }
            ]
        })
    })
    current = [...res.data]
}

setInterval(doFetch, 900000)
doFetch()
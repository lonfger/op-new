import { promises as fs } from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

async function run() {
  const data = (await fs.readFile('./token.txt', 'utf8')).split('\n').filter(Boolean);
  const proxies = (await fs.readFile('./proxy.txt', 'utf8')).split('\n').filter(Boolean);

  for (const index in data) {
    const token = data[index];
    const proxy = proxies[index];

    if (!token || !proxy) {
      console.error(`Missing token or proxy for index ${index}`);
      continue;
    }

    console.log(`Processing token at index ${index}...`);

    const agent = new HttpsProxyAgent('http://' + proxy);
    const getMissionsParam = {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      agent,
    };

    try {
      // 获取任务
      const response = await fetch('https://api.openloop.so/missions', getMissionsParam);

      if (!response.ok) {
        console.error(`Error fetching missions for token ${token}: ${response.statusText}`);
        continue;
      }

      const { data: { missions } } = await response.json();
      console.log(`Missions retrieved for token ${token}:`, missions);

      // 遍历任务并逐一完成
      for (const item of missions) {
        if (item.status === 'available') {
          console.log(`Completing mission: ${item.missionId}`);

          const completeMissionParam = {
            ...getMissionsParam, // 复制参数，避免冲突
            method: "GET", // 更改方法为 POST
          };

          try {
            const res = await fetch(`https://api.openloop.so/missions/${item.missionId}/complete`, completeMissionParam);

            if (res.ok) {
              const result = await res.json();
              console.log(`Mission ${item.missionId} completed:`, result);
            } else {
              console.error(`Failed to complete mission ${item.missionId}: ${res.statusText}`);
            }
          } catch (err) {
            console.error(`Error completing mission ${item.missionId}:`, err.message);
          }
        }
      }

      console.log(`Finished processing all missions for token ${token}.`);
    } catch (err) {
      console.error(`Error processing token ${token}:`, err.message);
    }
  }
}

run()
  .then(() => {
    console.log("All requests completed")
    process.exit(0)
  })
  .catch((error) => console.error("Error in run:", error));

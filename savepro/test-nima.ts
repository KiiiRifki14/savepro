import axios from 'axios';
import mrNimaIgdl from "@mrnima/instagram-downloader";
async function run() {
  try {
    const res = await mrNimaIgdl("https://www.instagram.com/p/DE-R0k1vLbn/");
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();

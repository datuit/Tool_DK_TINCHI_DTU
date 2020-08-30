const puppeteer = require("puppeteer");
const player = require("play-sound")((opts = {}));
const DataBase = [
  "http://courses.duytan.edu.vn/Sites/Home_ChuongTrinhDaoTao.aspx?p=home_listclassdetail&timespan=70&semesterid=70&classid=121007&academicleveltypeid=&curriculumid=",
];

const DataBaseLength = DataBase.length;

const fetchData = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  console.log("Waiting...");
  while (true) {
    for (let i = 0; i < DataBaseLength; i++) {
      await page.goto(DataBase[i]);
      await page.waitFor(
        ".tb-ctdt tbody .hasborder:nth-child(3) tbody tr:nth-child(3) td:nth-child(2) span"
      );
      var empty = await page.evaluate(() => {
        return document
          .querySelector(
            ".tb-ctdt tbody .hasborder:nth-child(3) tbody tr:nth-child(3) td:nth-child(2) span"
          )
          .textContent.trim();
      });
      if (empty != "0") {
        var madk = await page.evaluate(() => {
          return document
            .querySelector(".tb-ctdt tbody tr td:nth-child(2)")
            .textContent.trim();
        });
        console.log("Done: ", madk);
        await player.play("ring.mp3");
        await page.waitFor(100000);
      }
    }
  }
};
fetchData();

const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = 5000;
const ItemModel = require("./model/item");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/dtu", {
  useCreateIndex: true,
  useUnifiedTopology: true
});

const DataBase = [
  {
    name: "PHI",
    value: ["162"]
  },
  {
    name: "HIS",
    value: ["361"]
  },
  {
    name: "MED",
    value: ["268"]
  },
  {
    name: "LAW",
    value: ["201"]
  },
  {
    name: "POS",
    value: ["361"]
  },
  {
    name: "ENG",
    value: ["166", "167", "168", "169"]
  },
  {
    name: "CS",
    value: [
      "316",
      "311",
      "226",
      "252",
      "414",
      "434",
      "403",
      "420",
      "445",
      "462",
      "463"
    ]
  },
  {
    name: "ES",
    value: ["223", "226", "221", "271", "273", "276", "303"]
  },
  {
    name: "IS",
    value: ["301", "384"]
  },
  {
    name: "CR",
    value: ["424"]
  },
  {
    name: "SE",
    value: ["445"]
  },
  {
    name: "MTH",
    value: ["254"]
  }
];

const DataBaseLength = DataBase.length;

const url =
  "http://courses.duytan.edu.vn/Sites/Home_ChuongTrinhDaoTao.aspx?p=home_coursesearch";

const fetchData = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();
  for (let i = 0; i < DataBaseLength; i++) {
    let length = DataBase[i].value.length;
    for (let j = 0; j < length; j++) {
      await page.goto(url);
      await page.waitFor("#cboNamHoc1 option:nth-child(2)");
      await page.waitFor(2000);
      await page.evaluate(() => {
        document.querySelector(
          "#cboNamHoc1 > option:last-child"
        ).selected = true;
        element = document.querySelector("#cboNamHoc1");
        var event = new Event("change", { bubbles: true });
        event.simulated = true;
        element.dispatchEvent(event);
      });
      await page.waitFor(2000);
      await page.evaluate(() => {
        document.getElementById("cboHocKy1").value = 67;
      });
      await page.select("#cboCourse", DataBase[i].name);
      await page.type(".txtkeyword", DataBase[i].value[j]);
      await page.click(".btnsearch");
      await page.waitFor(".nhom-lop");
      await page.click("a.hit");
      await page.waitFor(".tb_coursedetail tbody tr td .title-1");
      const listLength = await page.evaluate(() => {
        var list = [];
        let listLength = document.querySelectorAll(
          ".tb-calendar > tbody > tr.lop"
        ).length;
        for (let o = 2; o < listLength * 2; o += 2) {
          try {
            const location = document
              .querySelector(
                `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td:nth-child(9)`
              )
              .textContent.trim();
            if (location.includes("Nam")) {
              continue;
            }
            const empty = document
              .querySelector(
                `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td:nth-child(4)`
              )
              .textContent.trim();
            if (empty.length > 3) {
              continue;
            }
            const title = document
              .querySelector(
                `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td.hit`
              )
              .textContent.trim();
            const madk = document
              .querySelector(
                `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td:nth-child(2) a`
              )
              .textContent.trim();
            const week = document
              .querySelector(
                `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td:nth-child(6)`
              )
              .textContent.trim();
            const time = ignoreSpaces(
              document
                .querySelector(
                  `.tb-calendar > tbody > tr.lop:nth-child(${o}) > td:nth-child(7)`
                )
                .textContent.trim()
                .split("Tuần")[0]
                .trim()
            );
            list.push({
              title: title,
              madk: madk,
              week: week,
              time: time,
              location: location,
              empty: empty
            });
          } catch (error) {
            if (error) {
              continue;
            }
          }
        }
        function ignoreSpaces(string) {
          var temp = "";
          string = "" + string;
          splitstring = string.split(" ");
          for (i = 0; i < splitstring.length; i++) temp += splitstring[i];
          return temp;
        }
        return list;
      });
      await ItemModel.insertMany(listLength);
      await page.waitFor(2000);
    }
  }
};

fetchData();

app.get("/", async (req, res) => {
  const data = await ItemModel.find();
  res.json(data);
});

app.listen(PORT);

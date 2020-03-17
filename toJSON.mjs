import * as fs from "fs";
import * as path from "path";
import dateFns from "date-fns";
import fetch from "node-fetch";
import jsdom from "jsdom";

const markdown = fs.readFileSync(
  path.join(process.cwd(), "README.md"),
  "utf-8"
);

const tableMarkdown = markdown.substr(
  markdown.indexOf("|"),
  markdown.lastIndexOf("|") - markdown.indexOf("|") + 1
);

const padZero = s => `0${s}`.substr(-2);

const socialImageFromUrl = async url => {
  try {
    const html = await fetch(url);
    const dom = new jsdom.JSDOM(await html.text());
    return (
      dom.window.document
        .querySelector('meta[property="og:image"]')
        .getAttribute("content") ||
      dom.window.document
        .querySelector('meta[property="twitter:image"]')
        .getAttribute("content")
    );
  } catch {
    return undefined;
  }
};

const toJSON = async () => {
  const { homeferences } = tableMarkdown
    .split("\n")
    .map(s => s.trim())
    .map(s =>
      s
        .substr(1, s.length - 2)
        .split("|")
        .map(s => s.trim())
    )
    .reduce(
      ({ homeferences, baseYear, baseMonth }, line) => {
        const [date, nameAndURL, price, topic] = line;
        const dateTime = /<time datetime="(?:(2[0-9]{3})-([0-9]{2})-01T00:00:00Z)">/.exec(
          date
        );
        const dayRange = /^[0-9]{1,2}(?:–([0-9]{1,2}))?$/.exec(date.trim());
        if (dateTime) {
          baseYear = parseInt(dateTime[1]);
          baseMonth = parseInt(dateTime[2]);
        }
        if (baseYear && baseMonth && dayRange) {
          const startDay = parseInt(dayRange[0], 10);
          const endDay = dayRange[1] && parseInt(dayRange[1], 10);
          const startDate = new Date(
            `${baseYear}-${padZero(baseMonth)}-${padZero(startDay)}T00:00:00Z`
          );
          const endDate = dateFns.subSeconds(
            dateFns.addDays(
              endDay
                ? new Date(
                    `${baseYear}-${padZero(
                      baseMonth + (endDay && endDay < startDay ? 1 : 0)
                    )}-${padZero(endDay)}T00:00:00Z` // FIXME: Rollover to January
                  )
                : startDate,
              1
            ),
            1
          );
          const [_, name, url] = /\[([^\]]+)\]\(([^)]+)\)/.exec(nameAndURL);
          return {
            homeferences: [
              ...homeferences,
              {
                name,
                url,
                topic,
                price: price.length ? price.replace(/\\/g, "") : undefined,
                startDay: startDate.toISOString().substr(0, 10),
                endDay: endDate.toISOString().substr(0, 10)
              }
            ],
            baseYear,
            baseMonth
          };
        }
        return {
          homeferences,
          baseYear,
          baseMonth
        };
      },
      {
        baseDate: null,
        homeferences: []
      }
    );

  return Promise.all(
    homeferences.map(async homeference => {
      return {
        ...homeference,
        image: await socialImageFromUrl(homeference.url)
      };
    })
  );
};

toJSON().then(homeferences =>
  console.log(JSON.stringify(homeferences, null, 2))
);

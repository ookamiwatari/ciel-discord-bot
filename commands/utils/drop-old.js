const Discord = require("discord.js");
const cmd = require("discord.js-commando");
const Pagination = require("discord-paginationembed");
const path = require("path");
const itemList = require("../../json/jp/item.json");
const dropList = require("../../json/jp/drop_old.json");
const servDropList = require("../../json/jp/serv_drop.json");
const monsterList = require("../../json/jp/monster.json");

module.exports = class Drop extends cmd.Command {
  constructor(client) {
    super(client, {
      name: "drop-old",
      group: "utils",
      memberName: "drop-old",
      description: "ドロップ検索",
      examples: ["/drop-old リザードキング"],
      args: [
        {
          key: "name",
          prompt: "モンスター名を入力してください。",
          type: "string",
        },
        {
          key: "scale",
          prompt: "倍率を入力してください。",
          type: "float",
          default: 1,
        },
      ],
    });
  }

  run(message, { name, scale }) {
    const monsters = monsterList.root.npc.filter(
      (monster) => monster["名稱"] && monster["名稱"].indexOf(name) !== -1
    );
    const drops = dropList.root.drop.filter(
      (drop) => drop["怪物名稱"] && drop["怪物名稱"].indexOf(name) !== -1
    );

    const objs = monsters
      .concat(drops)
      .map((obj) => {
        return {
          id: obj["編號"],
          name: obj["名稱"]
            ? obj["名稱"]
            : obj["怪物名稱"]
            ? obj["怪物名稱"]
            : "",
        };
      })
      .filter((x, i, self) => self.findIndex((y) => y.id === x.id) === i)
      .sort((a, b) => +a.id - +b.id);

    if (!objs.length) {
      return message.channel.send("ドロップが見つかりませんでした。");
    }

    const embeds = objs.slice(0, 100).map((obj) => {
      const drop = dropList.root.drop.find(
        (drop) => drop["編號"] && drop["編號"] === obj.id
      );
      const drop_prob = getDropProb(drop, scale);
      if (drop_prob) {
        return new Discord.MessageEmbed()
          .setTitle(obj.name)
          .setURL(
            "https://ookamiwatari.github.io/le-ciel-bleu-db/#/" +
              (+obj.id < 4214 ? "monster/" : "drop/") +
              obj.id
          )
          .addField("袋ドロップ率", drop_prob + "%")
          .addField("抽選回数", drop ? drop["個數"] + "回" : "-")
          .setDescription(getDropDescription(drop, scale));
      } else {
        return new Discord.MessageEmbed()
          .setTitle(obj.name)
          .setURL(
            "https://ookamiwatari.github.io/le-ciel-bleu-db/#/" +
              (+obj.id < 4214 ? "monster/" : "drop/") +
              obj.id
          )
          .addField("抽選回数", drop ? drop["個數"] + "回" : "-")
          .setDescription(getDropDescription(drop, scale));
      }
    });

    if (embeds.length < 2) {
      message.channel.send("", embeds[0]);
    } else {
      new Pagination.Embeds()
        .setArray(embeds)
        .setChannel(message.channel)
        .setPageIndicator(true)
        .setDisabledNavigationEmojis(["jump", "delete"])
        .setTimeout(24 * 60 * 60 * 1000)
        .build();
    }
  }
};

function getDropDescription(drop, scale) {
  if (!drop) return "無し";

  let description = getServDropDescription(drop, scale);
  if (description !== "") return description;

  const serv_drop = servDropList.root.drop.find(
    (_drop) => _drop["編號"] && _drop["編號"] === drop["編號"]
  );

  for (let i = 1; i < 21; i++) {
    if (!drop["item" + i]) continue;
    let item = itemList.root["道具"].find(
      (item) => item["編號"] && item["編號"] === drop["item" + i]
    );
    const count = drop["count" + i];
    if (item) {
      description += item["基本名稱"] + (count !== "1" ? "x" + count : "");
    } else {
      description +=
        getUndefinedItemName(+drop["item" + i]) +
        (count !== "1" ? "x" + count : "");
    }

    for (let j = 1; j < 21; j++) {
      if (!serv_drop || drop["item" + i] !== serv_drop["item" + j]) continue;
      const factor = +serv_drop["factor"];
      const prob =
        Math.round((+serv_drop["prob" + j] * 10000 * scale) / factor) / 100;
      const raw_prob = (+serv_drop["prob" + j] * scale) / factor;
      description += " " + prob + "% (1/" + Math.ceil(1 / raw_prob) + ")";
    }

    description += "\n";
  }

  return description;
}

function getServDropDescription(drop, scale) {
  const serv_drop = servDropList.root.drop.find(
    (_drop) => _drop["編號"] && _drop["編號"] === drop["編號"]
  );
  if (!serv_drop) return "";
  if (!serv_drop["prob1"]) return "";

  let description = "";

  let sum_prob = 0;
  const factor = +serv_drop["factor"];

  for (let i = 1; i < 21; i++) {
    if (drop["item" + i] !== serv_drop["item" + i]) return "";
    if (drop["count" + i] !== serv_drop["count" + i]) return "";
    if (!serv_drop["prob" + i]) continue;
    sum_prob += +serv_drop["prob" + i];
  }

  const fixed_scale = factor / sum_prob < scale ? factor / sum_prob : scale;

  for (let i = 1; i < 21; i++) {
    if (!drop["item" + i]) continue;
    let item = itemList.root["道具"].find(
      (item) => item["編號"] && item["編號"] === drop["item" + i]
    );
    const count = drop["count" + i];
    const prob =
      Math.round((+serv_drop["prob" + i] * 10000 * fixed_scale) / factor) / 100;
    const raw_prob = (+serv_drop["prob" + i] * fixed_scale) / factor;
    if (item) {
      description +=
        item["基本名稱"] +
        (count !== "1" ? "x" + count : "") +
        " " +
        prob +
        "% (1/" +
        Math.ceil(1 / raw_prob) +
        ")\n";
    } else {
      description +=
        getUndefinedItemName(+drop["item" + i]) +
        (count !== "1" ? "x" + count : "") +
        " " +
        prob +
        "% (1/" +
        Math.ceil(1 / raw_prob) +
        ")\n";
    }
  }

  return description;
}

function getDropProb(drop, scale) {
  if (!drop) return;

  const serv_drop = servDropList.root.drop.find(
    (_drop) => _drop["編號"] && _drop["編號"] === drop["編號"]
  );
  if (!serv_drop) return;
  if (!serv_drop["prob1"]) return;

  let sum_prob = 0;
  const factor = +serv_drop["factor"];

  for (let i = 1; i < 21; i++) {
    if (drop["item" + i] !== serv_drop["item" + i]) return;
    if (drop["count" + i] !== serv_drop["count" + i]) return;
    if (!serv_drop["prob" + i]) continue;
    sum_prob += +serv_drop["prob" + i];
  }

  const prob = (sum_prob * 100 * scale) / factor;
  return prob > 100 ? 100 : prob;
}

function getUndefinedItemName(id) {
  if (id === 2224) return "焼きカボチャの種(未実装)";
  if (id === 2225) return "りんご飴(未実装)";
  if (7000 < id && id < 7209) return "ペットスキルカード" + id + "(未実装)";
  if (10701 < id && id < 10750) return "レヴェイエ" + id + "(未実装)";
  if (31251 < id && id < 31287) return "本国用アイテム" + id + "(未実装)";
  if (id === 10857) return "アシストメダル(未実装)";
  if (id === 20061) return "翡翠魂魄(未実装)";
  if (id === 20062) return "淡紅魂魄(未実装)";
  if (id === 20063) return "青藍魂魄(未実装)";
  if (id === 20064) return "黄色魂魄(未実装)";
  if (id === 20065) return "紫烏魂魄(未実装)";
}

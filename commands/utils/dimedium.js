const Discord = require("discord.js");
const cmd = require("discord.js-commando");
const Pagination = require("discord-paginationembed");
const path = require("path");
const stageList = require("../../json/jp/stage.json");
const questList = require("../../json/jp/quest.json");
const questStepinfoList = require("../../json/jp/quest_stepinfo.json");
const questSteplistList = require("../../json/jp/quest_steplist.json");

module.exports = class Dimedium extends cmd.Command {
  constructor(client) {
    super(client, {
      name: "dimedium",
      aliases: [
        "dime",
        "dimesium",
        "dimegium",
        "dimejium",
        "map",
        "stage",
        "jump",
        "goto",
      ],
      group: "utils",
      memberName: "dimedium",
      description: "ディメジウム検索",
      examples: ["/dimedium ドラグーンフォール C"],
      args: [
        {
          key: "name",
          prompt: "マップ名を入力してください。",
          type: "string",
        },
        {
          key: "suffix",
          prompt: "マップ名のアルファベットを入力してください。",
          type: "string",
          default: "",
        },
      ],
    });
  }

  run(message, { name, suffix }) {
    const stages = stageList.root["場景"].filter((stage) => {
      if (stage["不可標記"] || !stage["名稱"]) return false;
      const stage_name = stage["名稱"]
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
          String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        )
        .toUpperCase();
      if (stage_name.indexOf(name) === -1) return false;
      const _suffix = suffix
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
          String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        )
        .toUpperCase();
      if (stage_name.indexOf(_suffix) === -1) return false;
      return true;
    });

    if (!stages.length) {
      return message.channel.send("マップが見つかりませんでした。");
    }

    const embeds = stages.slice(0, 100).map((stage) => {
      return new Discord.MessageEmbed()
        .setTitle(stage["名稱"])
        .setDescription(getStageDescription(stage));
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

function getStageDescription(stage) {
  const infolists = questStepinfoList.root.info.filter(
    (info) => info["地圖編號"] === stage["編號"]
  );
  const steplists = questSteplistList.root["列表"].filter((list) => {
    return infolists.find((info) => {
      for (let i = 1; i < 12; i++) {
        if (info["編號"] === list["item" + i]) {
          return true;
        }
      }
      return false;
    });
  });
  const quests = questList.root["任務"].filter((quest) => {
    if (quest["任務分類"] === "活動") return false;
    return steplists.find((list) => {
      for (let i = 1; i < 8; i++) {
        if (list["編號"] && list["編號"] === quest["導引0" + i]) return true;
        return false;
      }
    });
  });
  if (!quests.length) return "無し";
  return quests
    .slice(0, 30)
    .map((quest) => {
      let str = "";
      str += quest["任務分類"] ? quest["任務分類"] : "一般";
      str += "(Lv" + (quest["等級限制"] ? quest["等級限制"] : "-") + ") ";
      str += quest["任務名稱"];
      str +=
        quest["承接00"] && quest["地點00"]
          ? ": " + quest["承接00"] + "(" + quest["地點00"] + ")"
          : "";
      return str;
    })
    .join("\n");
}

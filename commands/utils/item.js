const Discord = require('discord.js');
const cmd = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const path = require('path');
const itemList = require('../../json/item.json');
const dropList = require('../../json/drop.json');
const monsterList = require('../../json/monster.json');

module.exports = class Vote extends cmd.Command {
	constructor(client) {
		super(client, {
			name: 'item',
			group: 'utils',
			memberName: 'item',
			description: "アイテム検索",
			examples: ['/item 極致結晶'],
			args: [
				{
					key: 'name',
					prompt: 'アイテム名を入力してください。',
					type: 'string'
				},
			]
		});
	}

	run(message, {name}) {

		const items = itemList.root['道具'].filter((item) => item['_基本名稱'] && item['_基本名稱'].indexOf(name) !== -1);

		if (!items.length) {
			return message.channel.send('アイテムが見つかりませんでした。');
		}

		const embeds = items.slice(0, 100).map((item) => {
			return new Discord.MessageEmbed()
				.setTitle(item['_基本名稱'])
				.setURL('https://ookamiwatari.github.io/le-ciel-bleu-db/#/item/' + item['_編號'])
				.setDescription(getItemDescription(item))
				.addField('ドロップ', getDropList(item));
		});

		if (embeds.length < 2) {
			message.channel.send('', embeds[0]);
		} else {
			new Pagination.Embeds()
				.setArray(embeds)
				.setChannel(message.channel)
				.setPageIndicator(true)
				.setDisabledNavigationEmojis(['jump', 'delete'])
				.setTimeout(24 * 60 * 60 * 1000)
				.build();
		}

	}
};

function getItemDescription (item) {
	if (item['_物品類別'] === '寶石') {
		return getCrystalItemDescription(item);
	} else if (item['_無組合變化']) {
		return getEquipmentItemDescription(item);
	} else {
		return item['_說明定義'] ? item['_說明定義'] : '';
	}
}

function getCrystalItemDescription (item) {
	let description = '';
	if (item['_動態資料1'] === '0') {
		description += '部位: 頭\n';
	} else if (item['_動態資料1'] === '1'){
		description += '部位: 顔\n';
	} else if (item['_動態資料1'] === '2'){
		description += '部位: 武器\n';
	} else if (item['_動態資料1'] === '3'){
		description += '部位: 腕\n';
	} else if (item['_動態資料1'] === '4'){
		description += '部位: 胴\n';
	} else if (item['_動態資料1'] === '5'){
		description += '部位: 背\n';
	} else if (item['_動態資料1'] === '6'){
		description += '部位: 足\n';
	} else if (item['_動態資料1'] === '7'){
		description += '部位: アクセ\n';
	}
	if (item['_動態資料2']) {
		description += `安定度: ${+item['_動態資料2'] / 10}\n`;
	}
	description += `説明: ${item['_說明定義']}`;
	return description
}

function getEquipmentItemDescription (item) {

	let description = '';
	if (item['_物品類別']) description += '部位: ' + item['_物品類別'] + '\n';
	if (item['_等級限制']) description += '必要レベル: ' + item['_等級限制'] + '\n';
	if (+item['_物品等級'] < 10) description += 'ランク: ' + '_IPSGD_R_U'[+item['_物品等級']] + '\n';
	description += 'スロット: ' + (item['_打孔上限'] ? item['_打孔上限'] : 0)  + '\n';
	if (item['_HP']) description += 'HP: ' + item['_HP'] + (item['_HP定義'] === '最大值百分比' ? '%' : '') + '\n';
	if (item['_MP']) description += 'SP: ' + item['_MP'] + (item['_MP定義'] === '最大值百分比' ? '%' : '') + '\n';
	if (item['_力量']) description += 'STR: ' + item['_力量'] + '\n';
	if (item['_體質']) description += 'VIT: ' + item['_體質'] + '\n';
	if (item['_智力']) description += 'INT: ' + item['_智力'] + '\n';
	if (item['_信仰']) description += 'FAI: ' + item['_信仰'] + '\n';
	if (item['_速度']) description += 'AGI: ' + item['_速度'] + '\n';
	if (item['_靈巧']) description += 'DEX: ' + item['_靈巧'] + '\n';
	if (item['_平均攻擊']) description += 'ATK: ' + item['_平均攻擊'] + '\n';
	if (item['_攻擊變數']) description += '攻撃変数: ' + item['_攻擊變數'] + '\n';
	if (item['_魔攻']) description += 'MATK: ' + item['_魔攻'] + '\n';
	if (item['_魔防']) description += 'MDEF: ' + item['_魔防'] + '\n';
	if (item['_閃躲']) description += 'AVOID: ' + item['_閃躲'] + '\n';
	if (item['_命中']) description += 'HIT: ' + item['_命中'] + '\n';
	if (item['_無屬攻擊']) description += '無属性攻撃: ' + item['_無屬攻擊'] + '\n';
	if (item['_火屬攻擊']) description += '火属性攻撃: ' + item['_火屬攻擊'] + '\n';
	if (item['_水屬攻擊']) description += '水属性攻撃: ' + item['_水屬攻擊'] + '\n';
	if (item['_風屬攻擊']) description += '風属性攻撃: ' + item['_風屬攻擊'] + '\n';
	if (item['_地屬攻擊']) description += '土属性攻撃: ' + item['_地屬攻擊'] + '\n';
	if (item['_光屬攻擊']) description += '光属性攻撃: ' + item['_光屬攻擊'] + '\n';
	if (item['_闇屬攻擊']) description += '闇属性攻撃: ' + item['_闇屬攻擊'] + '\n';
	if (item['_金錢攻擊']) description += '金銭攻撃: ' + item['_金錢攻擊'] + '\n';
	if (item['_無屬防禦']) description += '無属性防御: ' + item['_無屬防禦'] + '\n';
	if (item['_火屬防禦']) description += '火属性防御: ' + item['_火屬防禦'] + '\n';
	if (item['_水屬防禦']) description += '水属性防御: ' + item['_水屬防禦'] + '\n';
	if (item['_風屬防禦']) description += '風属性防御: ' + item['_風屬防禦'] + '\n';
	if (item['_地屬防禦']) description += '土属性防御: ' + item['_地屬防禦'] + '\n';
	if (item['_光屬防禦']) description += '光属性防御: ' + item['_光屬防禦'] + '\n';
	if (item['_闇屬防禦']) description += '闇属性防御: ' + item['_闇屬防禦'] + '\n';
	if (item['_金錢防禦']) description += '金銭防御: ' + item['_金錢防禦'] + '\n';
	if (item['_說明定義']) description += item['_說明定義'];

	return description;

}

function getDropList (item) {
	let isGreedyStorehouse = false;
	let isFantasyBag = false;
	let isShortened = false;
	let drops = dropList.root.drop.filter((drop) => {
		for (let i = 1; i <= 40; i++) {
			if (drop['_item'+i] === item['_編號']) return true;
		}
		return false;
	});
	if (!drops.length) return '無し';
	if (drops.filter((drop) => drop['_怪物名稱'].startsWith('強欲蔵')).length > 1) {
		isGreedyStorehouse = true;
		drops = drops.filter((drop) => !drop['_怪物名稱'].startsWith('強欲蔵'));
	}
	if (drops.filter((drop) => drop['_怪物名稱'].indexOf('幻想袋') !== -1).length > 1) {
		isFantasyBag = true;
		drops = drops.filter((drop) => drop['_怪物名稱'].indexOf('幻想袋') === -1);
	}
	if (drops.length > 10) {
		isShortened = true;
		drops = drops.slice(0, 10);
	}
	return drops.map((drop) => {
		if (+drop['_編號'] > 4214) {
			return drop['_怪物名稱'];
		} else {
			const monster = monsterList.root.npc.find((monster) => monster['_編號'] === drop['_編號']);
			if (monster && monster['_名稱']) {
				return monster['_名稱'];
			} else {
				return drop['_怪物名稱'];
			}
		}
	}).filter((x, i, self) => self.indexOf(x) === i).join(', ')
		.concat(isGreedyStorehouse ? ', 強欲蔵' : '')
		.concat(isFantasyBag ? ', 幻想袋' : '')
		.concat(isShortened ? ', 他' : '');
}

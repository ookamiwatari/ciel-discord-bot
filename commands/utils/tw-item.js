const Discord = require('discord.js');
const cmd = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const path = require('path');
const itemList = require('../../json/tw/item.json');
const dropList = require('../../json/tw/drop.json');
const monsterList = require('../../json/tw/monster.json');

module.exports = class Item extends cmd.Command {
	constructor(client) {
		super(client, {
			name: 'twitem',
			group: 'utils',
			memberName: 'twitem',
			description: "アイテム検索",
			examples: ['/twitem 極致結晶'],
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

		const items = itemList.root['道具'].filter((item) => item['基本名稱'] && item['編號'] && item['基本名稱'].indexOf(name) !== -1);

		if (!items.length) {
			return message.channel.send('アイテムが見つかりませんでした。');
		}

		const embeds = items.slice(0, 100).map((item) => {
			return new Discord.MessageEmbed()
				.setTitle(item['基本名稱'])
				.setURL('https://ookamiwatari.github.io/le-ciel-bleu-db/#/item/' + item['編號'])
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
	if (item['物品類別'] === '寶石') {
		return getCrystalItemDescription(item);
	} else if (item['無組合變化']) {
		return getEquipmentItemDescription(item);
	} else {
		return item['說明定義'] ? item['說明定義'] : '';
	}
}

function getCrystalItemDescription (item) {
	let description = '';
	if (item['動態資料1'] === '0') {
		description += '部位: 頭\n';
	} else if (item['動態資料1'] === '1'){
		description += '部位: 顔\n';
	} else if (item['動態資料1'] === '2'){
		description += '部位: 武器\n';
	} else if (item['動態資料1'] === '3'){
		description += '部位: 腕\n';
	} else if (item['動態資料1'] === '4'){
		description += '部位: 胴\n';
	} else if (item['動態資料1'] === '5'){
		description += '部位: 背\n';
	} else if (item['動態資料1'] === '6'){
		description += '部位: 足\n';
	} else if (item['動態資料1'] === '7'){
		description += '部位: アクセ\n';
	}
	if (item['動態資料2']) {
		description += `安定度: ${+item['動態資料2'] / 10}\n`;
	}
	description += `説明: ${item['說明定義']}`;
	return description
}

function getEquipmentItemDescription (item) {

	let description = '';
	if (item['物品類別']) description += '部位: ' + item['物品類別'] + '\n';
	if (item['等級限制']) description += '必要レベル: ' + item['等級限制'] + '\n';
	if (+item['物品等級'] < 10) description += 'ランク: ' + '_IPSGD_R_U'[+item['物品等級']] + '\n';
	description += 'スロット: ' + (item['打孔上限'] ? item['打孔上限'] : 0)  + '\n';
	if (item['HP']) description += 'HP: ' + item['HP'] + (item['HP定義'] === '最大值百分比' ? '%' : '') + '\n';
	if (item['MP']) description += 'SP: ' + item['MP'] + (item['MP定義'] === '最大值百分比' ? '%' : '') + '\n';
	if (item['力量']) description += 'STR: ' + item['力量'] + '\n';
	if (item['體質']) description += 'VIT: ' + item['體質'] + '\n';
	if (item['智力']) description += 'INT: ' + item['智力'] + '\n';
	if (item['信仰']) description += 'FAI: ' + item['信仰'] + '\n';
	if (item['速度']) description += 'AGI: ' + item['速度'] + '\n';
	if (item['靈巧']) description += 'DEX: ' + item['靈巧'] + '\n';
	if (item['平均攻擊']) description += 'ATK: ' + item['平均攻擊'] + '\n';
	if (item['攻擊變數']) description += '攻撃変数: ' + item['攻擊變數'] + '\n';
	if (item['防禦']) description += 'DEF: ' + item['防禦'] + '\n';
	if (item['魔攻']) description += 'MATK: ' + item['魔攻'] + '\n';
	if (item['魔防']) description += 'MDEF: ' + item['魔防'] + '\n';
	if (item['閃躲']) description += 'AVOID: ' + item['閃躲'] + '\n';
	if (item['命中']) description += 'HIT: ' + item['命中'] + '\n';
	if (item['無屬攻擊']) description += '無属性攻撃: ' + item['無屬攻擊'] + '\n';
	if (item['火屬攻擊']) description += '火属性攻撃: ' + item['火屬攻擊'] + '\n';
	if (item['水屬攻擊']) description += '水属性攻撃: ' + item['水屬攻擊'] + '\n';
	if (item['風屬攻擊']) description += '風属性攻撃: ' + item['風屬攻擊'] + '\n';
	if (item['地屬攻擊']) description += '土属性攻撃: ' + item['地屬攻擊'] + '\n';
	if (item['光屬攻擊']) description += '光属性攻撃: ' + item['光屬攻擊'] + '\n';
	if (item['闇屬攻擊']) description += '闇属性攻撃: ' + item['闇屬攻擊'] + '\n';
	if (item['金錢攻擊']) description += '金銭攻撃: ' + item['金錢攻擊'] + '\n';
	if (item['無屬防禦']) description += '無属性防御: ' + item['無屬防禦'] + '\n';
	if (item['火屬防禦']) description += '火属性防御: ' + item['火屬防禦'] + '\n';
	if (item['水屬防禦']) description += '水属性防御: ' + item['水屬防禦'] + '\n';
	if (item['風屬防禦']) description += '風属性防御: ' + item['風屬防禦'] + '\n';
	if (item['地屬防禦']) description += '土属性防御: ' + item['地屬防禦'] + '\n';
	if (item['光屬防禦']) description += '光属性防御: ' + item['光屬防禦'] + '\n';
	if (item['闇屬防禦']) description += '闇属性防御: ' + item['闇屬防禦'] + '\n';
	if (item['金錢防禦']) description += '金銭防御: ' + item['金錢防禦'] + '\n';
	if (item['說明定義']) description += item['說明定義'];

	return description;

}

function getDropList (item) {
	let isGreedyStorehouse = false;
	let isFantasyBag = false;
	let isShortened = false;
	let drops = dropList.root.drop.filter((drop) => {
		for (let i = 1; i <= 40; i++) {
			if (drop['item'+i] === item['編號']) return true;
		}
		return false;
	});
	if (!drops.length) return '無し';
	if (drops.filter((drop) => drop['怪物名稱'].startsWith('強欲蔵')).length > 1) {
		isGreedyStorehouse = true;
		drops = drops.filter((drop) => !drop['怪物名稱'].startsWith('強欲蔵'));
	}
	if (drops.filter((drop) => drop['怪物名稱'].indexOf('幻想袋') !== -1).length > 1) {
		isFantasyBag = true;
		drops = drops.filter((drop) => drop['怪物名稱'].indexOf('幻想袋') === -1);
	}
	if (drops.length > 10) {
		isShortened = true;
		drops = drops.slice(0, 10);
	}
	return drops.map((drop) => {
		if (+drop['編號'] > 4214) {
			return drop['怪物名稱'];
		} else {
			const monster = monsterList.root.npc.find((monster) => monster['編號'] === drop['編號']);
			if (monster && monster['名稱']) {
				return monster['名稱'];
			} else {
				return drop['怪物名稱'];
			}
		}
	}).filter((x, i, self) => self.indexOf(x) === i).join(', ')
		.concat(isGreedyStorehouse ? ', 強欲蔵' : '')
		.concat(isFantasyBag ? ', 幻想袋' : '')
		.concat(isShortened ? ', 他' : '');
}

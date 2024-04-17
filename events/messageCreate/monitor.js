const data = require("./../../config.json");
module.exports = async (message) => {
	try {
		const {
			content: text,
			channel: { parentId, id },
			guild,
		} = message;

		if (parentId !== process.env.CATEGORY_MONITORING_ID) return;

		const {
			filter: { name, yearFrame, miles, source },
		} = data;

		console.log("w");
		const titleRegex = /\*\*(Title|Y-M-M):\*\*\s*(.*?)\n/;
		// const priceRegex = /\*\*Price:\*\*\s*\$?(\d+(?:,\d{3})*)/;
		const milesRegex =
			/\*\*(Miles-Age|Mileage|Miles):\*\*\s*([\d,]+(?:\.\d+)?)/;

		const filters = [];

		if (name) {
			const match = matchRegex(titleRegex);

			if (match) {
				if (match[2].toLowerCase().includes(name.toLowerCase()))
					filters.push(true);
				else filters.push(false);
			}
		}

		if (yearFrame) {
			const match = matchRegex(titleRegex);

			if (match) {
				const yearsArray = [];

				for (let year = yearFrame[0]; year <= yearFrame[1]; year++) {
					yearsArray.push(year);
				}

				const isYearFound = yearsArray.some((year) => match[2].includes(year));

				if (isYearFound) filters.push(true);
				else filters.push(false);
			}
		}

		if (miles) {
			const match = matchRegex(milesRegex);

			if (match) {
				let miles = +match[2].replace(/,/g, "");
				if (id === process.env.FACEBOOK_CHANNEL_ID) miles *= 1000;

				const func = obj[milesRange];

				if (func(miles, miles)) filters.push(true);
				else filters.push(false);
			}
		}

		function matchRegex(regex) {
			const match = text.match(regex);

			if (match) return match;

			if (!match) filters.push(false);
		}

		const hasCrossedFilters = filters.every((filter) => filter);

		if (!hasCrossedFilters) return;

		const channel = await guild.channels.fetch(source);
		await channel.send(text);
	} catch (error) {
		console.log(error);
	}
};
const obj = {
	equalTo(target, found) {
		return target === found;
	},
	greaterThan(target, found) {
		return found > target;
	},
	lessThan(target, found) {
		return found < target;
	},
};

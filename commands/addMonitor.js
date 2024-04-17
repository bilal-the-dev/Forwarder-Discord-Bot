const { CommandType } = require("wokcommands");
const fs = require("fs");

const data = require("./../config.json");

module.exports = {
	// Required for slash commands
	description: "add a monitor",

	// Create a legacy and slash command
	type: CommandType.SLASH,
	options: [
		{
			name: "source_channel",
			description: "channel where message will be sent",
			type: 7,
			required: true,
		},
		{
			name: "name",
			description: "name of the car",
			type: 3,
		},
		{
			name: "year_frame",
			description: "year range (2021-2030) format",
			type: 3,
		},

		{
			name: "miles_range",
			description: "greater than, equal to, less than the target miles",
			type: 3,
			choices: [
				{ name: "Greater than", value: "greaterThan" },
				{ name: "Equal To", value: "equalTo" },
				{ name: "Less than", value: "lessThan" },
			],
		},
		{
			name: "target_miles",
			description: "the miles that will be looked in filter",
			type: 4,
		},
	],
	// Invoked when a user runs the ping command
	callback: async ({ interaction }) => {
		try {
			await interaction.deferReply({ ephemeral: true });
			const { options } = interaction;

			const sourceChannel = options.getChannel("source_channel");

			const name = options.getString("name");
			const yearStr = options.getString("year_frame");
			const miles = options.getInteger("target_miles");

			const milesRange = options.getString("miles_range") ?? "lessThan";

			if (!name && !yearStr && !miles)
				throw new Error("Please select at least one filter");

			let yearFrame;

			if (yearStr) {
				[start, end = start] = yearStr.split("-");

				const startYear = Number(start);
				const endYear = Number(end);

				const areNumbers = !Number.isNaN(startYear) && !Number.isNaN(endYear);

				if (!areNumbers) throw new Error("Please select correct year format");

				yearFrame = [start, end];
			}

			data.filter = {
				source: sourceChannel.id,
				...(name && { name }),
				...(yearStr && { yearFrame }),
				...(miles && { miles }),
				milesRange,
			};

			fs.writeFileSync("./config.json", JSON.stringify(data));

			await interaction.editReply("Added the monitor");
		} catch (error) {
			console.log(error);
			if (interaction.deferred || interaction.replied)
				return await interaction.editReply(error.message);
			await interaction.reply(error.message);
		}
	},
};

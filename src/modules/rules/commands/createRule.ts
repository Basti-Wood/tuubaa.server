import {CacheType, ChatInputCommandInteraction, Guild, PermissionFlagsBits, TextBasedChannel,} from "discord.js";
import {RulesDatabase} from "../database";
import {rulePrompt} from "../events/createRuleHandler";
import {SlashCommandPermissionsBuilder} from "../../../models/slashCommandBuilder";

export const createRule = {
	data: new SlashCommandPermissionsBuilder()
		.setName("create_rule")
		.setDescription(
			"Erstellt die Regel! \nWenn du die Regel updates lösche bitte die alte Regel Nachricht"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		// await interaction.deferReply({ ephemeral: true }

		const guild = interaction.guild as Guild;

		const oldRuleMessage = await RulesDatabase.get(guild);

		if (oldRuleMessage?.channel) {
			const channel = guild.channels.cache.get(
				oldRuleMessage.channel
			) as TextBasedChannel;

			if (oldRuleMessage && channel) {
				const message = await channel.messages.fetch(oldRuleMessage.message);
				if (message) {
					await message.delete();
				}
			}
		}

		const modal = rulePrompt();

		await interaction.showModal(modal);
	},
};

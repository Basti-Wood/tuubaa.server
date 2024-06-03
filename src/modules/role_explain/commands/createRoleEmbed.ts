import {PermissionFlagsBits, SlashCommandBuilder, TextBasedChannel,} from "discord.js";
import {SlashInteraction} from "../../../types/commands";
import {buildRoleEmbed} from "..";
import {prisma} from "../../../lib/database";
import {snowflake} from "../../../lib/snowflake";

export const createRoleEmbed = {
	data: new SlashCommandBuilder()
		.setName("role_explian_embed")
		.setDescription("Erstelle eine Embed Nachricht, die die Rollen erklärt.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: SlashInteraction) {
		await interaction.deferReply({ephemeral: true});

		const embed = await buildRoleEmbed();

		const message = await interaction.channel?.send({embeds: [embed]});

		const roleExplanations = await prisma.roleExplanation.findMany({
			where: {
				guildId: interaction.guildId || snowflake.guild.id,
			},
		});

		for (const roleExplanation of roleExplanations) {
			const channel = interaction.guild?.channels.cache.get(
				roleExplanation.channelId
			) as TextBasedChannel | null;
			if (channel === null) {
				continue;
			}
			const message = await channel.messages.fetch(roleExplanation.messageId);

			await prisma.roleExplanation.delete({
				where: {
					messageId: message.id,
				},
			});
			if (!message) {
				continue;
			}
			await message.delete();
		}

		if (!message) {
			await interaction.editReply("Fehler beim Erstellen der Nachricht!");
			return;
		}

		await prisma.roleExplanation.create({
			data: {
				messageId: message.id,
				guildId: message.guildId || snowflake.guild.id,
				channelId: message.channelId,
			},
		});

		await interaction.editReply("Erstellt!");
	},
};

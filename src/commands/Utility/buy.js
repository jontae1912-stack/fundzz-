import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Get information on how to purchase the script"),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Buy command defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'buy'
            });
            return;
        }

        const embed = infoEmbed(
            "💳 How to Purchase the Script",
            "Thank you for your interest in our script!\n\n" +
            "📧 **Contact Information:**\n" +
            "Reach out to our team to discuss pricing and features.\n\n" +
            "🔗 **Discord Server:** [Join our community](https://discord.gg/QnWNz2dKCE)\n\n" +
            "For inquiries, please contact a server administrator or send a direct message."
        );

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed],
        });
    },
};

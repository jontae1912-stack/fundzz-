import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
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

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('💳 Script Access Information')
            .setDescription(`Hi <@${interaction.user.id}>, it looks like you're asking about scripts.`)
            .addFields(
                {
                    name: '🔑 How to Get Scripts',
                    value: 'To get access to our scripts, you have two options:',
                    inline: false
                },
                {
                    name: '👑 Option 1: Purchase Access',
                    value: 'Please take a look at <#PURCHASE_CHANNEL_ID> | <#PURCHASE_LINK_CHANNEL> to pay for longer access.',
                    inline: false
                },
                {
                    name: '🔓 Option 2: Key System',
                    value: 'Alternatively, check out <#MULTILOADER_CHANNEL> and use our key system to get access to all scripts.',
                    inline: false
                },
                {
                    name: '💬 Check Your DMs',
                    value: 'More detailed information has been sent to your DMs!',
                    inline: false
                },
                {
                    name: '⚠️ Important Note',
                    value: 'Please make sure to follow the instructions in those channels carefully.',
                    inline: false
                }
            )
            .setFooter({ text: 'Cosmos - Script Support • Today at 11:00 AM' });

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed],
        });
    },
};

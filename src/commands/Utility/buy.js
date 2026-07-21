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
            .setDescription(`Hi <@${interaction.user.id}>, here's how you can get access to our scripts.`)
            .addFields(
                {
                    name: '🔑 How to Get Scripts',
                    value: 'To get access to our scripts, you have two options:',
                    inline: false
                },
                {
                    name: '👑 Option 1: Purchase Access',
                    value: 'Please take a look at <#1522366600550809662> to purchase lifetime or longer access.',
                    inline: false
                },
                {
                    name: '🔓 Option 2: Key System',
                    value: 'Alternatively, check out <#1525325327168045096> and use our key system to get access to the script.',
                    inline: false
                },
                {
                    name: '💬 Need Help?',
                    value: 'If you have any questions or need assistance, open a support ticket and our staff will help you.',
                    inline: false
                },
                {
                    name: '⚠️ Important',
                    value: 'Please read all instructions in the channels above before opening a ticket.',
                    inline: false
                }
            )
            .setFooter({
                text: 'fundz • Script Support'
            })
            .setTimestamp();

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [embed],
        });
    },
};

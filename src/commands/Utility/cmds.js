import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cmds')
        .setDescription('View all available commands'),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Cmds command defer failed`);
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📋 Available Commands')
                .setDescription('Here are all the commands you can use:')
                .addFields(
                    {
                        name: '⭐ Voucher Commands',
                        value: 'Commands matching /vouch',
                        inline: false
                    },
                    {
                        name: '/vouch',
                        value: 'Submit a new vouch for another user',
                        inline: true
                    },
                    {
                        name: '/vouchstats',
                        value: 'View vouch statistics',
                        inline: true
                    },
                    {
                        name: '/checkvouches',
                        value: 'Check your vouches and available rewards',
                        inline: true
                    },
                    {
                        name: '/restorecallvouches',
                        value: '[Admin] Restore all vouches from database',
                        inline: true
                    },
                    {
                        name: '/useruservouches',
                        value: '[Admin] Redeem vouches for a specific user',
                        inline: true
                    },
                    {
                        name: '🛍️ Shop Commands',
                        value: 'Commands matching /buy',
                        inline: false
                    },
                    {
                        name: '/buy',
                        value: 'Get information on how to purchase the script',
                        inline: true
                    }
                )
                .setFooter({ text: 'Cosmos • Use / to see all commands' });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed],
            });

            logger.info(`Commands list viewed by ${interaction.user.tag}`);
        } catch (error) {
            logger.error('Error viewing commands:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to fetch commands list.',
            });
        }
    },
};
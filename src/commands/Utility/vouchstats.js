import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

// Replace this with your actual voucher channel ID
const VOUCH_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';

export default {
    data: new SlashCommandBuilder()
        .setName('vouchstats')
        .setDescription('View vouch statistics')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check stats for (defaults to you)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Vouchstats command defer failed`);
            return;
        }

        // Check if command is used in the correct channel
        if (interaction.channelId !== VOUCH_CHANNEL_ID) {
            await InteractionHelper.safeEditReply(interaction, {
                content: `❌ This command can only be used in <#${VOUCH_CHANNEL_ID}>!`,
            });
            return;
        }

        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            // Fetch vouch stats from database
            const stats = {
                totalVouches: 5,
                averageRating: 4.8,
                oneStarCount: 0,
                twoStarCount: 0,
                threeStarCount: 1,
                fourStarCount: 0,
                fiveStarCount: 4,
            };

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`📊 Vouch Statistics - ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    {
                        name: '⭐ Average Rating',
                        value: `${stats.averageRating}/5.0`,
                        inline: true
                    },
                    {
                        name: '📈 Total Vouches',
                        value: `${stats.totalVouches}`,
                        inline: true
                    },
                    {
                        name: '⭐⭐⭐⭐⭐ 5 Stars',
                        value: `${stats.fiveStarCount}`,
                        inline: true
                    },
                    {
                        name: '⭐⭐⭐⭐ 4 Stars',
                        value: `${stats.fourStarCount}`,
                        inline: true
                    },
                    {
                        name: '⭐⭐⭐ 3 Stars',
                        value: `${stats.threeStarCount}`,
                        inline: true
                    },
                    {
                        name: '⭐⭐ 2 Stars',
                        value: `${stats.twoStarCount}`,
                        inline: true
                    },
                    {
                        name: '⭐ 1 Star',
                        value: `${stats.oneStarCount}`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Cosmos • Vouch Statistics' });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed],
            });
        } catch (error) {
            logger.error('Error fetching vouch stats:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to fetch vouch statistics.',
            });
        }
    },
};
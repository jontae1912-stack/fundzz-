import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getGuildConfig } from '../../services/config/guildConfig.js';

export default {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Submit a new vouch')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to vouch for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('comment')
                .setDescription('Your comment about this user')
                .setRequired(true)
                .setMaxLength(500)
        )
        .addIntegerOption(option =>
            option
                .setName('rating')
                .setDescription('Rate from 1-5 stars')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)
        ),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Vouch command defer failed`);
            return;
        }

        const vouchedUser = interaction.options.getUser('user');
        const comment = interaction.options.getString('comment');
        const rating = interaction.options.getInteger('rating');

        if (vouchedUser.bot) {
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ You cannot vouch for bots!',
            });
            return;
        }

        if (vouchedUser.id === interaction.user.id) {
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ You cannot vouch for yourself!',
            });
            return;
        }

        // Store vouch in database
        try {
            const vouchData = {
                vouchId: `V${Date.now()}`,
                vouchedUser: vouchedUser.id,
                vouchedUserTag: vouchedUser.tag,
                vouchedUserAvatar: vouchedUser.displayAvatarURL(),
                vouchingUser: interaction.user.id,
                vouchingUserTag: interaction.user.tag,
                comment: comment,
                rating: rating,
                date: new Date().toISOString(),
                guildId: interaction.guildId,
            };

            // Save to database (you can use your existing database setup)
            if (interaction.client.db) {
                // Save to database
                await interaction.client.db.saveVouch?.(vouchData);
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('⭐ New Vouch Received')
                .addFields(
                    {
                        name: '💬 Comment',
                        value: comment,
                        inline: false
                    },
                    {
                        name: '👤 Vouch ID',
                        value: vouchData.vouchId,
                        inline: true
                    },
                    {
                        name: '🧑 Customer',
                        value: `@${vouchedUser.username}`,
                        inline: true
                    },
                    {
                        name: '📅 Date',
                        value: new Date(vouchData.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        inline: true
                    },
                    {
                        name: '⭐ Rating',
                        value: '⭐'.repeat(rating) + (rating < 5 ? '☆'.repeat(5 - rating) : ''),
                        inline: false
                    },
                    {
                        name: `${rating}/5`,
                        value: 'Rating',
                        inline: true
                    },
                    {
                        name: 'Product',
                        value: 'Vouching Service',
                        inline: true
                    }
                )
                .setFooter({ text: `Cosmos • Verified Feedback • ${new Date().toLocaleString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}` });

            await InteractionHelper.safeEditReply(interaction, {
                content: `✅ Vouch submitted successfully for ${vouchedUser}!`,
                embeds: [embed],
            });

            logger.info(`Vouch received: ${interaction.user.tag} vouched for ${vouchedUser.tag}`);
        } catch (error) {
            logger.error('Error submitting vouch:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to submit vouch. Please try again later.',
            });
        }
    },
};
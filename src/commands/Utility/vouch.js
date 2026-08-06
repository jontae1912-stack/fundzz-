import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Submit a vouch for a user')
        .addUserOption(option =>
            option.setName('user').setDescription('User to vouch for').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('comment').setDescription('Your feedback').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('rating').setDescription('Rating 1-5').setRequired(true).setMinValue(1).setMaxValue(5)
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
            // Try to obtain a sequential count from the database if available
            let existingCount = 0;
            try {
                if (interaction.client.db) {
                    if (typeof interaction.client.db.countVouches === 'function') {
                        existingCount = await interaction.client.db.countVouches(interaction.guildId);
                    } else if (typeof interaction.client.db.getVouchesForGuild === 'function') {
                        const list = await interaction.client.db.getVouchesForGuild(interaction.guildId);
                        existingCount = Array.isArray(list) ? list.length : 0;
                    } else if (typeof interaction.client.db.getVouches === 'function') {
                        const list = await interaction.client.db.getVouches({ guildId: interaction.guildId });
                        existingCount = Array.isArray(list) ? list.length : 0;
                    }
                }
            } catch (e) {
                logger.warn('Could not fetch vouch count from DB, falling back to timestamp id', e);
                existingCount = 0;
            }

            const vouchId = existingCount ? `#${existingCount + 1}` : `#${Date.now()}`;

            const vouchData = {
                vouchId: vouchId,
                vouchedUser: vouchedUser.id,
                vouchedUserTag: vouchedUser.tag,
                vouchedUserAvatar: vouchedUser.displayAvatarURL({ extension: 'png', size: 512 }),
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

            // Build polished star display
            const filled = '⭐'.repeat(rating);
            const empty = '☆'.repeat(Math.max(0, 5 - rating));
            const stars = `${filled}${empty}`;

            // Create a richer embed that looks better in Discord
            const embed = new EmbedBuilder()
                .setColor('#8B3BE6')
                .setTitle('⭐ New Vouch Received')
                .setAuthor({ name: 'Cosmos Vouch', iconURL: interaction.client.user?.displayAvatarURL() })
                .setThumbnail(vouchedUser.displayAvatarURL({ extension: 'png', size: 512 }))
                .setDescription(comment ? `**${comment}**` : '\u200b')
                .addFields(
                    { name: 'Vouch ID', value: vouchData.vouchId, inline: true },
                    { name: 'Customer', value: `<@${vouchedUser.id}>`, inline: true },
                    { name: 'Date', value: new Date(vouchData.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), inline: true },
                    { name: 'Product', value: 'Vouching Service', inline: true },
                    { name: 'Rating', value: `${stars}  •  **${rating}/5**`, inline: false }
                )
                .setFooter({ text: `Cosmos • Verified Feedback` })
                .setTimestamp(new Date(vouchData.date));

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

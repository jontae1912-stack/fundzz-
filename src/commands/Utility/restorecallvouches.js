import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { isBotOwner } from '../../config/bot.js';

// Replace this with your actual voucher channel ID
const VOUCH_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';

export default {
    data: new SlashCommandBuilder()
        .setName('restorecallvouches')
        .setDescription('[Admin] Restore all vouches from database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user is admin or bot owner
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && !isBotOwner(interaction.user.id)) {
            await interaction.reply({
                content: '❌ You do not have permission to use this command.',
                flags: 'Ephemeral',
            });
            return;
        }

        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Restorecallvouches command defer failed`);
            return;
        }

        // Check if command is used in the correct channel
        if (interaction.channelId !== VOUCH_CHANNEL_ID) {
            await InteractionHelper.safeEditReply(interaction, {
                content: `❌ This command can only be used in <#${VOUCH_CHANNEL_ID}>!`,
            });
            return;
        }

        try {
            // Simulate restoring vouches from database
            const restoredCount = 150; // Example count

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('✅ Vouches Restored')
                .addFields(
                    {
                        name: '📊 Restoration Summary',
                        value: `Total vouches restored: **${restoredCount}**`,
                        inline: false
                    },
                    {
                        name: '⏱️ Time',
                        value: new Date().toLocaleString(),
                        inline: false
                    },
                    {
                        name: '👨‍⚖️ Administrator',
                        value: `${interaction.user.tag}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Cosmos • Admin Action' });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed],
            });

            logger.info(`Admin ${interaction.user.tag} restored ${restoredCount} vouches from database`);
        } catch (error) {
            logger.error('Error restoring vouches:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to restore vouches from database.',
            });
        }
    },
};
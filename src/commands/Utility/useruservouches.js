import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { isBotOwner } from '../../config/bot.js';

export default {
    data: new SlashCommandBuilder()
        .setName('useruservouches')
        .setDescription('[Admin] Redeem vouches for a specific user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to redeem vouches for')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of vouches to redeem')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for redemption')
                .setRequired(false)
        ),

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
            logger.warn(`Useruservouches command defer failed`);
            return;
        }

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (targetUser.bot) {
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ You cannot redeem vouches for bots!',
            });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('✅ Vouches Redeemed')
                .addFields(
                    {
                        name: '👤 User',
                        value: `${targetUser.tag}`,
                        inline: true
                    },
                    {
                        name: '🎟️ Amount',
                        value: `${amount} vouches`,
                        inline: true
                    },
                    {
                        name: '📝 Reason',
                        value: reason,
                        inline: false
                    },
                    {
                        name: '👨‍⚖️ Administrator',
                        value: `${interaction.user.tag}`,
                        inline: true
                    },
                    {
                        name: '⏱️ Time',
                        value: new Date().toLocaleString(),
                        inline: true
                    }
                )
                .setFooter({ text: 'Cosmos • Admin Action' });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed],
            });

            logger.info(`Admin ${interaction.user.tag} redeemed ${amount} vouches for ${targetUser.tag}. Reason: ${reason}`);
        } catch (error) {
            logger.error('Error redeeming vouches:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to redeem vouches.',
            });
        }
    },
};
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('checkvouches')
        .setDescription('Check your vouches and available rewards'),

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`Checkvouches command defer failed`);
            return;
        }

        try {
            // Fetch user's vouches
            const userVouches = [
                { comment: 'Great service!', rating: 5, date: '2 days ago' },
                { comment: 'Very reliable', rating: 5, date: '1 week ago' },
                { comment: 'Fast delivery', rating: 4, date: '2 weeks ago' },
            ];

            const totalVouches = userVouches.length;
            const averageRating = (userVouches.reduce((acc, v) => acc + v.rating, 0) / totalVouches).toFixed(1);

            // Calculate rewards
            const vouchesNeededForReward = 5;
            const vouchesUntilReward = Math.max(0, vouchesNeededForReward - totalVouches);

            const vouchList = userVouches
                .map((v, i) => `${i + 1}. "${v.comment}" - ${v.rating}⭐ (${v.date})`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`💬 Your Vouches - ${interaction.user.username}`)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    {
                        name: '📊 Your Vouches',
                        value: vouchList || 'No vouches yet!',
                        inline: false
                    },
                    {
                        name: '⭐ Average Rating',
                        value: `${averageRating}/5.0 (${totalVouches} vouches)`,
                        inline: true
                    },
                    {
                        name: '🎁 Rewards Progress',
                        value: `${totalVouches}/${vouchesNeededForReward} for next reward`,
                        inline: true
                    },
                    {
                        name: '🏆 Available Rewards',
                        value: totalVouches >= 5 ? '✅ Premium Access\n✅ Lifetime Pass' : '⏳ Get 5 vouches to unlock rewards',
                        inline: false
                    }
                )
                .setFooter({ text: 'Cosmos • Your Vouches' });

            await InteractionHelper.safeEditReply(interaction, {
                embeds: [embed],
            });
        } catch (error) {
            logger.error('Error checking vouches:', error);
            await InteractionHelper.safeEditReply(interaction, {
                content: '❌ Failed to fetch your vouches.',
            });
        }
    },
};

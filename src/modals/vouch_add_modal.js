import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  async execute(interaction, client, args) {
    // modal submit customId format: vouch_add_modal:<vouchedUserId>
    const [_, vouchedUserId] = interaction.customId?.split(':') || [null, null];

    // Extract inputs
    const product = interaction.fields.getTextInputValue('product_input');
    const ratingStr = interaction.fields.getTextInputValue('rating_input');
    const feedback = interaction.fields.getTextInputValue('feedback_input');
    const imageUrl = interaction.fields.getTextInputValue('image_input') || null;
    const customerInput = interaction.fields.getTextInputValue('customer_input') || null;

    const rating = Number(ratingStr);
    if (!product || !feedback || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      await interaction.reply({ content: 'Invalid input. Please ensure product, feedback and rating (1-5) are provided.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

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

      let vouchedUser = null;
      if (vouchedUserId) {
        try { vouchedUser = await client.users.fetch(vouchedUserId); } catch(e) { vouchedUser = null; }
      }

      const vouchData = {
        vouchId,
        vouchedUser: vouchedUser ? vouchedUser.id : vouchedUserId,
        vouchedUserTag: vouchedUser ? vouchedUser.tag : (customerInput || 'unknown'),
        vouchedUserAvatar: vouchedUser ? vouchedUser.displayAvatarURL({ extension: 'png', size: 512 }) : null,
        vouchingUser: interaction.user.id,
        vouchingUserTag: interaction.user.tag,
        comment: feedback,
        rating,
        date: new Date().toISOString(),
        guildId: interaction.guildId,
        product,
        bannerUrl: imageUrl,
      };

      if (interaction.client.db) {
        await interaction.client.db.saveVouch?.(vouchData);
      }

      const filled = '⭐'.repeat(rating);
      const empty = '☆'.repeat(Math.max(0, 5 - rating));
      const stars = `${filled}${empty}`;

      const embed = new EmbedBuilder()
        .setColor('#8B3BE6')
        .setTitle('⭐ New Vouch Received')
        .setAuthor({ name: 'Cosmos Vouch', iconURL: interaction.client.user?.displayAvatarURL() })
        .setThumbnail(vouchData.vouchedUserAvatar || interaction.client.user?.displayAvatarURL())
        .setDescription(feedback ? `**${feedback}**` : '\u200b')
        .addFields(
          { name: 'Vouch ID', value: vouchData.vouchId, inline: true },
          { name: 'Customer', value: vouchData.vouchedUser ? `<@${vouchData.vouchedUser}>` : vouchData.vouchedUserTag, inline: true },
          { name: 'Date', value: new Date(vouchData.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), inline: true },
          { name: 'Product', value: product || 'Vouching Service', inline: true },
          { name: 'Rating', value: `${stars}  •  **${rating}/5**`, inline: false }
        )
        .setFooter({ text: `Cosmos • Verified Feedback` })
        .setTimestamp(new Date(vouchData.date));

      const addRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`vouch_add:${vouchData.vouchedUser}`).setLabel('⭐ Add Vouch').setStyle(ButtonStyle.Primary)
      );

      await InteractionHelper.safeEditReply(interaction, {
        content: `✅ Vouch submitted successfully for ${vouchedUser ? `<@${vouchedUser.id}>` : (vouchedUserId || 'user')}!`,
        embeds: [embed],
        components: [addRow]
      });

    } catch (error) {
      logger.error('Error handling add vouch modal submit:', error);
      await InteractionHelper.safeEditReply(interaction, {
        content: '❌ Failed to submit vouch from modal. Please try again later.'
      });
    }
  }
};

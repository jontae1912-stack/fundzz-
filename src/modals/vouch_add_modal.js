import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getVouchCounterKey } from '../../utils/database/keys.js';

export default {
  async execute(interaction, client, args) {
    // This file mirrors the modal handler used in interactions/modals but lives in src/modals for backwards compatibility.
    // If your loader uses src/interactions/modals, that file will be preferred. The logic here ensures the vouch counter is used.

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
      let counter = null;
      try {
        if (interaction.client.db && typeof interaction.client.db.increment === 'function') {
          counter = await interaction.client.db.increment(getVouchCounterKey(interaction.guildId), 1);
        }
      } catch (e) {
        logger.warn('Could not increment vouch counter, falling back to count method', e);
        counter = null;
      }

      let vouchId;
      if (counter !== null && Number.isFinite(Number(counter))) {
        vouchId = `#${Number(counter)}`;
      } else {
        let existingCount = 0;
        try {
          if (interaction.client.db) {
            if (typeof interaction.client.db.countVouches === 'function') {
              existingCount = await interaction.client.db.countVouches(interaction.guildId);
            } else if (typeof interaction.client.db.getVouchesForGuild === 'function') {
              const list = await interaction.client.db.getVouchesForGuild(interaction.guildId);
              existingCount = Array.isArray(list) ? list.length : 0;
            }
          }
        } catch (e) {
          logger.warn('Could not fetch vouch count from DB, falling back to timestamp id', e);
          existingCount = 0;
        }
        vouchId = `#${existingCount + 1}`;
      }

      const vouchData = {
        vouchId,
        vouchedUser: interaction.user.id,
        vouchedUserTag: interaction.user.tag,
        vouchedUserAvatar: interaction.user.displayAvatarURL({ extension: 'png', size: 512 }),
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
        await interaction.client.db.set(`guild:${interaction.guildId}:vouch:${vouchId}`, vouchData);
      }

      const stars = '⭐'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));

      const embed = new EmbedBuilder()
        .setColor('#8B3BE6')
        .setTitle('⭐ New Vouch Received')
        .setAuthor({ name: 'Cosmos Vouch', iconURL: interaction.client.user?.displayAvatarURL() })
        .setThumbnail(vouchData.vouchedUserAvatar || interaction.client.user?.displayAvatarURL())
        .setDescription(feedback ? `**${feedback}**` : '\u200b')
        .addFields(
          { name: 'Vouch ID', value: vouchData.vouchId, inline: true },
          { name: 'Customer', value: `<@${vouchData.vouchedUser}>`, inline: true },
          { name: 'Date', value: new Date(vouchData.date).toLocaleString(), inline: true },
          { name: 'Product', value: product || 'Vouching Service', inline: true },
          { name: 'Rating', value: `${stars}  •  **${rating}/5**`, inline: false }
        )
        .setFooter({ text: `Cosmos • Verified Feedback` })
        .setTimestamp(new Date(vouchData.date));

      const addRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`vouch_add:${vouchData.vouchedUser || ''}`).setLabel('⭐ Add Vouch').setStyle(ButtonStyle.Primary)
      );

      await InteractionHelper.safeEditReply(interaction, {
        content: `✅ Vouch submitted successfully for <@${vouchData.vouchedUser}>!`,
        embeds: [embed],
        components: [addRow]
      });

    } catch (error) {
      logger.error('Error handling add vouch modal submit (legacy):', error);
      await InteractionHelper.safeEditReply(interaction, {
        content: '❌ Failed to submit vouch from modal. Please try again later.'
      });
    }
  }
};

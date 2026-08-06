import { EmbedBuilder } from 'discord.js';
import { createTicket } from '../../services/ticket.js';
import { getGuildConfig } from '../../services/config/guildConfig.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';
import { replyUserError } from '../../utils/errorHandler.js';

export default {
  name: 'ticket_select',
  async execute(interaction, client, args) {
    try {
      const choice = interaction.values?.[0];
      if (!choice) {
        await interaction.reply({ content: 'No ticket option selected.', ephemeral: true });
        return;
      }

      // Defer so we have time to create channel
      const deferred = await InteractionHelper.safeDefer(interaction, { flags: 64 }).catch(() => null);
      if (!deferred) {
        // fallback
        try { await interaction.deferReply({ ephemeral: true }); } catch {};
      }

      // Friendly mapping
      const mapping = {
        product_not_received: { title: '📦 Product Not Received', desc: 'Order was not delivered correctly' },
        purchase: { title: '🛒 Purchase', desc: 'Make a ticket for a delivered item' },
        resellers: { title: '💼 Resellers', desc: 'Resellers info and partnership inquiries' },
        content_creator: { title: '🎬 Content Creator', desc: 'Apply to be a content creator' },
        free_day_key: { title: '🔑 Free Day Key', desc: 'Information about free day keys' },
        staff_apply: { title: '👑 Staff Apply', desc: 'Apply to become staff' },
        support: { title: '🆘 Support', desc: 'General support or assistance' },
      };

      const meta = mapping[choice] || { title: 'Support Ticket', desc: 'We have received your request.' };

      // Get optional configured category ID
      let categoryId = null;
      try {
        const config = await getGuildConfig(client, interaction.guildId);
        categoryId = config.ticketCategoryId || null;
      } catch (err) {
        logger.warn('ticket_select: failed to load guild config, continuing without category', { guildId: interaction.guildId, err: err?.message });
      }

      // Compose a short reason using selection; user can expand inside the ticket
      const reason = `${meta.title} — ${meta.desc}`;

      // Create the ticket channel using service
      const { channel, ticketData } = await createTicket(interaction.guild, interaction.member, categoryId, reason);

      // Build confirmation embed
      const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket Created')
        .setDescription(`Your ticket has been created: ${channel}

**Category:** ${meta.title}\n**What to do next:** Please provide any additional details here so staff can assist you.`)
        .setColor('#5865F2');

      // Edit the deferred reply
      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        // fallback to reply
        await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
      }

      logger.info('Ticket created via select menu', { guildId: interaction.guildId, userId: interaction.user.id, channelId: channel.id, ticketNumber: ticketData?.id });

    } catch (error) {
      logger.error('ticket_select handler error:', error);
      try {
        await replyUserError(interaction, { type: 'unknown', message: 'Failed to create ticket. Please try again later.' });
      } catch {
        try { await interaction.followUp({ content: 'Failed to create ticket. Please contact staff.', ephemeral: true }); } catch {}
      }
    }
  }
};

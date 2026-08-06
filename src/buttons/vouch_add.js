import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  async execute(interaction, client, args) {
    // args[0] should be the vouched user's id
    const vouchedUserId = args && args[0] ? args[0] : null;

    const modal = new ModalBuilder()
      .setCustomId(`vouch_add_modal:${vouchedUserId}`)
      .setTitle('Add Vouch');

    const productInput = new TextInputBuilder()
      .setCustomId('product_input')
      .setLabel('Product')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter the product name')
      .setRequired(true);

    const ratingInput = new TextInputBuilder()
      .setCustomId('rating_input')
      .setLabel('Rating (1-5)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter a number from 1 to 5')
      .setRequired(true);

    const feedbackInput = new TextInputBuilder()
      .setCustomId('feedback_input')
      .setLabel('Feedback')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Share your experience with the product')
      .setRequired(true);

    const imageInput = new TextInputBuilder()
      .setCustomId('image_input')
      .setLabel('Image URL (optional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Paste an image URL or leave empty')
      .setRequired(false);

    const customerInput = new TextInputBuilder()
      .setCustomId('customer_input')
      .setLabel('Customer (optional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Enter customer name or mention')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(productInput),
      new ActionRowBuilder().addComponents(ratingInput),
      new ActionRowBuilder().addComponents(feedbackInput),
      new ActionRowBuilder().addComponents(imageInput),
      new ActionRowBuilder().addComponents(customerInput),
    );

    await interaction.showModal(modal);
  }
};

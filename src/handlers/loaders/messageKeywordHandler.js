import { logger } from '../../utils/logger.js';
import { infoEmbed } from '../../utils/embeds.js';

// Keywords that trigger the buy script response
const BUY_SCRIPT_KEYWORDS = [
    'how do i buy the script',
    'how do you buy the script',
    'how to buy the script',
    'where can i buy the script',
    'how much is the script',
    'script price',
    'buy script',
    'purchase script',
    'how to purchase the script',
];

export async function handleKeywordTriggers(message) {
    try {
        // Skip bot messages and DMs
        if (message.author.bot || !message.guild) {
            return false;
        }

        const lowerContent = message.content.toLowerCase().trim();

        // Check for buy script keywords
        for (const keyword of BUY_SCRIPT_KEYWORDS) {
            if (lowerContent.includes(keyword)) {
                await handleBuyScriptQuery(message);
                return true;
            }
        }

        return false;
    } catch (error) {
        logger.error('Error handling keyword triggers:', error);
        return false;
    }
}

async function handleBuyScriptQuery(message) {
    try {
        const embed = infoEmbed(
            "💳 How to Purchase the Script",
            "Thank you for your interest in our script!\n\n" +
            "📧 **Contact Information:**\n" +
            "Reach out to our team to discuss pricing and features.\n\n" +
            "🔗 **Discord Server:** [Join our community](https://discord.gg/QnWNz2dKCE)\n\n" +
            "For inquiries, please contact a server administrator or send a direct message."
        );

        await message.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false }
        }).catch((error) => {
            logger.error('Failed to send buy script response:', error);
        });
    } catch (error) {
        logger.error('Error handling buy script query:', error);
    }
}

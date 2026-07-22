import { logger } from '../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';

// Keywords that trigger the buy script response
const BUY_SCRIPT_KEYWORDS = [
    'how do i buy the script',
    'i’m trying to buy the weekly script',
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
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('💳 Script Access Information')
            .setDescription(`Hi <@${message.author.id}>, it looks like you're asking about scripts.`)
            .addFields(
                {
                    name: '🔑 How to Get Scripts',
                    value: 'To get access to our scripts, you have two options:',
                    inline: false
                },
                {
                    name: '👑 Option 1: Purchase Access',
                    value: 'Please take a look at <#1522366600550809662> | <#1522366599623868557> to pay for longer access.',
                    inline: false
                },
                {
                    name: '🔓 Option 2: Key System',
                    value: 'Alternatively, check out <#1525325327168045096> and use our key system to get access to the script.',
                    inline: false
                },
                {
                    name: '💬 make a ticket',
                    value: 'Make a ticket!',
                    inline: false
                },
                {
                    name: '⚠️ Important Note',
                    value: 'Please make sure to follow the instructions in those channels carefully.',
                    inline: false
                }
            )
            .setFooter({ text: 'fundzz - Script Support' });

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

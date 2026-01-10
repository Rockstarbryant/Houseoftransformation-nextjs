import { CHATBOT_RESPONSES } from '../utils/constants';

export const chatbotService = {
  getResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('service') || lowerMsg.includes('time')) {
      return CHATBOT_RESPONSES.SERVICE_TIMES;
    } else if (lowerMsg.includes('location') || lowerMsg.includes('where')) {
      return CHATBOT_RESPONSES.LOCATION;
    } else if (lowerMsg.includes('donate') || lowerMsg.includes('give')) {
      return CHATBOT_RESPONSES.DONATION;
    } else if (lowerMsg.includes('prayer')) {
      return CHATBOT_RESPONSES.PRAYER;
    } else if (lowerMsg.includes('volunteer')) {
      return CHATBOT_RESPONSES.VOLUNTEER;
    } else if (lowerMsg.includes('kids') || lowerMsg.includes('children')) {
      return CHATBOT_RESPONSES.KIDS;
    }

    return CHATBOT_RESPONSES.DEFAULT;
  }
};
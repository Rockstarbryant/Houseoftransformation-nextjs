export const chatbotService = {
  getResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Service times
    if (lowerMsg.match(/service|worship|time|schedule|when|sunday|meeting/)) {
      return "Our Sunday services are from 9:00 AM to 12:00 PM. We'd love to see you there! You can find more details on our Home page.";
    }
    
    // Location & directions
    if (lowerMsg.match(/location|where|address|direction|find|map|how to get/)) {
      return "We are located in Busia Town, Busia County, Kenya. You can find our exact location on the map in the Contact section of our website!";
    }
    
    // Donations & giving
    if (lowerMsg.match(/donate|give|giving|tithe|offering|contribute|support|money/)) {
      return "Thank you for your generosity! You can give through our Portal page. Click on 'PORTAL' in the menu above to access giving options. Your support helps transform lives!";
    }
    
    // Prayer requests
    if (lowerMsg.match(/prayer|pray/)) {
      return "We believe in the power of prayer! You can submit a prayer request through our website or share it with our pastoral team. Visit the Contact page or call us at +254 700 000 000.";
    }
    
    // Volunteering
    if (lowerMsg.match(/volunteer|serve|help|join|participate|get involved/)) {
      return "We're excited you want to serve! Check out our Volunteer page in the menu to see opportunities. You can also contact us at info@houseoftransformation.or.ke to learn more about serving in various ministries.";
    }
    
    // Kids & children programs
    if (lowerMsg.match(/kid|child|children|youth|teen|sunday school|nursery/)) {
      return "We have programs for children and youth! Check the Content section in the menu for information about our kids' ministries. Our Sunday services (9 AM - 12 PM) include children's programs.";
    }

    // Contact information
    if (lowerMsg.match(/contact|call|email|phone|reach|talk to|speak to/)) {
      return "You can reach us at info@houseoftransformation.or.ke or call +254 700 000 000. Visit our Contact page in the menu for more ways to connect with us!";
    }

    // Events & calendar
    if (lowerMsg.match(/event|calendar|program|activity|happening|upcoming|what's on/)) {
      return "We have exciting events throughout the year! Check the Content section in the menu or visit our website regularly for updates on upcoming programs and special services.";
    }

    // Ministries & groups
    if (lowerMsg.match(/ministry|ministries|group|small group|bible study|fellowship/)) {
      return "We have various ministries to help you grow spiritually! Visit the Content section in the menu to explore our ministries, or click 'Ministries' below to learn more.";
    }

    // New members & visitors
    if (lowerMsg.match(/new|visitor|first time|visit|join church|member|membership/)) {
      return "Welcome to House of Transformation! 🎉 We meet Sundays from 9 AM - 12 PM in Busia Town. For your first visit, just come as you are! Learn more about us in the About section of our website.";
    }

    // About the church
    if (lowerMsg.match(/about|who are you|tell me about|mission|vision|purpose/)) {
      return "House of Transformation exists to transform lives through the anointed gospel of Jesus Christ. We're a community built on love and power. Click 'ABOUT' in the menu to learn more about our mission and vision!";
    }

    // Portal/Login
    if (lowerMsg.match(/portal|login|log in|sign in|account|access/)) {
      return "To access the member portal, click on 'PORTAL' in the menu at the top of the page. If you're a new member and need login credentials, please contact us at info@houseoftransformation.or.ke.";
    }

    // Feedback
    if (lowerMsg.match(/feedback|suggestion|complaint|comment|improve/)) {
      return "We value your feedback! Click on 'FEEDBACK' in the menu to share your thoughts, suggestions, or testimonies with us. Your input helps us serve better!";
    }

    // Website navigation help
    if (lowerMsg.match(/navigate|how to use|find|page|menu|website|where is/)) {
      return "I can help you navigate! Use the menu at the top: HOME, ABOUT (our mission), CONTENT (ministries/resources), VOLUNTEER, PORTAL (member login), CONTACT (location/info), and FEEDBACK. What are you looking for?";
    }

    // Baptism
    if (lowerMsg.match(/bapti|water bapti/)) {
      return "Baptism is an important step of faith! Contact our pastoral team at info@houseoftransformation.or.ke or call +254 700 000 000 to learn about baptism classes and upcoming baptism services.";
    }

    // Social media
    if (lowerMsg.match(/social media|facebook|instagram|youtube|twitter|follow/)) {
      return "Stay connected with us! Check our Contact page for links to our social media channels where we share updates, sermons, and inspiration.";
    }

    // Parking
    if (lowerMsg.match(/park|parking/)) {
      return "Parking is available at our location in Busia Town. Our team will be happy to guide you when you arrive for Sunday service (9 AM - 12 PM).";
    }

    // Dress code
    if (lowerMsg.match(/dress|wear|what to wear|attire|clothing/)) {
      return "Come as you are! We welcome everyone regardless of attire. Most people dress casually or in business casual, but the most important thing is that you're here! 😊";
    }

    // Sermons/Messages
    if (lowerMsg.match(/sermon|message|teaching|pastor|preaching/)) {
      return "You can find our sermons and teachings in the Content section. Click 'CONTENT' in the menu to access resources and messages that will inspire and encourage you!";
    }

    // Greeting responses
    if (lowerMsg.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/)) {
      return "Hello! Welcome to House of Transformation. I'm here to help you find information about our church, service times, location, and more. What can I help you with today?";
    }

    // Thanks
    if (lowerMsg.match(/thank|thanks|appreciate/)) {
      return "You're very welcome!If you have any other questions about House of Transformation, feel free to ask. God bless you!";
    }

    // Help/What can you do
    if (lowerMsg.match(/help|what can you|how can you|what do you/)) {
      return "I can help you with:\n• Service times and location\n• Navigating our website\n• Contact information\n• Volunteering opportunities\n• Kids programs\n• How to give/donate\n• Portal access\n• And much more!\n\nJust ask me anything! 😊";
    }

    // Default response with specific suggestions
    return "I'd be happy to help you! I can tell you about:\n• Our Sunday service times (9 AM - 12 PM)\n• How to find us in Busia Town\n• Volunteering opportunities\n• Kids programs\n• How to contact us\n• Navigating our website\n\nWhat would you like to know?";
  }
};
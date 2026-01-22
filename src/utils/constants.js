export const CHURCH_INFO = {
  name: 'House of Transformation',
  location: 'Busia County, Kenya',
  address: 'Main Street, Busia Town, Busia County, Kenya',
  phone: '+254 700 000 000',
  email: 'info@houseoftransformation.or.ke',
  coordinates: {
    lat: 0.46012,
    lng: 34.11225
  }
};

export const SERVICE_TIMES = {
  sunday: {
    day: 'Sunday',
    time: '9:00 AM - 12:00 PM',
    service: 'Main Worship Service'
  },
  wednesday: {
    day: 'Wednesday',
    time: '6:30 PM - 8:00 PM',
    service: 'Bible Study'
  },
  friday: {
    day: 'Friday',
    time: '7:00 PM - 9:00 PM',
    service: 'Prayer Meeting'
  }
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/houseoftransformation',
  youtube: 'https://youtube.com/@houseoftransformation',
  instagram: 'https://instagram.com/houseoftransformation',
  twitter: 'https://twitter.com/hot_busia'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh'
  },
  SERMONS: {
    LIST: '/sermons',
    GET: (id) => `/sermons/${id}`,
    CREATE: '/sermons',
    UPDATE: (id) => `/sermons/${id}`,
    DELETE: (id) => `/sermons/${id}`
  },
  BLOG: {
    LIST: '/blog',
    GET: (id) => `/blog/${id}`,
    CREATE: '/blog',
    UPDATE: (id) => `/blog/${id}`,
    DELETE: (id) => `/blog/${id}`
  },
  EVENTS: {
    LIST: '/events',
    GET: (id) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id) => `/events/${id}`,
    DELETE: (id) => `/events/${id}`,
    REGISTER: (id) => `/events/${id}/register`
  },
  GALLERY: {
    LIST: '/gallery',
    UPLOAD: '/gallery',
    DELETE: (id) => `/gallery/${id}`,
    LIKE: (id) => `/gallery/${id}/like`
  },
  VOLUNTEERS: {
    OPPORTUNITIES: '/volunteers/opportunities',
    CHECK_APPLICATION: '/volunteers/check-application',
    APPLY: '/volunteers/apply',
    EDIT_APPLICATION: (id) => `/volunteers/${id}/edit`,
    PROFILE: '/volunteers/profile',
    MY_APPLICATIONS: '/volunteers/my-applications',
    ALL_APPLICATIONS: '/volunteers/applications',
    UPDATE_STATUS: (id) => `/volunteers/${id}`,
    UPDATE_HOURS: (id) => `/volunteers/${id}/hours`,
    DELETE: (id) => `/volunteers/${id}`,
    STATS: '/volunteers/stats'
  },
  DONATIONS: {
    INITIATE: '/donations/initiate',
    VERIFY: '/donations/verify',
    HISTORY: '/donations/history'
  },
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    TRACK: '/analytics/track'
  },
  CONTACT: {
    SEND: '/contact/send',
    SUBSCRIBE: '/contact/subscribe'
  }
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  VOLUNTEER: 'volunteer',
  GUEST: 'guest'
};

export const BLOG_CATEGORIES = [
  'All',
  'News',
  'Events',
  'Outreach',
  'Teaching',
  'Testimonies'
];

export const GALLERY_CATEGORIES = [
  'All',
  'Worship Services',
  'Youth Events',
  'Community Outreach',
  'Special Events',
  'Kids Ministry'
];

// utils/constants.js - Chatbot Responses

export const CHATBOT_RESPONSES = {
  // Core Information
  SERVICE_TIMES: "Our Sunday services are from 9:00 AM to 12:00 PM. We'd love to see you there! You can find more details on our Home page.",
  
  LOCATION: "We are located in Busia Town, Busia County, Kenya. You can find our exact location on the map in the Contact section of our website!",
  
  CONTACT: "You can reach us at info@houseoftransformation.or.ke or call +254 700 000 000. Visit our Contact page in the menu for more ways to connect with us!",

  // Engagement
  DONATION: "Thank you for your generosity! You can give through our Portal page. Click on 'PORTAL' in the menu above to access giving options. Your support helps transform lives!",
  
  PRAYER: "We believe in the power of prayer! You can submit a prayer request through our website or share it with our pastoral team. Visit the Contact page or call us at +254 700 000 000.",
  
  VOLUNTEER: "We're excited you want to serve! Check out our Volunteer page in the menu to see opportunities. You can also contact us at info@houseoftransformation.or.ke to learn more about serving in various ministries.",

  // Programs
  KIDS: "We have programs for children and youth! Check the Content section in the menu for information about our kids' ministries. Our Sunday services (9 AM - 12 PM) include children's programs.",
  
  EVENTS: "We have exciting events throughout the year! Check the Content section in the menu or visit our website regularly for updates on upcoming programs and special services.",
  
  MINISTRIES: "We have various ministries to help you grow spiritually! Visit the Content section in the menu to explore our ministries, or click 'Ministries' below to learn more.",

  // New Visitors
  NEW_MEMBERS: "Welcome to House of Transformation! 🎉 We meet Sundays from 9 AM - 12 PM in Busia Town. For your first visit, just come as you are! Learn more about us in the About section of our website.",
  
  ABOUT: "House of Transformation exists to transform lives through the anointed gospel of Jesus Christ. We're a community built on love and power. Click 'ABOUT' in the menu to learn more about our mission and vision!",

  // Spiritual Growth
  BAPTISM: "Baptism is an important step of faith! Contact our pastoral team at info@houseoftransformation.or.ke or call +254 700 000 000 to learn about baptism classes and upcoming baptism services.",
  
  BIBLE_STUDY: "We offer Bible study opportunities to help you grow in God's Word. Check the Content section or contact us to join a study group that fits your schedule!",
  
  WORSHIP: "We have a vibrant worship ministry! If you're interested in joining the worship team, contact us at info@houseoftransformation.or.ke.",

  // Technical/Website Help
  PORTAL: "To access the member portal, click on 'PORTAL' in the menu at the top of the page. If you're a new member and need login credentials, please contact us at info@houseoftransformation.or.ke.",
  
  NAVIGATION: "I can help you navigate! Use the menu at the top: HOME, ABOUT (our mission), CONTENT (ministries/resources), VOLUNTEER, PORTAL (member login), CONTACT (location/info), and FEEDBACK. What are you looking for?",
  
  FEEDBACK_PAGE: "We value your feedback! Click on 'FEEDBACK' in the menu to share your thoughts, suggestions, or testimonies with us. Your input helps us serve better!",

  // Practical Information
  PARKING: "Parking is available at our location in Busia Town. Our team will be happy to guide you when you arrive for Sunday service (9 AM - 12 PM).",
  
  DRESS_CODE: "Come as you are! We welcome everyone regardless of attire. Most people dress casually or in business casual, but the most important thing is that you're here! 😊",

  // Default
  DEFAULT: "I'd be happy to help you! I can tell you about:\n• Our Sunday service times (9 AM - 12 PM)\n• How to find us in Busia Town\n• Volunteering opportunities\n• Kids programs\n• How to contact us\n• Navigating our website\n\nWhat would you like to know?"
};

export const SEO_META = {
  title: 'House of Transformation Church - Busia County, Kenya | Live Worship & Community',
  description: 'Join House of Transformation Church in Busia County, Kenya. Experience transforming worship, powerful sermons, and a loving community. Live streaming available.',
  keywords: 'church, Busia, Kenya, worship, sermons, community, live stream, Christian, transformation',
  ogImage: '/images/og-image.jpg'
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERMONS: '/sermons',
  BLOG: '/blog',
  GALLERY: '/gallery',
  KIDS_ZONE: '/kids-zone',
  VOLUNTEER: '/volunteer',
  EVENTS: '/events',
  MINISTRIES: '/ministries',
  CONTACT: '/contact',
  ADMIN: '/admin',
  LOGIN: '/login'
};
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

export const CHATBOT_RESPONSES = {
  SERVICE_TIMES: 'Our Sunday service is at 9:00 AM - 12:00 PM. Wednesday service at 6:30 PM. Friday prayer meeting at 7:00 PM. Would you like directions?',
  LOCATION: 'We are located in Busia Town, Busia County, Kenya. You can find us on the map in the Contact section!',
  DONATION: 'Thank you for your generosity! You can give through M-Pesa, bank transfer, or online. Visit our Donate section for details.',
  PRAYER: 'We would love to pray with you! Please fill out our prayer request form or speak with our pastoral team after service.',
  VOLUNTEER: 'That\'s wonderful! Check out our Volunteer Portal to see current opportunities. We have positions in worship, children\'s ministry, and more!',
  KIDS: 'We have a vibrant Kids Ministry! Visit our Kids Zone for activities, stories, and games. Sunday school is during the main service.',
  DEFAULT: 'Thanks for your message! For more specific help, you can contact us at info@houseoftransformation.or.ke or call +254 700 000 000.'
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
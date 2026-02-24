const imageUrls = [
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771917081/church-gallery/rna86cxayr531yeguolr.jpg', // Image 0
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771839996/church-gallery/h9awmwomo2qacuorldvr.jpg', // Image 1
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg', // Image 2
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771844795/church-gallery/orvi32ziq3phcnppqswu.jpg',
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771872140/church-gallery/w1fsxgatgfshyod4tbct.jpg',
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771917027/church-gallery/pjggqzslpzey7zxy1uhf.webp',
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1771917035/church-gallery/apw4ujv4nxunfqcnizok.jpg'
];

export const serviceAreasData = [
  {
    id: 1,
    slug: 'worship-team',
    name: 'Worship Team',
    description: 'Lead our congregation in passionate worship through music, dance, and instrumental performances',
    imageUrl: imageUrls[0],
    teamCount: 28,
    timeCommitment: '4 hours/week',
    teamLead: 'Grace Mwangi',
    email: 'grace.mwangi@hotmail.com',
    phone: '+254 712 345 678',
    responsibilities: [
      'Lead Sunday and Wednesday services in worship',
      'Prepare and arrange worship songs',
      'Mentor newer team members',
      'Attend weekly rehearsals and planning meetings',
      'Lead special worship events and conferences',
      'Minister through music, dance, and instruments'
    ],
    requirements: [
      'Must be a committed believer with passion for worship',
      'Musical ability or willingness to learn',
      'Available for weekly rehearsals',
      'Able to commit to at least 4 hours weekly',
      'Willing to grow spiritually and technically',
      'Team player with good communication skills'
    ],
    schedule: [
      'Weekly rehearsals: Tuesday & Thursday 7:00 PM - 8:30 PM',
      'Sunday services: 9:00 AM setup',
      'Wednesday evening service: 6:00 PM'
    ],
    testimonials: [
      { name: 'David Kipchoge', role: 'Lead Guitarist', quote: 'Serving in the worship team has deepened my relationship with God.' },
      { name: 'Amara Okeyo', role: 'Lead Singer', quote: 'This team has become my spiritual family.' },
      { name: 'Joseph Kariuki', role: 'Drummer', quote: 'The discipline and joy of worship ministry have transformed my Christian walk.' },
      { name: 'Naomi Muema', role: 'Dancer', quote: 'Expressing worship through dance is liberating.' }
    ],
    galleryImages: [imageUrls[0], imageUrls[1], imageUrls[2]]
  },
  {
    id: 2,
    slug: 'childrens-ministry',
    name: 'Children\'s Ministry',
    description: 'Nurture and teach the next generation of believers with fun, engaging, and spiritually enriching activities',
    imageUrl: imageUrls[4],
    teamCount: 15,
    timeCommitment: '3 hours/week',
    teamLead: 'Sister Priscilla Kiplagat',
    email: 'priscilla.kiplagat@gmail.com',
    phone: '+254 723 456 789',
    responsibilities: [
      'Lead children in worship and prayer',
      'Teach Bible stories and lessons',
      'Organize and facilitate children\'s activities and games',
      'Ensure safe and welcoming environment',
      'Prepare lesson materials and resources',
      'Mentor children in their faith journey'
    ],
    requirements: [
      'Love for children and patience',
      'Basic understanding of Bible stories',
      'Able to commit 3 hours weekly',
      'First Aid/CPR certification preferred',
      'Background check clearance',
      'Creative and enthusiastic about engaging kids'
    ],
    schedule: [
      'Sunday services: 9:00 AM - 11:00 AM',
      'Wednesday evening: 6:00 PM - 7:00 PM',
      'Monthly planning meetings: 2nd Saturday 2:00 PM'
    ],
    testimonials: [
      { name: 'Mary Wanjiru', role: 'Craft & Activity Coordinator', quote: 'Seeing the children\'s faces light up is truly a blessing.' },
      { name: 'Peter Muthui', role: 'Children\'s Pastor Assistant', quote: 'Investing in children\'s lives is investing in our future.' },
      { name: 'Faith Ochieng', role: 'Teacher', quote: 'This ministry has given me purpose.' },
      { name: 'Ruth Kamau', role: 'Music & Worship Leader', quote: 'Working with children is magical.' }
    ],
    galleryImages: [imageUrls[1], imageUrls[0], imageUrls[2]]
  },
  {
    id: 3,
    slug: 'ushering-team',
    name: 'Ushering Team',
    description: 'Welcome guests with warmth and create a welcoming atmosphere during services and events',
    imageUrl: imageUrls[3],
    teamCount: 22,
    timeCommitment: '2-3 hours/week',
    teamLead: 'Samuel Otunga',
    email: 'samuel.otunga@gmail.com',
    phone: '+254 734 567 890',
    responsibilities: [
      'Welcome and greet visitors at the entrance',
      'Distribute programs and assist with seating',
      'Offer refreshments before and after services',
      'Assist during special events and conferences',
      'Ensure facilities are clean and welcoming',
      'Build relationships with first-time visitors'
    ],
    requirements: [
      'Warm, welcoming personality',
      'Able to stand for 2-3 hours',
      'Good communication skills',
      'Commitment to attending regular training',
      'Flexible scheduling for events',
      'Heart for making people feel valued'
    ],
    schedule: [
      'Sunday services: 8:30 AM - 11:30 AM',
      'Wednesday evening: 5:30 PM - 7:30 PM',
      'Special events: As scheduled'
    ],
    testimonials: [
      { name: 'Martha Ochieng', role: 'Welcome Coordinator', quote: 'Making people feel at home is our mission.' },
      { name: 'Thomas Kipchoge', role: 'Refreshments Manager', quote: 'Hospitality is ministry!' },
      { name: 'Esther Kemboi', role: 'Event Assistant', quote: 'True servant leadership.' },
      { name: 'Paul Kariuki', role: 'Facilities Coordinator', quote: 'I take pride in preparing our sanctuary.' }
    ],
    galleryImages: [imageUrls[2], imageUrls[1], imageUrls[0]]
  },
  {
    id: 4,
    slug: 'technical-team',
    name: 'Technical Team',
    description: 'Manage sound systems, lighting, streaming, and audio-visual equipment during services',
    imageUrl: imageUrls[0],
    teamCount: 12,
    timeCommitment: '4 hours/week',
    teamLead: 'Engineer Charles Mwebi',
    email: 'charles.mwebi@gmail.com',
    phone: '+254 745 678 901',
    responsibilities: [
      'Operate sound and lighting equipment',
      'Manage live streaming and recording',
      'Test and maintain all technical equipment',
      'Troubleshoot technical issues during services',
      'Set up for special events and conferences',
      'Train new team members on equipment'
    ],
    requirements: [
      'Basic technical knowledge or willingness to learn',
      'Attention to detail and problem-solving skills',
      'Reliable and punctual',
      'Ability to remain calm under pressure',
      'Available 4 hours weekly',
      'Able to work before and during services'
    ],
    schedule: [
      'Sunday: Setup 7:30 AM, Service 9:00 AM',
      'Wednesday: Setup 5:30 PM, Service 6:00 PM',
      'Monthly training: 3rd Saturday 10:00 AM'
    ],
    testimonials: [
      { name: 'Isaac Koech', role: 'Sound Engineer', quote: 'Creating the perfect technical environment is fulfilling.' },
      { name: 'Angela Mwangi', role: 'Lighting Technician', quote: 'The technical team is crucial to worship.' },
      { name: 'Daniel Kariuki', role: 'Streaming Coordinator', quote: 'Knowing we reach people online is meaningful.' },
      { name: 'Rose Kipchoge', role: 'Equipment Manager', quote: 'Every detail matters.' }
    ],
    galleryImages: [imageUrls[0], imageUrls[2], imageUrls[1]]
  },
  {
    id: 5,
    slug: 'community-outreach',
    name: 'Community Outreach',
    description: 'Extend God\'s love through community service, evangelism, and local/global mission work',
    imageUrl: imageUrls[6],
    teamCount: 18,
    timeCommitment: 'Flexible',
    teamLead: 'Pastor David Kipchoge',
    email: 'david.kipchoge@gmail.com',
    phone: '+254 756 789 012',
    responsibilities: [
      'Plan and execute community outreach programs',
      'Visit and minister to the needy and sick',
      'Evangelize and share the Gospel',
      'Support missions and church planting',
      'Organize community service projects',
      'Build relationships with local community leaders'
    ],
    requirements: [
      'Burden for lost souls and community transformation',
      'Willingness to give time and resources',
      'Good communication and people skills',
      'Flexible schedule for various events',
      'Physically able to serve in the community',
      'Commitment to ongoing prayer and intercession'
    ],
    schedule: [
      'Monthly community outreach: 2nd Saturday 9:00 AM',
      'Wednesday evening visits: 6:30 PM',
      'Mission trips: Quarterly as scheduled',
      'Prayer meetings: Monthly'
    ],
    testimonials: [
      { name: 'Bishop Joseph Kariuki', role: 'Outreach Director', quote: 'Seeing lives transformed through Christ is why we serve.' },
      { name: 'Helen Ochieng', role: 'Community Care Coordinator', quote: 'True servant leadership.' },
      { name: 'Moses Kiplagat', role: 'Evangelism Lead', quote: 'Greatest privilege of my life.' },
      { name: 'Mercy Mwangi', role: 'Missions Coordinator', quote: 'God\'s heart for the world.' }
    ],
    galleryImages: [imageUrls[1], imageUrls[2], imageUrls[0]]
  },
  {
    id: 6,
    slug: 'prayer-ministry',
    name: 'Prayer Ministry',
    description: 'Intercede for our congregation, community, and world through dedicated prayer and spiritual warfare',
    imageUrl: imageUrls[5],
    teamCount: 24,
    timeCommitment: 'Flexible',
    teamLead: 'Prophetess Mary Wanjiru',
    email: 'mary.wanjiru@gmail.com',
    phone: '+254 767 890 123',
    responsibilities: [
      'Participate in prayer meetings and vigils',
      'Intercede for church leadership and members',
      'Pray for community and national issues',
      'Support missionaries and outreach efforts',
      'Lead prayer groups and circles',
      'Maintain prayer request lists and follow-ups'
    ],
    requirements: [
      'Deep commitment to prayer and fasting',
      'Understanding of spiritual warfare',
      'Regular Bible study and meditation',
      'Confidentiality and discernment',
      'Flexible schedule for prayer events',
      'Passion for seeing God\'s kingdom come'
    ],
    schedule: [
      'Wednesday prayer meeting: 5:30 PM - 6:30 PM',
      'Saturday prayer vigil: 11:00 PM - 1:00 AM',
      'Monthly prayer breakfast: 1st Sunday 7:00 AM',
      'Daily personal intercession recommended'
    ],
    testimonials: [
      { name: 'Ruth Kipchoge', role: 'Prayer Intercessor', quote: 'Most powerful weapon we have.' },
      { name: 'Jonathan Otunga', role: 'Prayer Group Leader', quote: 'Sacred privilege.' },
      { name: 'Grace Kiplagat', role: 'Prayer Coordinator', quote: 'God hears and answers prayer.' },
      { name: 'Samuel Kariuki', role: 'Night Prayer Leader', quote: 'Transforms our spiritual lives.' }
    ],
    galleryImages: [imageUrls[2], imageUrls[0], imageUrls[1]]
  },
  {
    id: 7,
    slug: 'youth-ministry',
    name: 'Youth Ministry',
    description: 'Guide and mentor young people in their faith journey with relevant, engaging programs',
    imageUrl: imageUrls[0],
    teamCount: 16,
    timeCommitment: '3-4 hours/week',
    teamLead: 'Pastor Aaron Kipchoge',
    email: 'aaron.kipchoge@gmail.com',
    phone: '+254 778 901 234',
    responsibilities: [
      'Plan and lead youth meetings and activities',
      'Mentor young people in spiritual growth',
      'Organize youth camps and retreats',
      'Lead Bible studies and discipleship programs',
      'Build supportive community among youth',
      'Equip youth for leadership roles'
    ],
    requirements: [
      'Genuine passion for young people',
      'Able to connect with youth culture',
      'Sound biblical foundation',
      'Willing to commit 3-4 hours weekly',
      'Patient, encouraging mentoring style',
      'Available for overnight events and trips'
    ],
    schedule: [
      'Friday youth nights: 7:00 PM - 9:00 PM',
      'Sunday youth service: 11:30 AM - 12:30 PM',
      'Monthly leadership meetings: 1st Tuesday 6:00 PM',
      'Quarterly camps and retreats'
    ],
    testimonials: [
      { name: 'Faith Mwangi', role: 'Youth Leader', quote: 'Most rewarding experience.' },
      { name: 'Steven Kiplagat', role: 'Youth Coordinator', quote: 'Safe space for young people.' },
      { name: 'Naomi Ochieng', role: 'Bible Study Leader', quote: 'Deepened my own faith.' },
      { name: 'Benjamin Kariuki', role: 'Activities Coordinator', quote: 'Life-changing.' }
    ],
    galleryImages: [imageUrls[0], imageUrls[1], imageUrls[2]]
  },
  {
    id: 8,
    slug: 'counseling-care',
    name: 'Counseling & Care',
    description: 'Provide spiritual guidance, pastoral care, and support to members in times of need',
    imageUrl: imageUrls[1],
    teamCount: 10,
    timeCommitment: 'As needed',
    teamLead: 'Pastor Grace Ochieng',
    email: 'grace.ochieng@gmail.com',
    phone: '+254 789 012 345',
    responsibilities: [
      'Provide pastoral counseling and spiritual guidance',
      'Visit the sick and hospitalized members',
      'Support families during grief and loss',
      'Offer prayer and intercession for struggling members',
      'Connect members with appropriate resources',
      'Document care encounters and follow-ups'
    ],
    requirements: [
      'Strong compassion and listening skills',
      'Understanding of basic counseling principles',
      'Confidentiality and integrity',
      'Flexibility to respond to urgent needs',
      'Sound biblical foundation',
      'Ability to work with church leadership'
    ],
    schedule: [
      'Hospital visits: As needed (flexible)',
      'Home visitation: Weekly or as requested',
      'Crisis response: 24/7 emergency availability',
      'Monthly team meetings: 2nd Thursday 4:00 PM'
    ],
    testimonials: [
      { name: 'Margaret Kipchoge', role: 'Pastoral Care Counselor', quote: 'Sacred privilege.' },
      { name: 'Pastor John Kariuki', role: 'Grief Support Coordinator', quote: 'Powerful ministry.' },
      { name: 'Elizabeth Mwangi', role: 'Hospital Visitor', quote: 'Love becomes tangible.' },
      { name: 'David Kiplagat', role: 'Crisis Response Team', quote: 'Church truly cares.' }
    ],
    galleryImages: [imageUrls[1], imageUrls[2], imageUrls[0]]
  },
  {
    id: 9,
    slug: 'finance-administration',
    name: 'Finance & Administration',
    description: 'Manage resources and organizational operations to ensure smooth church functioning',
    imageUrl: imageUrls[2],
    teamCount: 8,
    timeCommitment: '4-5 hours/week',
    teamLead: 'Mr. Peter Mwangi',
    email: 'peter.mwangi@gmail.com',
    phone: '+254 790 123 456',
    responsibilities: [
      'Manage church finances and budgets',
      'Process donations and maintain records',
      'Prepare financial reports and statements',
      'Administer staff payroll and benefits',
      'Manage church databases and records',
      'Coordinate administrative operations'
    ],
    requirements: [
      'Excellent organizational and math skills',
      'Proficiency with accounting software',
      'Strong integrity and trustworthiness',
      'Attention to detail',
      'Basic knowledge of accounting principles',
      'Commitment to 4-5 hours weekly'
    ],
    schedule: [
      'Regular office hours: Monday - Friday 9:00 AM - 1:00 PM',
      'Monthly accounting: 1st and 15th of month',
      'Quarterly reporting: End of each quarter',
      'Administrative meetings: 2nd Wednesday 3:00 PM'
    ],
    testimonials: [
      { name: 'Catherine Kipchoge', role: 'Treasurer', quote: 'Sacred responsibility.' },
      { name: 'James Kariuki', role: 'Database Administrator', quote: 'Function efficiently.' },
      { name: 'Rose Ochieng', role: 'Office Manager', quote: 'Great impact.' },
      { name: 'Michael Kiplagat', role: 'Financial Analyst', quote: 'All work can be ministry.' }
    ],
    galleryImages: [imageUrls[2], imageUrls[1], imageUrls[0]]
  }
];
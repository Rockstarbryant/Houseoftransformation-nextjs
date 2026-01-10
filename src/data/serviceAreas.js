const imageUrls = [
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg', // Image 1
  'https://pbs.twimg.com/profile_images/700352011582251008/wrxEHL3q.jpg', // Image 2
  'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg' // Image 3
];

export const serviceAreasData = [
  {
    name: 'Worship Team',
    description: 'Lead our congregation in passionate worship through music, dance, and instrumental performances',
    imageUrl: imageUrls[0], // Image 1
    teamCount: 28,
    timeCommitment: '4 hours/week'
  },
  {
    name: 'Children\'s Ministry',
    description: 'Nurture and teach the next generation of believers with fun, engaging, and spiritually enriching activities',
    imageUrl: imageUrls[1], // Image 2
    teamCount: 15,
    timeCommitment: '3 hours/week'
  },
  {
    name: 'Ushering Team',
    description: 'Welcome guests with warmth and create a welcoming atmosphere during services and events',
    imageUrl: imageUrls[2], // Image 3
    teamCount: 22,
    timeCommitment: '2-3 hours/week'
  },
  {
    name: 'Technical Team',
    description: 'Manage sound systems, lighting, streaming, and audio-visual equipment during services',
    imageUrl: imageUrls[0], // Image 1 (repeats)
    teamCount: 12,
    timeCommitment: '4 hours/week'
  },
  {
    name: 'Community Outreach',
    description: 'Extend God\'s love through community service, evangelism, and local/global mission work',
    imageUrl: imageUrls[1], // Image 2 (repeats)
    teamCount: 18,
    timeCommitment: 'Flexible'
  },
  {
    name: 'Prayer Ministry',
    description: 'Intercede for our congregation, community, and world through dedicated prayer and spiritual warfare',
    imageUrl: imageUrls[2], // Image 3 (repeats)
    teamCount: 24,
    timeCommitment: 'Flexible'
  },
  {
    name: 'Youth Ministry',
    description: 'Guide and mentor young people in their faith journey with relevant, engaging programs',
    imageUrl: imageUrls[0], // Image 1 (repeats)
    teamCount: 16,
    timeCommitment: '3-4 hours/week'
  },
  {
    name: 'Counseling & Care',
    description: 'Provide spiritual guidance, pastoral care, and support to members in times of need',
    imageUrl: imageUrls[1], // Image 2 (repeats)
    teamCount: 10,
    timeCommitment: 'As needed'
  },
  {
    name: 'Finance & Administration',
    description: 'Manage resources and organizational operations to ensure smooth church functioning',
    imageUrl: imageUrls[2], // Image 3 (repeats)
    teamCount: 8,
    timeCommitment: '4-5 hours/week'
  }
];
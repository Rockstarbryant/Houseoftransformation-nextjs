'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';
import Card from '../common/Card';

const churchImages = [
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767444965/WhatsApp_Image_2026-01-03_at_15.54.45_mpogon.jpg',
    alt: 'Powerful worship service at House of Transformation'
  },
  {
    url: 'https://pbs.twimg.com/profile_images/700352011582251008/wrxEHL3q.jpg',
    alt: 'Church community gathering'
  },
  {
    url: 'https://res.cloudinary.com/dcu8uuzrs/image/upload/v1767445662/copy_of_ot_ibz2xp_6e0397.jpg',
    alt: 'Fellowship and celebration'
  }
];

const AboutSection = ({ preview = false }) => {
  if (preview) {
    // This is the version shown on the Homepage (short preview with Read More button)
    return (
      <section className="py-20 bg-white-50">
        <div className="max-w-full mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl bg-red-900 font-bold text-slate-900 mb-4">About H.O.T</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Touching & transforming lives through the anointed gospel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <h3 className="text-3xl font-bold text-red-900">Welcome to House of Transformation (H.O.T)</h3>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify">
                House of Transformation Ministries (H.O.T) is a vibrant community in Busia County, Kenya, where the transformative Gospel of the Kingdom of God is preached with power, and lives are genuinely changed spiritually, physically, and communally.
              </p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify">
                As a ministry extending from our roots in Nairobi, we are committed to creating a welcoming space for worship, fellowship, healing, and growth for people from all walks of life.
              </p>
              <div className="mt-12"> </div>
              <Link href="/about">
                <Button variant="secondary" size="sm">
                  Learn More About Us
                </Button>
              </Link>
            </div>

            <div className="order-1 md:order-2 relative h-96 md:h-full">
              <img
                src={churchImages[0].url}
                alt={churchImages[0].alt}
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Full About Page version
  return (
    <div className="py-20 bg-slate-300">
      <div className="max-w-7xl mx-auto px-4 space-y-32">

        {/* Hero Introduction */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6">
            House of Transformation
            <br />
            <span className="text-orange-600">H.O.T</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto">
            Touching & transforming lives through the anointed gospel.
          </p>
        </div>

        {/* Welcome Section - Image Right */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-900">Welcome to H.O.T</h2>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
              House of Transformation Ministries (H.O.T) is a dynamic community located in Busia County, Kenya. We are a ministry outreach with deep roots in Nairobi, dedicated to preaching the powerful Gospel of the Kingdom of God and seeing real transformation in people's lives.
            </p>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
              Founded on faith, hope, and love, we create a welcoming environment where everyone – whether a longtime believer or someone new to faith – can encounter God, experience healing, and grow spiritually. Our Busia Main Campus is a beacon of hope, fostering vibrant worship, deep fellowship, and active service.
            </p>
          </div>
          <div className="relative h-96 lg:h-[520px]">
            <img
              src={churchImages[0].url}
              alt={churchImages[0].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Mission Section - Image Left */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 lg:h-[520px] order-2 md:order-1">
            <img
              src={churchImages[1].url}
              alt={churchImages[1].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-4xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
              To transform the lives of God's people for spiritual and physical prosperity by preaching the Kingdom of God and those things which concern the Lord Jesus Christ (Acts 28:31).
            </p>
          </div>
        </div>

        {/* Vision Section - Image Right */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
              To see the church flourishing and holistically transforming people's lives through the anointed Gospel globally (Matthew 28:19-20).
            </p>
          </div>
          <div className="relative h-96 lg:h-[520px]">
            <img
              src={churchImages[2].url}
              alt={churchImages[2].alt}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Beliefs Section */}
        <div className="bg-gray-50 py-16 rounded-3xl px-8 md:px-16">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">Our Beliefs</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <ul className="space-y-6 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4">•</span>
                The Bible as the inspired, infallible Word of God
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4">•</span>
                One God in three persons: Father, Son, and Holy Spirit
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4">•</span>
                Salvation by grace through faith in Jesus Christ
              </li>
            </ul>
            <ul className="space-y-6 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4">•</span>
                The transformative power of the Kingdom Gospel (Acts 28:31)
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4">•</span>
                The importance of community, fellowship, and good works (Hebrews 10:25)
              </li>
            </ul>
          </div>
        </div>

        {/* History Section - Timeline Style for Engagement */}
        <div className="space-y-12">
          <h2 className="text-4xl font-bold text-slate-900 text-center">Our History</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">From humble beginnings in Nairobi to a thriving presence in Busia and beyond, discover the journey of transformation that defines us.</p>
          
          {/* General HOT History - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative h-80 lg:h-96 order-2 md:order-1">
              <img
                src={churchImages[0].url}
                alt="Early days of House of Transformation"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold">1989</div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h3 className="text-3xl font-bold text-slate-900">The Birth of H.O.T in Nairobi</h3>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                Founded around 1989 as Nairobi Gospel Assembly Church, House of Transformation Ministries began as a place of vibrant worship and community outreach in Nairobi, Kenya. Over the years, it grew into a powerful ministry focused on spiritual renewal and holistic change.
              </p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                Under visionary leadership, the church rebranded to House of Transformation (H.O.T.) to emphasize its mission of preaching the Kingdom Gospel and transforming lives across all spheres. Celebrating over 36 years of ministry, we've witnessed countless stories of faith, healing, and growth.
              </p>
            </div>
          </div>

          {/* Busia History - Image Right */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-slate-900">Expansion to Busia: A Beacon in the West</h3>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                As the ministry expanded beyond Nairobi, the Busia Main Campus was established as a key outreach in western Kenya. This branch addresses the unique needs of Busia County's diverse communities, including the Luhya and Iteso people, amid challenges like cross-border trade and local development.
              </p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                Though exact founding details are rooted in the church's growth phase post-rebranding, Busia has become a thriving hub for powerful services, youth empowerment, and community transformation. It's a testament to our commitment to spreading the Gospel nationwide.
              </p>
            </div>
            <div className="relative h-80 lg:h-96">
              <img
                src={churchImages[1].url}
                alt="Busia Campus community"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold">Recent Expansion</div>
            </div>
          </div>
        </div>

        {/* Leadership Section - Card Grid for Profiles */}
        <div className="space-y-12">
          <h2 className="text-4xl font-bold text-slate-900 text-center">Our Leadership & Team</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">Guided by passionate servant-leaders who embody our vision of transformation.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center space-y-4">
              <img
                src={churchImages[2].url} // Placeholder; replace with actual leader photo if available
                alt="Apostle Aloys A. Rutivi"
                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
              />
              <h3 className="text-2xl font-bold text-slate-900">Apostle Aloys A. Rutivi</h3>
              <p className="text-gray-600">Founding Pastor & Visionary Leader</p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                Instrumental in shaping H.O.T.'s direction with a focus on mentorship, discipleship, and Kingdom principles.
              </p>
            </Card>
            
            <Card className="text-center space-y-4">
              <img
                src={churchImages[0].url} // Placeholder
                alt="Lavern Rutivi"
                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
              />
              <h3 className="text-2xl font-bold text-slate-900">Lavern Rutivi</h3>
              <p className="text-gray-600">Worship & Outreach Coordinator</p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                Leads dynamic worship experiences and community initiatives, inspiring transformation through music and service.
              </p>
            </Card>
            
            <Card className="text-center space-y-4">
              <img
                src={churchImages[1].url} // Placeholder
                alt="Team Members"
                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
              />
              <h3 className="text-2xl font-bold text-slate-900">Our Dedicated Team</h3>
              <p className="text-gray-600">Pastors, Volunteers & Departments</p>
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
                From worship to youth and administration, our team works unitedly to fulfill our mission across Nairobi and Busia.
              </p>
            </Card>
          </div>
        </div>

        {/* Community Impact Section - List with Icons & Image */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-900">Community Impact & Outreach</h2>
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify font-semibold">
              At H.O.T., transformation extends beyond our walls. We're committed to serving Busia, Nairobi, and beyond through practical actions that address real needs.
            </p>
            <ul className="space-y-6 text-lg text-gray-700 text-justify">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4 text-2xl">✓</span>
                <div>
                  <strong>Youth & Children's Programs:</strong> Empowering the next generation with education, mentorship, and faith-based activities.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4 text-2xl">✓</span>
                <div>
                  <strong>Health & Wellness Initiatives:</strong> Offering prayer, community health drives, and support for physical and emotional healing.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4 text-2xl">✓</span>
                <div>
                  <strong>Missions & Global Outreach:</strong> Extending to regions like Mombasa, Kampala (Uganda), and more through conferences, trips, and partnerships.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-4 text-2xl">✓</span>
                <div>
                  <strong>Social Media Engagement:</strong> Daily inspiration via Facebook (@HOTMinistriesKe), Instagram, YouTube, and more.
                </div>
              </li>
            </ul>
          </div>
          <div className="relative h-96 lg:h-[520px]">
            <img
              src={churchImages[2].url}
              alt="Community outreach event"
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Services & Join Us */}
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-slate-900">Join Us</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Sunday Services: 9:00 AM • 11:00 AM • 1:00 PM<br />
            Busia Main Campus, Busia County, Kenya
          </p>
          <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap font-light text-justify max-w-full mx-auto font-semibold">
            Whether you're in Busia, Nairobi, or watching online, we welcome you with open arms. Come experience the power of transformed lives!
          </p>
          <Button variant="secondary" size="lg">
            Watch Live Service
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AboutSection;
import { FiCheckCircle, FiUsers, FiTarget, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

const About = () => {
  const team = [
    {
      name: 'David Kamau',
      role: 'Founder & CEO',
      bio: 'Photographer with 10+ years experience in the Kenyan creative industry.',
      image: null
    },
    {
      name: 'Sarah Mwangi',
      role: 'Head of Community',
      bio: 'Former event planner passionate about connecting creatives with opportunities.',
      image: null
    },
    {
      name: 'James Omondi',
      role: 'Tech Lead',
      bio: 'Full-stack developer dedicated to building platforms that empower creatives.',
      image: null
    }
  ]

  const values = [
    {
      icon: FiCheckCircle,
      title: 'Quality Over Quantity',
      description: 'We manually verify every creative to ensure you work with professionals who deliver exceptional results.'
    },
    {
      icon: FiUsers,
      title: 'Community First',
      description: 'We build features based on feedback from our community of creatives and clients.'
    },
    {
      icon: FiTarget,
      title: 'Transparency',
      description: 'Clear pricing, honest reviews, and open communication between creatives and clients.'
    },
    {
      icon: FiHeart,
      title: 'Empowerment',
      description: 'We believe in empowering Kenyan creatives to build sustainable businesses doing what they love.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Our Mission: Empower Kenyan Creatives</h1>
            <p className="text-xl text-blue-100 mb-8">
              Klick n Shoot was born from a simple idea: make it easy for talented photographers and videographers in Kenya 
              to find work, and for clients to find the perfect creative for their projects.
            </p>
            <Link to="/register">
              <Button size="large" className="bg-white text-blue-600 hover:bg-blue-50">
                Join Our Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                Founded in 2024, Klick n Shoot Kenya started as a conversation between a photographer struggling to find 
                consistent work and a business owner who couldn't find reliable creatives for their events.
              </p>
              <p>
                We realized there was a gap in the market: talented creatives lacked a dedicated platform to showcase 
                their work, while clients spent hours searching through social media and asking for referrals.
              </p>
              <p>
                Today, Klick n Shoot has grown into Kenya's premier marketplace for photography and videography services, 
                connecting hundreds of verified creatives with clients across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Meet Our Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">By The Numbers</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Verified Creatives</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">2,000+</div>
              <div className="text-blue-200">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">KES 15M+</div>
              <div className="text-blue-200">Earned by Creatives</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">47</div>
              <div className="text-blue-200">Counties Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Growing Community</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a creative looking for more opportunities or a client searching for talent, 
            Klick n Shoot is the platform built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=creative">
              <Button size="large" variant="primary">
                Join as Creative
              </Button>
            </Link>
            <Link to="/register?role=client">
              <Button size="large" variant="outline">
                Join as Client
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
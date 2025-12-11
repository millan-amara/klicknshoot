import { Link } from 'react-router-dom'
import { 
  FiSearch, 
  FiCamera, 
  FiCheckCircle, 
  FiStar, 
  FiMapPin,
  FiMessageCircle,
  FiUsers,
  FiDollarSign
} from 'react-icons/fi'
import Button from '../components/common/Button'

const Home = () => {
  const features = [
    {
      icon: FiSearch,
      title: 'Find Top Creatives',
      description: 'Browse verified photographers and videographers with detailed portfolios and reviews.'
    },
    {
      icon: FiDollarSign,
      title: 'Post Your Budget',
      description: 'Share your project needs and budget. Creatives submit proposals that fit your requirements.'
    },
    {
      icon: FiMessageCircle,
      title: 'Direct Communication',
      description: 'Connect directly with creatives through WhatsApp after accepting proposals.'
    },
    {
      icon: FiCheckCircle,
      title: 'Verified Profiles',
      description: 'All creatives are manually verified through social links and portfolio review.'
    }
  ]

  const stats = [
    { value: '500+', label: 'Verified Creatives' },
    { value: '2,000+', label: 'Projects Completed' },
    { value: 'KES 15M+', label: 'Paid to Creatives' },
    { value: '98%', label: 'Client Satisfaction' }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Post Your Request',
      description: 'Describe your project needs, budget, and timeline. It takes just 2 minutes.',
      action: 'Post a Job'
    },
    {
      step: 2,
      title: 'Review Proposals',
      description: 'Receive up to 5 proposals from interested creatives within your budget.',
      action: 'Browse Creatives'
    },
    {
      step: 3,
      title: 'Choose & Connect',
      description: 'Select the best proposal and connect directly via WhatsApp to start your project.',
      action: 'Get Started'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find the Perfect <span className="text-yellow-300">Photographer</span> or <span className="text-yellow-300">Videographer</span> in Kenya
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with verified creatives for your events, projects, or business needs. Post your budget, get proposals, and hire with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=client">
                <Button size="large" className="bg-white text-blue-600 hover:bg-blue-50 hover:text-white">
                  👤 I need a Creative
                </Button>
              </Link>
              <Link to="/register?role=creative">
                <Button size="large" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  📷 I'm a Creative
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Klick n Shoot Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and efficient. Get the perfect creative for your project in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-blue-600">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 mb-6">{item.description}</p>
                <Link to={item.step === 1 ? '/register?role=client' : item.step === 2 ? '/creatives' : '/register'}>
                  <Button variant="outline" className="w-full">
                    {item.action}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Klick n Shoot?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for the Kenyan creative market with features that make hiring and getting hired easier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Creative?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Join thousands of clients and creatives who are already using Klick n Shoot Kenya to connect and collaborate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=client">
              <Button size="large" className="bg-white text-blue-600 hover:bg-blue-50">
                Post a Job - It's Free
              </Button>
            </Link>
            <Link to="/register?role=creative">
              <Button size="large" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Join as Creative
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-blue-200">
            No hidden fees. Pay only when you accept a proposal.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need Help Getting Started?</h3>
              <p className="text-gray-400">Our team is here to help you find the perfect creative match.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/contact">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
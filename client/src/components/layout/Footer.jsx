import { Link } from 'react-router-dom'
import { HiOutlineCamera } from 'react-icons/hi'
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Platform: [
      { name: 'Find Creatives', path: '/creatives' },
      { name: 'Browse Jobs', path: '/requests' },
      { name: 'How it Works', path: '/how-it-works' },
      { name: 'Pricing', path: '/pricing' },
    ],
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
    ],
    Support: [
      { name: 'Help Center', path: '/help' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ],
    ForCreatives: [
      { name: 'Create Profile', path: '/register?role=creative' },
      { name: 'Portfolio Tips', path: '/creatives/tips' },
      { name: 'Success Stories', path: '/success-stories' },
      { name: 'Resources', path: '/resources' },
    ],
  }

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <HiOutlineCamera className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Klick n Shoot</span>
              <span className="text-sm font-semibold text-blue-400">Kenya</span>
            </Link>
            <p className="mb-6 text-gray-400 max-w-md">
              Connecting Kenyan photographers and videographers with clients who need their expertise. 
              Find the perfect creative for your project or grow your photography business.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              &copy; {currentYear} Klick n Shoot Kenya. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white">
              Cookie Policy
            </Link>
            <Link to="/sitemap" className="text-gray-400 hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>📍 Nairobi, Kenya</p>
          <p className="mt-2">📞 +254 700 000 000 | ✉️ hello@klicknshoot.com</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
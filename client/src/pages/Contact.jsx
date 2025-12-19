import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi'
import InputField from '../components/forms/InputField'
import TextareaField from '../components/forms/TextareaField'
import Button from '../components/common/Button'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      // In a real app, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      details: ['hello@klicknshoot.com', 'support@klicknshoot.com'],
      link: 'mailto:hello@klicknshoot.com'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+254 700 000 000', 'Mon-Fri 9AM-5PM EAT'],
      link: 'tel:+254700000000'
    },
    {
      icon: FiMapPin,
      title: 'Location',
      details: ['Nairobi, Kenya', 'Working remotely across Kenya'],
      link: null
    }
  ]

  const faqs = [
    {
      question: 'How do I get verified as a creative?',
      answer: 'Submit your social media links and portfolio through your dashboard. Our team reviews each submission manually within 2-3 business days.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We use Paystack for subscription payments, which accepts all major credit/debit cards and mobile money.'
    },
    {
      question: 'How long does it take to get responses to proposals?',
      answer: 'Clients typically respond within 2-3 days. We encourage clients to respond to all proposals within a week.'
    },
    {
      question: 'Can I use Klick n Shoot as a company?',
      answer: 'Yes! Many businesses use Klick n Shoot to find creatives for their projects. You can create a company profile and manage multiple team members.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-blue-100">
            Have questions? We're here to help you get the most out of Klick n Shoot.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                      {errors.submit}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <InputField
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                      placeholder="John Doe"
                    />
                    
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                      placeholder="you@example.com"
                    />
                  </div>

                  <InputField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={errors.subject}
                    required
                    placeholder="How can we help you?"
                    className="mb-6"
                  />

                  <TextareaField
                    label="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="mb-6"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    loading={loading}
                    className="w-full"
                    leftIcon={<FiSend />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info & FAQ */}
          <div className="lg:w-1/2">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="p-3 bg-blue-50 rounded-lg mr-4">
                      <info.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">
                          {detail}
                        </p>
                      ))}
                      {info.link && (
                        <a
                          href={info.link}
                          className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Click to contact →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t">
                <p className="text-gray-600">
                  Don't see your question here?{' '}
                  <button
                    onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Send us a message
                  </button>{' '}
                  and we'll be happy to help.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Support */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <span className="text-yellow-800 font-bold">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
              <p className="text-gray-700 mb-3">
                For urgent matters such as account security issues or payment problems, 
                please call our emergency support line.
              </p>
              <a
                href="tel:+254711000000"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiPhone className="w-4 h-4 mr-2" />
                Emergency Support: +254 711 000 000
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
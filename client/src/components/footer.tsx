import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {/* Enhanced Logo Icon for Footer */}
              <div className="relative flex items-center justify-center">
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 40 40" 
                  className="hover:scale-105 transition-transform duration-200"
                >
                  {/* Background Circle */}
                  <circle 
                    cx="20" 
                    cy="20" 
                    r="18" 
                    fill="url(#redGradientFooter)" 
                    className="drop-shadow-sm"
                  />
                  
                  {/* Shield Icon */}
                  <path 
                    d="M20 6L28 10V18C28 24 24 28 20 32C16 28 12 24 12 18V10L20 6Z" 
                    fill="white" 
                    stroke="white" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Check Mark */}
                  <path 
                    d="M16 19L19 22L24 17" 
                    stroke="#10B981" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Gradient Definition for Footer */}
                  <defs>
                    <linearGradient id="redGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Brand Name for Footer */}
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors leading-tight tracking-tight">
                  XTRACOVER
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium -mt-1 opacity-80">
                  BuyBack Guarantee
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your trusted partner for device protection and buyback solutions. We provide comprehensive coverage for your valuable electronics.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebookF className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Video Gallery</Link></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Buy Refurbished</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">sellNcash</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Xtracover Technologies Private Limited</h4>
              <p className="text-gray-400 text-sm mb-1">
                A-1, 3rd Floor, FIEE Complex Okhla Industrial Area Phase-2
              </p>
              <p className="text-gray-400 text-sm mb-1">
                New Delhi South Delhi DL 110020
              </p>
              <p className="text-gray-400 text-sm mb-1">
                CIN : U74999DL2017PTC313555
              </p>
              <p className="text-gray-400 text-sm mb-1">
                📞 8860396039
              </p>
              <p className="text-gray-400 text-sm">
                ✉️ contactus@xtracover.com
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">© 2025 Xtracover Technologies Private Limited. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

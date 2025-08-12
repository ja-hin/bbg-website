import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              {/* Official XTRACOVER Logo for Footer */}
              <img 
                src="https://images.xtracover.com/StaticImages/mobile_img/newui/logo.svg" 
                alt="XTRACOVER Logo" 
                className="h-10 w-auto hover:scale-105 transition-transform duration-200"
              />
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
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Sell Phone</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Sell iPhones</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Buy Phones</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Buy Refurbished</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Register Warranty</Link></li>
            </ul>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Budget Under 5K</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Value Under 8K</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Deals Under 15K</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Premium 15K+</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Offers & Deals</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blogs</Link></li>
            </ul>
          </div>
          
          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Policy */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Policy</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Warranty Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Return & Refund</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">GDPR Privacy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</Link></li>
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

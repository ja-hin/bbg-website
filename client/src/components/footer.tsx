import { FaFacebookF, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#4A67C1] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6">FOLLOW US</h3>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-8 h-8 bg-white text-[#4A67C1] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <FaFacebookF className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 bg-white text-[#4A67C1] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <FaXTwitter className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 bg-white text-[#4A67C1] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <FaInstagram className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 bg-white text-[#4A67C1] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <FaLinkedin className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 bg-white text-[#4A67C1] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <FaYoutube className="text-sm" />
              </a>
            </div>
            <button className="bg-white text-[#4A67C1] px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity">
              Ask A Question
            </button>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6">SERVICES</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Sell Phone</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Sell Apple iPhones</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Buy Phones</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Buy Refurbished iPhones</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Register Warranty</Link></li>
            </ul>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6">LINKS</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Budget Picks Under 5000</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Best Value Under 8000</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Power Deals Under 15K</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Premium Phones Above 15K</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Terms & Conditions</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Offers & Deals</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Careers</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Blogs</Link></li>
            </ul>
          </div>

          {/* Help & Support Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6">HELP & SUPPORT</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">About Us</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">FAQ</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Contact Us</Link></li>
            </ul>
          </div>

          {/* Policy Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6">POLICY</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Privacy Policy</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Warranty Policy</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Cookie Policy</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Return & Refund Policy</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">GDPR Privacy</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/20 mt-12 pt-6">
          <div className="text-center">
            <p className="text-white/80">Copyright © 2025 XtraCover All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { FaFacebookF, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";

export default function Footer() {
  const { theme } = useTheme();
  
  return (
    <>
      <footer className="text-white" style={{ backgroundColor: (theme as any)?.primaryColor || '#254696' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Follow Us Section */}
            <div className="overflow-hidden">
              <h3 className="text-2xl font-semibold mb-8">FOLLOW US</h3>
              <div className="flex gap-2 mb-8 overflow-x-auto">
                <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                  <FaFacebookF className="text-sm" />
                </a>
                <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                  <FaXTwitter className="text-sm" />
                </a>
                <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                  <FaInstagram className="text-sm" />
                </a>
                <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                  <FaLinkedin className="text-sm" />
                </a>
                <a href="#" className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                  <FaYoutube className="text-sm" />
                </a>
              </div>
              <button className="bg-white px-6 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity" style={{ color: (theme as any)?.primaryColor || '#254696' }}>
                Ask A Question
              </button>
            </div>

          {/* Services Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6">SERVICES</h3>
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
            <h3 className="text-xl font-semibold mb-6">LINKS</h3>
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
            <h3 className="text-xl font-semibold mb-6">HELP & SUPPORT</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">About Us</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">FAQ</Link></li>
              <li><Link href="#" className="text-white hover:opacity-80 transition-opacity">Contact Us</Link></li>
            </ul>
          </div>

          {/* Policy Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6">POLICY</h3>
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

        </div>
      </footer>
      {/* Copyright Section - Separate from footer */}
      <div className="bg-white py-4 pt-[10px] pb-[10px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black font-normal text-sm">Copyright © 2025 XtraCover All rights reserved</p>
        </div>
      </div>
    </>
  );
}

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "wouter";
import { useTheme } from "@/hooks/useTheme";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <>
      <footer
        className="text-white"
        style={{ backgroundColor: (theme as any)?.primaryColor || "#254696" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Follow Us Section */}
            <div className="overflow-hidden">
              <h3 className="text-2xl font-semibold mb-8">FOLLOW US</h3>
              <div className="flex gap-2 mb-8 overflow-x-auto">
                <a
                  href="https://www.facebook.com/Xtracoverdotcom/"
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                  style={{ color: (theme as any)?.primaryColor || "#254696" }}
                >
                  <FaFacebookF className="text-sm" />
                </a>
                <a
                  href="https://x.com/Xtracover_"
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                  style={{ color: (theme as any)?.primaryColor || "#254696" }}
                >
                  <FaXTwitter className="text-sm" />
                </a>
                <a
                  href="https://www.instagram.com/xtracoverdotcom/"
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                  style={{ color: (theme as any)?.primaryColor || "#254696" }}
                >
                  <FaInstagram className="text-sm" />
                </a>
                <a
                  href="https://www.linkedin.com/company/42777773/admin/"
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                  style={{ color: (theme as any)?.primaryColor || "#254696" }}
                >
                  <FaLinkedin className="text-sm" />
                </a>
                <a
                  href="https://www.youtube.com/@xtracover8462"
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
                  style={{ color: (theme as any)?.primaryColor || "#254696" }}
                >
                  <FaYoutube className="text-sm" />
                </a>
              </div>
              <button
                className="bg-white px-6 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                style={{ color: (theme as any)?.primaryColor || "#254696" }}
              >
                Ask A Question
              </button>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">SERVICES</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.xtracover.com/sell"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sell Phone
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/sell/mobiles/apple"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sell Apple iPhones
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy Phones
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/mobiles/apple"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy Refurbished iPhones
                  </a>
                </li>
                <li>
                  <a
                    href="https://warranty.xtracover.com/register"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register Warranty
                  </a>
                </li>
              </ul>
            </div>

            {/* Links Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">LINKS</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/under-5000"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Budget Picks Under 5000
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/between-5000-to-8000"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Best Value Under 8000
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/between-8000-to-15000"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Power Deals Under 15K
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/more-than-15000"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Premium Phones Above 15K
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/terms-and-conditions"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/buy-refurbished/DealsofTheDay"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Offers & Deals
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/careers"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/blog"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Blogs
                  </a>
                </li>
              </ul>
            </div>

            {/* Help & Support Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">HELP & SUPPORT</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.xtracover.com/about-us"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/FAQ"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/contact-us"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Policy Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">POLICY</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://www.xtracover.com/privacy-policy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/warranty-policy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Warranty Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/cookie-policy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/return-policy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Return & Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/gdpr-privacy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GDPR Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.xtracover.com/shipping-policy"
                    className="text-white hover:opacity-80 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Shipping Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      {/* Copyright Section - Separate from footer */}
      <div className="bg-white py-4 pt-[10px] pb-[10px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black font-normal text-sm">
            Copyright © 2025 XtraCover All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}

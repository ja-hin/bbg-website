import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Smartphone, Laptop, Command, Terminal, Apple, Monitor } from "lucide-react";

export function RegistrationHelpGuide() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">How to find your IMEI?</h3>
        <p className="text-sm text-gray-500">
          Follow the simple steps below based on your device type to locate your unique identifier.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full bg-transparent">
        {/* Apple iPhone */}
        <AccordionItem value="iphone" className="border rounded-xl px-4 bg-white shadow-sm mb-3">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Apple className="h-5 w-5 text-gray-900" />
              <span className="font-medium">Apple iPhone</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-gray-600 space-y-3">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">
              <li>Open <span className="font-semibold text-gray-900">Settings</span> app.</li>
              <li>Tap on <span className="font-semibold text-gray-900">General</span>, then <span className="font-semibold text-gray-900">About</span>.</li>
              <li>Scroll down to find the <span className="font-semibold text-gray-900">IMEI</span>.</li>
              <li>Touch and hold the number to copy it.</li>
            </ol>
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <img 
                src="/assets/iphone-imei.png" 
                alt="iPhone IMEI Location" 
                className="w-full h-auto object-cover"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Android */}
        <AccordionItem value="android" className="border rounded-xl px-4 bg-white shadow-sm mb-3">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <span className="font-medium">Android</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-gray-600 space-y-3">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">
              <li>Open the <span className="font-semibold text-gray-900">Phone/Dialer</span> app.</li>
              <li>Dial <span className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded text-gray-900">*#06#</span> on the keypad.</li>
              <li>Your IMEI will be displayed on the screen.</li>
              <li>Touch and hold to copy.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Windows */}
        <AccordionItem value="windows" className="border rounded-xl px-4 bg-white shadow-sm mb-3">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Windows Laptop</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-gray-600 space-y-3">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">
              <li>Click Start and search for <span className="font-semibold text-gray-900">"Command Prompt"</span>.</li>
              <li>Type <span className="font-mono text-xs bg-gray-800 text-green-400 px-2 py-1 rounded">wmic bios get serialnumber</span></li>
              <li>Press <span className="font-semibold text-gray-900">Enter</span>.</li>
              <li>Your Serial Number will be displayed below the command.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Macbook */}
        <AccordionItem value="macbook" className="border rounded-xl px-4 bg-white shadow-sm mb-3">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Laptop className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Macbook</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-gray-600 space-y-3">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">
              <li>Click the <span className="font-semibold text-gray-900">Apple Menu ()</span> in the corner.</li>
              <li>Select <span className="font-semibold text-gray-900">System Settings</span> (or System Preferences).</li>
              <li>Click <span className="font-semibold text-gray-900">General</span>, then <span className="font-semibold text-gray-900">About</span>.</li>
              <li>Your Serial Number is listed in the overview window.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

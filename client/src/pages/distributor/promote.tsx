import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { DistributorLayout } from "@/components/distributor-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Share2, 
  Megaphone, 
  Download, 
  Smartphone,
  ShieldCheck,
  TrendingUp,
  Image as LucideImage,
  FileText
} from "lucide-react";

export default function DistributorPromote() {
  const { distributor } = useDistributorAuth();
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/plans?ref=${distributor?.sellerCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BuyBack Guarantee Protection Plans',
          text: `Protect your device with BuyBack Guarantee! Use my link to purchase your plan:`,
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(referralLink, "Referral link");
    }
  };

  return (
    <DistributorLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Promote BBG</h1>
            <p className="text-gray-500 mt-1">Direct customers to purchase protection plans with your referral</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare} className="bg-[#254696] hover:bg-[#1a326b]">
              <Share2 className="w-4 h-4 mr-2" />
              Share Purchase Link
            </Button>
          </div>
        </div>

        {/* Share Link Card - Redesigned for Premium Look */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-[#254696] text-white rounded-3xl group">
          {/* Abstract Background Ornaments */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-110"></div>
          
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md text-blue-100 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                  Direct Purchase Link
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Customer Purchase Link</h2>
                  <p className="text-blue-100/80 max-w-md text-lg leading-relaxed">
                    Instantly share your personalized link and earn commissions on every protection plan your customers purchase.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-8">
                  <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 font-mono text-sm text-blue-50 truncate flex items-center shadow-inner group/link relative">
                    <span className="opacity-90">{referralLink}</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => copyToClipboard(referralLink, "Purchase link")}
                    className="h-14 bg-white hover:bg-blue-50 text-[#254696] border-none transition-all rounded-2xl font-bold px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
              
              {/* Seller Code Card - Fixed Cropping & Glassmorphism */}
              <div className="relative group/code sm:min-w-[280px]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 rounded-[2.5rem] blur-xl opacity-20 group-hover/code:opacity-40 transition duration-700"></div>
                <div className="relative flex flex-col items-center gap-6 bg-white p-8 rounded-[2rem] shadow-2xl border border-white/20 text-gray-900 transition-transform duration-500 group-hover/code:scale-[1.02]">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">Exclusive Partner Code</p>
                    <div className="relative">
                      <p className="text-5xl font-black text-[#254696] tracking-tighter drop-shadow-sm">
                        {distributor?.sellerCode}
                      </p>
                      <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#254696]/0 via-[#254696]/20 to-[#254696]/0 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <Button 
                      onClick={() => copyToClipboard(distributor?.sellerCode || "", "Seller code")}
                      className="w-full h-12 font-bold bg-[#254696] hover:bg-[#1a326b] text-white rounded-xl shadow-md transition-all"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <p className="text-[10px] text-center text-gray-400 font-medium">Use this code for offline tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100 bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Higher Earnings</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Direct links convert better. Earn up to 10% commission on every successful purchase.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100 bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Device Protection</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Every sale through your link provides customers with genuine BBG protection plans.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100 bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Professional Ads</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Access a library of professional marketing materials ready to use on your social channels.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Marketing Assets Section */}
        <div className="pt-4 space-y-6">
          <div className="flex items-end justify-between border-b border-gray-100 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LucideImage className="w-6 h-6 text-[#254696]" />
                Marketing Assets
              </h2>
              <p className="text-gray-500">Download visual posters, stickers, and digital banners for your store</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                type: 'Store Stickers', 
                description: 'QR-enabled stickers for your checkout counter', 
                format: 'PNG/PDF', 
                size: '2.4 MB',
                icon: <Smartphone className="w-5 h-5" />
              },
              { 
                type: 'Product Brochure', 
                description: 'Detailed benefits guide for customers', 
                format: 'PDF', 
                size: '4.8 MB',
                icon: <FileText className="w-5 h-5" />
              },
              { 
                type: 'Digital Banners', 
                description: 'Dimensions optimized for WhatsApp & Social Media', 
                format: 'JPG Bundle', 
                size: '12.5 MB',
                icon: <LucideImage className="w-5 h-5" />
              },
              { 
                type: 'Brand Guide', 
                description: 'Logo variants and official brand colors', 
                format: 'ZIP', 
                size: '1.2 MB',
                icon: <ShieldCheck className="w-5 h-5" />
              },
            ].map((asset, i) => (
              <div key={i} className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                   {asset.icon}
                </div>
                <div>
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                     <Download className="w-5 h-5 text-gray-400 group-hover:text-[#254696]" />
                  </div>
                  <p className="font-bold text-lg text-gray-900 mb-1">{asset.type}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{asset.description}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-100 rounded uppercase">{asset.format}</span>
                    <span>{asset.size}</span>
                  </div>
                </div>
                <Button variant="ghost" className="mt-6 w-full h-10 bg-gray-50 hover:bg-[#254696] hover:text-white transition-all rounded-xl font-bold border border-transparent hover:border-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DistributorLayout>
  );
}

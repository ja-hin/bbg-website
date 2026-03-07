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

        {/* Share Link Card - Refined & Concise */}
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white overflow-hidden rounded-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#254696] rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direct Purchase Link
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Purchase Link</h2>
                  <p className="text-gray-500 max-w-md text-base">
                    Share your unique link to direct customers to purchase protection plans.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-4">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-mono text-sm text-gray-600 truncate flex items-center shadow-inner group relative">
                    <span className="truncate">{referralLink}</span>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(referralLink, "Purchase link")}
                    className="h-12 bg-[#254696] hover:bg-[#1a326b] text-white transition-all rounded-xl font-bold px-6 shadow-sm shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
              
              {/* Seller Code Section - Concise & Integrated */}
              <div className="flex flex-col items-center gap-3 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 min-w-[220px] sm:min-w-[240px] shrink-0">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Your Seller Code</p>
                  <p className="text-3xl font-black text-[#254696] tracking-tighter">
                    {distributor?.sellerCode}
                  </p>
                </div>
                
                <Button 
                  onClick={() => copyToClipboard(distributor?.sellerCode || "", "Seller code")}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 font-bold bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-xl"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy Code
                </Button>
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

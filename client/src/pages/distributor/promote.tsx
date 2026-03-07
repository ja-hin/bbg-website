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
  ExternalLink,
  Smartphone,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export default function DistributorPromote() {
  const { distributor } = useDistributorAuth();
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/register?ref=${distributor?.sellerCode}`;

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
          title: 'Partner with BuyBack Guarantee',
          text: `Use my referral code ${distributor?.sellerCode} to get the best protection for your devices!`,
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
            <p className="text-gray-500 mt-1">Tools and resources to help you refer more customers</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>

        {/* Share Link Card */}
        <Card className="border-2 border-blue-50/50 bg-blue-50/20 shadow-sm overflow-hidden">
          <div className="bg-[#254696] h-1.5 w-full"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Partner Program
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Personal Referral Link</h2>
                <p className="text-gray-600 max-w-md">
                   Share this unique link with your customers to ensure you get commissioned for every successful registration.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-6">
                  <div className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-mono text-sm text-gray-600 truncate flex items-center shadow-inner">
                    {referralLink}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(referralLink, "Referral link")}
                    className="h-12 border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all rounded-xl font-bold"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Referral Code</p>
                  <p className="text-4xl font-black text-[#254696] tracking-tighter">{distributor?.sellerCode}</p>
                </div>
                <Button 
                  onClick={() => copyToClipboard(distributor?.sellerCode || "", "Referral code")}
                  variant="secondary"
                  size="sm"
                  className="w-full font-bold"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats/Info */}
          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100">
            <CardHeader>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Earn More</CardTitle>
              <CardDescription>Get up to 10% commission on every device protection plan sold.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Easy Tracking</CardTitle>
              <CardDescription>Monitor your referrals and earnings in real-time through your dashboard.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-gray-100">
            <CardHeader>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Marketing Support</CardTitle>
              <CardDescription>Get professional marketing visuals to help you close more deals.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Assets Section Placeholder */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-gray-400" />
            Marketing Assets
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: 'Brand Logo', format: 'PNG/SVG', size: '1.2 MB' },
              { type: 'Product Catalog', format: 'PDF', size: '4.5 MB' },
              { type: 'Store Banners', format: 'ZIP', size: '12.8 MB' },
              { type: 'Social Media Kit', format: 'ZIP', size: '8.4 MB' },
            ].map((asset, i) => (
              <div key={i} className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{asset.type}</p>
                  <p className="text-xs text-gray-500 mt-1">{asset.format} • {asset.size}</p>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 w-full h-9 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all font-bold">
                  <Download className="w-3.5 h-3.5 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Need help with promotion?</h2>
            <p className="text-gray-600 mb-6 font-medium">
              Access our comprehensive partner training videos and guides to understand how to effectively position BuyBack Guarantee to your customers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="h-11 rounded-xl bg-gray-900 hover:bg-black font-bold">
                Partner Academy
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-2 font-bold">
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DistributorLayout>
  );
}

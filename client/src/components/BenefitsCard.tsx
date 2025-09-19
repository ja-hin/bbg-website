import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gavel, Wrench } from "lucide-react";

interface BenefitsCardProps {
  deviceType: 'mobile' | 'laptop';
  benefits: {
    auctionService: {
      price: number;
      description: string;
    };
    repairBenefit: {
      price: number;
      description: string;
    };
  };
  totalPrice: number;
  planPrice: number;
}

export function BenefitsCard({ deviceType, benefits, totalPrice, planPrice }: BenefitsCardProps) {
  const savings = totalPrice - planPrice;
  
  return (
    <Card className="w-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-orange-900 flex items-center">
            <Gavel className="h-5 w-5 mr-2" />
            Your BBG Benefits Package
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {deviceType === 'mobile' ? 'Mobile' : 'Laptop'} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Information about device age */}
        <div className="bg-white/70 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 mb-2">
            <strong>Important:</strong> Since your device was purchased over 6 months ago, your BBG plan includes premium services instead of claim coverage.
          </p>
        </div>

        {/* Benefits breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-orange-900 text-sm uppercase tracking-wide">
            Included Services
          </h4>
          
          {/* Auction Service */}
          <div className="flex items-start space-x-3 bg-white/50 p-3 rounded-lg">
            <div className="bg-orange-500 p-2 rounded-full flex-shrink-0">
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-orange-900">Professional Auction Service</h5>
                <span className="text-sm font-semibold text-orange-700">₹{benefits.auctionService.price}</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">{benefits.auctionService.description}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-700">Expert device evaluation & market-rate selling</span>
              </div>
            </div>
          </div>

          {/* Repair Benefit */}
          <div className="flex items-start space-x-3 bg-white/50 p-3 rounded-lg">
            <div className="bg-orange-500 p-2 rounded-full flex-shrink-0">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-orange-900">Premium Repair Benefits</h5>
                <span className="text-sm font-semibold text-orange-700">₹{benefits.repairBenefit.price}</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">{benefits.repairBenefit.description}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-700">Priority repair service & genuine parts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Value proposition */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 mb-1">
              ₹{totalPrice} Total Value
            </div>
            <div className="text-sm text-green-700 mb-2">
              For just ₹{planPrice} - You save ₹{savings}!
            </div>
            <div className="text-xs text-green-600">
              {Math.round((savings / totalPrice) * 100)}% savings on premium device services
            </div>
          </div>
        </div>

        {/* Call to action note */}
        <div className="text-center pt-2">
          <p className="text-xs text-orange-600">
            Complete your purchase to unlock these premium services for your device
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
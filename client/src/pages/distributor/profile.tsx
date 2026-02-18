import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDistributorAuth } from "@/hooks/useDistributorAuth";
import { DistributorLayout } from "@/components/distributor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CreditCard, 
  Building, 
  User, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Wallet
} from "lucide-react";

export default function DistributorProfile() {
  const { distributor } = useDistributorAuth();
  const { toast } = useToast();

const [taxFormData, setTaxFormData] = useState({
    panNumber: distributor?.panNumber || '',
    isGstRegistered: distributor?.isGstRegistered || false,
    gstin: distributor?.gstin || '',
    isMsmeRegistered: distributor?.isMsmeRegistered || false
  });

  // Update form data when distributor data loads
  useEffect(() => {
    if (distributor) {
      setTaxFormData({
        panNumber: distributor.panNumber || '',
        isGstRegistered: distributor.isGstRegistered || false,
        gstin: distributor.gstin || '',
        isMsmeRegistered: distributor.isMsmeRegistered || false
      });
    }
  }, [distributor]);

  // Profile update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const sessionToken = localStorage.getItem('distributorToken');
      return await apiRequest("/api/distributor/profile", {
        method: "PUT",
        body: profileData,
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      // Force refresh all distributor-related data
      queryClient.invalidateQueries({ queryKey: ["/api/distributor/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleSaveTaxDetails = () => {
    const panNumber = (document.getElementById('panNumber') as HTMLInputElement)?.value;
    
    const taxData = {
      panNumber: panNumber,
      isGstRegistered: taxFormData.isGstRegistered,
      gstin: taxFormData.gstin,
      isMsmeRegistered: taxFormData.isMsmeRegistered
    };
    
    updateProfileMutation.mutate(taxData);
  };

  const handleSaveBankDetails = () => {
    const bankAccount = (document.getElementById('bankAccount') as HTMLInputElement)?.value;
    const bankAccountConfirm = (document.getElementById('bankAccountConfirm') as HTMLInputElement)?.value;
    
    if (bankAccount !== bankAccountConfirm) {
      toast({
        title: "Validation Error",
        description: "Account numbers do not match",
        variant: "destructive",
      });
      return;
    }
    
    const bankData = {
      accountHolderName: (document.getElementById('accountHolder') as HTMLInputElement)?.value,
      bankAccount: bankAccount,
      bankAccountConfirm: bankAccountConfirm,
      ifscCode: (document.getElementById('ifscCode') as HTMLInputElement)?.value,
      upiId: (document.getElementById('upiId') as HTMLInputElement)?.value
    };
    
    updateProfileMutation.mutate(bankData);
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (distributor: any) => {
    if (!distributor) return { percentage: 0, completedFields: 0, totalFields: 0 };
    
    const requiredFields = [
      { key: 'name', value: distributor.name },
      { key: 'contact', value: distributor.contact },
      { key: 'email', value: distributor.email },
      { key: 'pincode', value: distributor.pincode },
      { key: 'panNumber', value: distributor.panNumber },
      { key: 'accountHolderName', value: distributor.accountHolderName },
      { key: 'bankAccount', value: distributor.bankAccount },
      { key: 'ifscCode', value: distributor.ifscCode }
    ];
    
    const completedFields = requiredFields.filter(field => field.value && field.value.trim() !== '').length;
    const percentage = Math.round((completedFields / requiredFields.length) * 100);
    
    return { 
      percentage, 
      completedFields, 
      totalFields: requiredFields.length
    };
  };

  const profileStats = calculateProfileCompletion(distributor);

  return (
    <DistributorLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account, tax, and bank details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tax & Compliance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Tax & Compliance Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Required for Payouts</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        PAN details are mandatory for TDS compliance. GST registration is optional.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        type="text"
                        placeholder="ABCDE1234F"
                        defaultValue={distributor?.panNumber || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="gstRegistered"
                        checked={taxFormData.isGstRegistered}
                        onCheckedChange={(checked) => 
                          setTaxFormData(prev => ({ ...prev, isGstRegistered: !!checked }))
                        }
                      />
                      <Label htmlFor="gstRegistered">I am GST registered</Label>
                    </div>

                    {taxFormData.isGstRegistered && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input
                          id="gstin"
                          type="text"
                          placeholder="22ABCDE1234F1Z5"
                          value={taxFormData.gstin}
                          onChange={(e) => 
                            setTaxFormData(prev => ({ ...prev, gstin: e.target.value }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2 border-t">
                     <div className="flex items-center space-x-2">
                      <Checkbox
                        id="msmeRegistered"
                        checked={taxFormData.isMsmeRegistered}
                        onCheckedChange={(checked) => 
                          setTaxFormData(prev => ({ ...prev, isMsmeRegistered: !!checked }))
                        }
                      />
                      <Label htmlFor="msmeRegistered">I am MSME registered</Label>
                    </div>
                  </div>

                  <Button onClick={handleSaveTaxDetails} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Tax Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Bank Details for Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Secure Bank Account</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Your bank details are encrypted. Account holder name must match PAN card.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Account Holder Name *</Label>
                      <Input
                        id="accountHolder"
                        type="text"
                        placeholder="As per bank records"
                        defaultValue={distributor?.accountHolderName || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        type="text"
                        placeholder="SBIN0001234"
                        defaultValue={distributor?.ifscCode || ''}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Bank Account Number *</Label>
                      <Input
                        id="bankAccount"
                        type="text"
                        placeholder="Account number"
                        defaultValue={distributor?.bankAccount || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountConfirm">Confirm Account Number *</Label>
                      <Input
                        id="bankAccountConfirm"
                        type="text"
                        placeholder="Re-enter account number"
                        defaultValue={distributor?.bankAccountConfirm || ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID (Optional)</Label>
                    <Input
                      id="upiId"
                      type="text"
                      placeholder="username@bankname"
                      defaultValue={distributor?.upiId || ''}
                    />
                  </div>

                  <Button onClick={handleSaveBankDetails} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Bank Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Global Completion</span>
                      <Badge variant={profileStats.percentage >= 90 ? "default" : "secondary"}>
                        {profileStats.percentage}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          profileStats.percentage >= 90 ? 'bg-green-500' : 
                          profileStats.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${profileStats.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" /> Basic Info
                    </p>
                    <p className={`flex items-center gap-2 mb-1 ${distributor?.panNumber ? 'text-gray-700' : 'text-red-500'}`}>
                      <CheckCircle className={`w-4 h-4 ${distributor?.panNumber ? 'text-green-500' : 'text-gray-300'}`} /> 
                      PAN Details
                    </p>
                    <p className={`flex items-center gap-2 ${distributor?.bankAccount ? 'text-gray-700' : 'text-red-500'}`}>
                      <CheckCircle className={`w-4 h-4 ${distributor?.bankAccount ? 'text-green-500' : 'text-gray-300'}`} /> 
                      Bank Account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DistributorLayout>
  );
}

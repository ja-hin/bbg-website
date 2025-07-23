import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  ShoppingCart, 
  Trash2, 
  RefreshCw, 
  User, 
  Smartphone, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building,
  Tag,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CartAbandonment {
  id: number;
  name?: string;
  contact?: string;
  email?: string;
  pincode?: string;
  deviceType?: string;
  serialNumber?: string;
  brand?: string;
  modelName?: string;
  invoiceValue?: number;
  sellerCode?: string;
  sessionId: string;
  stage: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

const stageLabels: Record<string, { label: string; color: string }> = {
  form_started: { label: "Form Started", color: "bg-gray-500" },
  details_entered: { label: "Details Entered", color: "bg-blue-500" },
  otp_verified: { label: "OTP Verified", color: "bg-green-500" },
  payment_pending: { label: "Payment Pending", color: "bg-orange-500" }
};

export default function AdminCartAbandonments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch cart abandonments
  const { data: abandonments = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/cart-abandonments"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/cart-abandonments", { method: "GET" });
      return response;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Delete cart abandonment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/cart-abandonments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cart-abandonments"] });
      toast({
        title: "Deleted",
        description: "Cart abandonment record deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete cart abandonment",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    }
  });

  // Cleanup old abandonments mutation
  const cleanupMutation = useMutation({
    mutationFn: async (daysOld: number) => {
      return await apiRequest("/api/admin/cart-abandonments/cleanup", { 
        method: "POST", 
        body: { daysOld } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cart-abandonments"] });
      toast({
        title: "Cleanup Complete",
        description: "Old cart abandonment records have been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to cleanup old records",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleCleanup = () => {
    cleanupMutation.mutate(30); // Cleanup records older than 30 days
  };

  const getStageInfo = (stage: string) => {
    return stageLabels[stage] || { label: stage, color: "bg-gray-500" };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load cart abandonment data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              Cart Abandonments
            </h1>
            <p className="text-gray-600 mt-2">
              Track incomplete registrations and customer behavior patterns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/cart-abandonments"] })}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleCleanup}
              variant="outline"
              size="sm"
              disabled={cleanupMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Old Records
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Abandonments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Form Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abandonments.filter((a: CartAbandonment) => a.stage === 'form_started').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {abandonments.filter((a: CartAbandonment) => a.stage === 'payment_pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">OTP Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {abandonments.filter((a: CartAbandonment) => a.stage === 'otp_verified').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Abandonments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Abandonment Records</CardTitle>
          <CardDescription>
            Details of incomplete registration attempts and user behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {abandonments.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cart abandonment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Info</TableHead>
                    <TableHead>Device Details</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Session Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abandonments.map((abandonment: CartAbandonment) => {
                    const stageInfo = getStageInfo(abandonment.stage);
                    const sessionDuration = formatDistanceToNow(new Date(abandonment.createdAt), { addSuffix: false });
                    
                    return (
                      <TableRow key={abandonment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            {abandonment.name && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{abandonment.name}</span>
                              </div>
                            )}
                            {abandonment.contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{abandonment.contact}</span>
                              </div>
                            )}
                            {abandonment.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{abandonment.email}</span>
                              </div>
                            )}
                            {abandonment.pincode && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{abandonment.pincode}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            {abandonment.deviceType && (
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-gray-400" />
                                <span className="capitalize font-medium">{abandonment.deviceType}</span>
                              </div>
                            )}
                            {abandonment.brand && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{abandonment.brand}</span>
                                {abandonment.modelName && <span className="text-sm text-gray-500">/ {abandonment.modelName}</span>}
                              </div>
                            )}
                            {abandonment.invoiceValue && (
                              <div className="text-sm text-green-600 font-medium">
                                ₹{abandonment.invoiceValue.toLocaleString()}
                              </div>
                            )}
                            {abandonment.sellerCode && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{abandonment.sellerCode}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`${stageInfo.color} text-white`}>
                            {stageInfo.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(abandonment.lastActivity), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-gray-600">{sessionDuration}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            onClick={() => handleDelete(abandonment.id)}
                            disabled={deletingId === abandonment.id}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            {deletingId === abandonment.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
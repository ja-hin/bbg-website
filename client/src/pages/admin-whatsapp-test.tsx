import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Send, CheckCircle, XCircle } from "lucide-react";

export default function AdminWhatsAppTest() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("9564137489");
  const [message, setMessage] = useState("Dear Customer, Thank you for completing your product registration, Your Protection Plan is auto-activated and registered with us. Please share your purchasing experience with us on the given link below. Share Your Experience and Rating. Best Regards Team XtraCover");
  const [lastResult, setLastResult] = useState<any>(null);

  const testGupshupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/test-gupshup-whatsapp', {
        method: 'POST',
        body: { phone, message }
      });
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast({
        title: "WhatsApp Test Successful",
        description: "Message sent successfully via Gupshup",
      });
    },
    onError: (error: any) => {
      setLastResult({ success: false, error: error.message });
      toast({
        title: "WhatsApp Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testAllChannelsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/test-communications', {
        method: 'POST',
        body: { 
          phone, 
          message,
          name: "Test User",
          email: "test@xtracover.com"
        }
      });
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast({
        title: "Communication Test Completed",
        description: "Check results below for each channel",
      });
    },
    onError: (error: any) => {
      setLastResult({ success: false, error: error.message });
      toast({
        title: "Communication Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gupshup SMS Gateway Testing</h1>
        <p className="text-muted-foreground">
          Test Gupshup SMS Gateway API and communication channels (Production Ready)
        </p>
      </div>

      {/* Gupshup Configuration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Gupshup SMS Gateway Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Account ID</Label>
              <p className="text-sm text-muted-foreground">2000203988</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant="default">Production SMS Gateway</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Service</Label>
              <p className="text-sm text-muted-foreground">SMS Gateway API (not WhatsApp HSM)</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Message Type</Label>
              <p className="text-sm text-muted-foreground">SMS TEXT</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Production Ready:</strong> Gupshup account (2000203988) configured with dual-channel delivery.
            </p>
            <ul className="text-xs text-green-700 mt-2 space-y-1">
              <li>• WhatsApp Business API: Requires GUPSHUP_API_KEY for HSM templates</li>
              <li>• SMS Gateway: Always available as reliable fallback</li>
              <li>• Auto-fallback: Tries WhatsApp first, then SMS delivery</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number (e.g., 9564137489)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter Indian mobile number without +91 prefix
            </p>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
              placeholder="Enter your test message..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Message will be sent exactly as typed
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => testGupshupMutation.mutate()}
              disabled={testGupshupMutation.isPending || !phone || !message}
              className="flex items-center gap-2"
            >
              {testGupshupMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Test WhatsApp Only
            </Button>

            <Button
              variant="outline"
              onClick={() => testAllChannelsMutation.mutate()}
              disabled={testAllChannelsMutation.isPending || !phone || !message}
              className="flex items-center gap-2"
            >
              {testAllChannelsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Test All Channels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastResult.results ? (
                // All channels test results
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={lastResult.results.email?.success ? "default" : "destructive"}>
                        Email
                      </Badge>
                      <span className="text-sm">
                        {lastResult.results.email?.message || "Not tested"}
                      </span>
                    </div>
                    {lastResult.results.email?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={lastResult.results.sms?.success ? "default" : "destructive"}>
                        SMS
                      </Badge>
                      <span className="text-sm">
                        {lastResult.results.sms?.message || "Not tested"}
                      </span>
                    </div>
                    {lastResult.results.sms?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={lastResult.results.whatsapp?.success ? "default" : "destructive"}>
                        WhatsApp
                      </Badge>
                      <span className="text-sm">
                        {lastResult.results.whatsapp?.message || "Not tested"}
                      </span>
                    </div>
                    {lastResult.results.whatsapp?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ) : lastResult.result ? (
                // WhatsApp only test results
                <div className="p-4 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">Gupshup Response</Badge>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(lastResult.result, null, 2)}
                  </pre>
                </div>
              ) : (
                // Error results
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-sm text-destructive font-medium">
                    {lastResult.error || "Test failed"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>SMS Gateway Test:</strong> Tests direct Gupshup SMS Gateway API (2000203988)</p>
            <p>• <strong>All Channels:</strong> Tests Email (SMTP), SMS (Kaleyra), and SMS (Gupshup)</p>
            <p>• Phone numbers should be Indian mobile numbers without +91 prefix</p>
            <p>• Production credentials configured - messages sent to real numbers</p>
            <p>• WhatsApp HSM requires pre-approved templates (using SMS fallback)</p>
            <p>• Check response details to verify delivery status and fallback handling</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
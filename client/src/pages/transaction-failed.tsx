import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransactionFailedProps {}

export default function TransactionFailed(): JSX.Element {
  const [location] = useLocation();
  const [errorDetails, setErrorDetails] = useState<{
    txnid?: string;
    error?: string;
    message?: string;
  }>({});

  useEffect(() => {
    // Parse query parameters to get transaction details
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    setErrorDetails({
      txnid: urlParams.get('txnid') || undefined,
      error: urlParams.get('error') || 'payment_failed',
      message: urlParams.get('message') || undefined
    });
  }, [location]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'payment_failed':
        return 'Your payment could not be processed successfully. Please try again with a different payment method.';
      case 'processing_error':
        return 'There was an error processing your transaction. Please contact support if this problem persists.';
      case 'invalid_transaction':
        return 'The transaction details are invalid. Please start a new registration process.';
      case 'timeout':
        return 'Your payment session has timed out. Please start a new registration process.';
      default:
        return 'Unfortunately, your payment could not be completed. Please try again.';
    }
  };

  const getErrorTitle = (error: string) => {
    switch (error) {
      case 'payment_failed':
        return 'Payment Failed';
      case 'processing_error':
        return 'Processing Error';
      case 'invalid_transaction':
        return 'Invalid Transaction';
      case 'timeout':
        return 'Session Timeout';
      default:
        return 'Transaction Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {getErrorTitle(errorDetails.error || 'payment_failed')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorDetails.message || getErrorMessage(errorDetails.error || 'payment_failed')}
              </AlertDescription>
            </Alert>

            {errorDetails.txnid && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Transaction ID:</p>
                <p className="font-mono text-xs text-gray-800 break-all">
                  {errorDetails.txnid}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">What you can do:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Try registering again with a different payment method
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Check your bank account or card details
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Contact our support team if the problem continues
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link href="/customer-registration">
                <Button className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full" size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Need help?</p>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <p>Email: support@xtracover.com</p>
                <p>Phone: +91-XXXX-XXXX</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Camera, XCircle, CheckCircle2, Scan } from 'lucide-react';

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      
      const videoInputDevices = await codeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0].deviceId;
      
      codeReader.decodeFromVideoDevice(
        selectedDeviceId, 
        videoRef.current, 
        (result, err) => {
          if (result) {
            handleScan(result.getText());
            stopScanning();
          }
        }
      );
    } catch (error) {
      console.error('Scanner error:', error);
      toast.error('Failed to access camera');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const handleScan = async (token: string) => {
    setLoading(true);
    try {
      const { data, error } = await api.api.v1.tickets.validate.post({ token });
      
      if (error) {
        toast.error(error.value?.message || 'Invalid ticket');
        setResult('error');
      } else {
        toast.success('Check-in successful!');
        setResult('success');
      }
    } catch (error) {
      toast.error('Validation failed');
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="w-5 h-5" /> QR Check-in
        </CardTitle>
        <CardDescription>
          Scan a driver's e-ticket QR code to check them in for their session.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
          {scanning ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-2">
              {result === 'success' ? (
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              ) : result === 'error' ? (
                <XCircle className="w-16 h-16 text-destructive" />
              ) : (
                <Camera className="w-16 h-16 opacity-20" />
              )}
              <p className="text-sm font-medium">
                {result === 'success' ? 'Check-in Confirmed' : result === 'error' ? 'Invalid Ticket' : 'Camera Ready'}
              </p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!scanning ? (
            <Button className="w-full" onClick={startScanning}>
              <Camera className="w-4 h-4 mr-2" /> Start Scanner
            </Button>
          ) : (
            <Button variant="destructive" className="w-full" onClick={stopScanning}>
              <XCircle className="w-4 h-4 mr-2" /> Stop Scanner
            </Button>
          )}
          
          {result && (
            <Button variant="outline" onClick={() => setResult(null)}>
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * API Test Page
 * For testing YouTube API connection and endpoints
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, CheckCircle2, XCircle, Loader2, Clock, Server, Code, ChevronLeft, RefreshCw } from "lucide-react";
import { checkAPIHealth } from "@/services/youtube/transcript.service";
import { youtubeAPI } from "@/lib/axios";
import { env } from "@/config/env";
import { useNavigate } from "react-router-dom";

interface TestResult {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
  responseTime?: number;
  timestamp?: string;
  error?: string;
  requestHeaders?: Record<string, string>;
  responseData?: any;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function APITest() {
  const navigate = useNavigate();
  const [healthResult, setHealthResult] = useState<TestResult>({ status: "idle" });
  const [urlToIdResult, setUrlToIdResult] = useState<TestResult>({ status: "idle" });

  // Test Health Endpoint
  const testHealthEndpoint = async () => {
    setHealthResult({ status: "testing" });
    const startTime = Date.now();

    try {
      const isHealthy = await checkAPIHealth();
      const responseTime = Date.now() - startTime;

      setHealthResult({
        status: isHealthy ? "success" : "error",
        message: isHealthy ? "API is healthy!" : "API is not responding",
        responseTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setHealthResult({
        status: "error",
        message: "Failed to connect",
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Test URL to ID Endpoint
  const testUrlToIdEndpoint = async () => {
    setUrlToIdResult({ status: "testing" });
    const startTime = Date.now();
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    try {
      const response = await youtubeAPI.post("/url-to-id", { url: testUrl });
      const responseTime = Date.now() - startTime;

      setUrlToIdResult({
        status: "success",
        message: "Successfully extracted video ID",
        responseTime,
        timestamp: new Date().toISOString(),
        responseData: response.data,
        requestHeaders: response.config.headers as Record<string, string>,
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      setUrlToIdResult({
        status: "error",
        message: "Failed to extract video ID",
        error: error.message || "Unknown error",
        responseTime,
        timestamp: new Date().toISOString(),
        requestHeaders: error.config?.headers,
      });
    }
  };

  const renderTestResult = (result: TestResult) => {
    if (result.status === "idle") {
      return (
        <Alert className="bg-muted/30">
          <Activity className="w-4 h-4" />
          <AlertDescription className="text-sm">Ready to test. Click button to start.</AlertDescription>
        </Alert>
      );
    }

    if (result.status === "testing") {
      return (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <AlertDescription className="text-sm text-blue-300">Testing endpoint...</AlertDescription>
        </Alert>
      );
    }

    if (result.status === "success") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-sm text-green-600">
              <strong>{result.message}</strong>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <p className="font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.responseTime}ms
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
              <p className="font-mono text-xs">{new Date(result.timestamp!).toLocaleTimeString()}</p>
            </div>
          </div>

          {result.responseData && (
            <div className="p-3 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Code className="w-3 h-3" />
                Response Data:
              </p>
              <pre className="text-xs font-mono overflow-x-auto">{JSON.stringify(result.responseData, null, 2)}</pre>
            </div>
          )}

          {result.requestHeaders && (
            <details className="p-3 bg-muted/30 rounded-md">
              <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                <Code className="w-3 h-3" />
                Request Headers (click to expand)
              </summary>
              <pre className="text-xs font-mono overflow-x-auto mt-2">
                {JSON.stringify(result.requestHeaders, null, 2)}
              </pre>
            </details>
          )}
        </motion.div>
      );
    }

    if (result.status === "error") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <Alert variant="destructive" className="border-red-500/50">
            <XCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>{result.message}</strong>
            </AlertDescription>
          </Alert>

          {result.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-xs text-red-600 mb-2 font-semibold">Error Details:</p>
              <p className="text-xs font-mono text-red-600">{result.error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <p className="font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.responseTime}ms
              </p>
            </div>
            <div className="p-2 bg-muted/30 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
              <p className="font-mono text-xs">{new Date(result.timestamp!).toLocaleTimeString()}</p>
            </div>
          </div>

          {result.requestHeaders && (
            <details className="p-3 bg-muted/30 rounded-md">
              <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                <Code className="w-3 h-3" />
                Request Headers (click to expand)
              </summary>
              <pre className="text-xs font-mono overflow-x-auto mt-2">
                {JSON.stringify(result.requestHeaders, null, 2)}
              </pre>
            </details>
          )}
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-background to-muted/20"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 hover:bg-muted/50">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <Badge variant="secondary" className="gap-1.5 bg-indigo-500/10 text-amber-400 border-indigo-500/20">
              <Activity className="w-3 h-3" />
              API Testing
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* API Config Info */}
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Base URL</p>
                  <p className="text-sm font-mono break-all">{env.youtube.apiUrl}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Auth Header</p>
                  <p className="text-sm font-mono break-all">
                    {env.youtube.apiHeaderKey ? "✓ Configured" : "❌ Not Set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Check Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Health Check
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  GET /health
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test basic connectivity to YouTube API server. This endpoint should return 200 OK if server is running.
              </p>

              <Button
                onClick={testHealthEndpoint}
                disabled={healthResult.status === "testing"}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {healthResult.status === "testing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Health Endpoint
                  </>
                )}
              </Button>

              <AnimatePresence mode="wait">{renderTestResult(healthResult)}</AnimatePresence>
            </CardContent>
          </Card>

          {/* URL to ID Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  Extract Video ID
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  POST /url-to-id
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test video ID extraction from YouTube URL. This requires authentication header.
              </p>

              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Test URL:</p>
                <p className="text-sm font-mono break-all">https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
              </div>

              <Button
                onClick={testUrlToIdEndpoint}
                disabled={urlToIdResult.status === "testing"}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {urlToIdResult.status === "testing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test URL to ID Endpoint
                  </>
                )}
              </Button>

              <AnimatePresence mode="wait">{renderTestResult(urlToIdResult)}</AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

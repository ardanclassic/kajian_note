import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileJson, Upload, ChevronRight, ClipboardPaste, AlertCircle, CheckCircle2, Loader2, FileText, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface BlueprintImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (blueprint: any) => void;
  isLoading?: boolean;
}

export function BlueprintImportDialog({
  open,
  onOpenChange,
  onImport,
  isLoading = false
}: BlueprintImportDialogProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate JSON real-time (debounced could be better but text length isn't massive)
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);

    if (!text.trim()) {
      setIsValid(null);
      setParseError(null);
      return;
    }

    try {
      JSON.parse(text);
      setIsValid(true);
      setParseError(null);
    } catch (err) {
      setIsValid(false);
      // Don't show error immediately while typing, only if needed or generic
      setParseError("Format JSON tidak valid");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
      try {
        JSON.parse(text);
        setIsValid(true);
        setParseError(null);
        toast.success("JSON berhasil ditempel dari clipboard");
      } catch (err) {
        setIsValid(false);
        setParseError("Clipboard tidak berisi JSON yang valid");
        toast.error("Format JSON format invalid");
      }
    } catch (err) {
      toast.error("Gagal mengakses clipboard");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
        onOpenChange(false);
      } catch (error) {
        toast.error("File JSON rusak atau tidak valid");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitText = () => {
    if (!jsonText.trim()) return;

    try {
      const json = JSON.parse(jsonText);
      onImport(json);
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal mengimport blueprint");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Custom Dark Overlay */}
      {open && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      )}

      <DialogContent className="z-[9999] sm:max-w-[600px] h-[80vh] sm:h-auto overflow-hidden flex flex-col p-0 gap-0 bg-slate-950 border-slate-800">
        <DialogHeader className="p-4 border-b border-white/10 bg-slate-900/50">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
              <FileJson className="w-4 h-4 text-blue-400" />
            </div>
            <span>Import Blueprint</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="text" value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50 border border-white/5">
              <TabsTrigger value="text" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <ClipboardPaste className="w-4 h-4 mr-2" />
                Paste Code
              </TabsTrigger>
              <TabsTrigger value="file" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-0 space-y-4">
              <div className="relative">
                <Textarea
                  placeholder='Paste kode JSON blueprint di sini... Contoh: {"slides": [...]}'
                  className="min-h-[250px] max-h-[400px] overflow-y-auto font-mono text-xs bg-slate-900/50 border-slate-800 resize-none p-4 focus:ring-blue-500/20 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                  value={jsonText}
                  onChange={handleTextChange}
                />

                {/* Float Actions */}
                {!jsonText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-2 opacity-50">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ClipboardPaste className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm">Paste kode JSON dari AI Chatbot</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 right-4 flex gap-2">
                  {jsonText && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-900/50 hover:bg-red-800 text-red-200 text-xs h-8 border border-red-500/30 shadow-lg"
                      onClick={() => {
                        setJsonText('');
                        setIsValid(null);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      Clear
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-slate-800 hover:bg-slate-700 text-xs h-8 border border-white/10 shadow-lg"
                    onClick={handlePasteFromClipboard}
                  >
                    <ClipboardPaste className="w-3 h-3 mr-1.5" />
                    {jsonText ? 'Replace from Clipboard' : 'Paste from Clipboard'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* Validation Status */}
                <AnimatePresence mode="wait">
                  {jsonText && isValid === false && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Alert variant="destructive" className="py-2 h-auto bg-red-900/10 border-red-500/20 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="text-xs ml-2">JSON Format Invalid</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  {jsonText && isValid === true && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Alert className="py-2 h-auto bg-green-900/10 border-green-500/20 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertDescription className="text-xs ml-2">JSON Valid</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500 text-white gap-2 mt-2 shadow-blue-900/20 shadow-lg transition-all"
                  disabled={!jsonText || !isValid || isLoading}
                  onClick={handleSubmitText}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
                  Import Blueprint (Text)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-0">
              <div
                className="border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/30 min-h-[300px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-blue-500/20 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-medium text-slate-200">Upload File JSON</h3>
                  <p className="text-sm text-slate-500">Klik untuk browse atau drop file di sini</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

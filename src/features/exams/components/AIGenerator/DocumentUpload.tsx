// import { useRef, useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
// import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
// import { Progress } from '@/components/ui/progress';
// import { useAIGenerator } from '../../hooks/useAIGenerator';

// interface DocumentUploadProps {
//   onUploadComplete?: (documentId: string) => void;
// }

// export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { uploadDocument, isUploading, uploadProgress, documentId, extractedText } =
//     useAIGenerator();
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [uploadData, setUploadData] = useState<{ word_count?: number; pages?: number } | null>(null);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const allowedTypes = [
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'text/plain',
//       ];
//       const maxSize = 10 * 1024 * 1024; // 10MB

//       if (!allowedTypes.includes(file.type)) {
//         alert('Please upload a PDF, DOCX, or TXT file');
//         return;
//       }

//       if (file.size > maxSize) {
//         alert('File size must be less than 10MB');
//         return;
//       }

//       setSelectedFile(file);
//       setUploadData(null); // Reset previous upload data
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) return;

//     try {
//       const result = await uploadDocument(selectedFile);
//       // Store upload metadata for display
//       if (result && result.document_id) {
//         console.log('✅ [DocumentUpload] Upload successful, document_id:', result.document_id);
//         setUploadData({
//           word_count: result.word_count,
//           pages: result.pages
//         });
//         // Trigger callback with documentId immediately from the response
//         // This happens before hook's state updates, so we pass it directly
//         if (onUploadComplete) {
//           console.log('📤 [DocumentUpload] Calling onUploadComplete with documentId:', result.document_id);
//           onUploadComplete(result.document_id);
//         }
//       } else {
//         console.error('❌ [DocumentUpload] Upload result missing document_id:', result);
//       }
//     } catch (error) {
//       console.error('❌ [DocumentUpload] Upload failed:', error);
//       setUploadData(null);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const file = e.dataTransfer.files?.[0];
//     if (file) {
//       const event = {
//         target: { files: [file] },
//       } as any;
//       handleFileSelect(event);
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Upload Document</CardTitle>
//       </CardHeader>
//       <CardBody className="space-y-4">
//         {!documentId ? (
//           <>
//             <div
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//               className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".pdf,.doc,.docx,.txt"
//                 onChange={handleFileSelect}
//                 className="hidden"
//               />

//               <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
//               <p className="text-gray-600 mb-2">
//                 Click to upload or drag and drop
//               </p>
//               <p className="text-sm text-gray-500">
//                 PDF, DOCX, or TXT (Max 10MB)
//               </p>
//             </div>

//             {selectedFile && (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <FileText className="w-8 h-8 text-primary-500" />
//                     <div>
//                       <p className="font-medium text-gray-900 dark:text-white">
//                         {selectedFile.name}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {formatFileSize(selectedFile.size)}
//                       </p>
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedFile(null);
//                       if (fileInputRef.current) {
//                         fileInputRef.current.value = '';
//                       }
//                     }}
//                   >
//                     <X className="w-4 h-4" />
//                   </Button>
//                 </div>

//                 {isUploading && (
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-gray-600">Uploading...</span>
//                       <span className="text-gray-600">{uploadProgress}%</span>
//                     </div>
//                     <Progress value={uploadProgress} />
//                   </div>
//                 )}

//                 <Button
//                   onClick={handleUpload}
//                   disabled={isUploading}
//                   className="w-full"
//                 >
//                   {isUploading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-4 h-4 mr-2" />
//                       Upload Document
//                     </>
//                   )}
//                 </Button>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//             <div className="flex items-center gap-3 mb-2">
//               <CheckCircle2 className="w-5 h-5 text-green-600" />
//               <p className="font-medium text-green-900">Document uploaded successfully!</p>
//             </div>
//             <div className="space-y-1 mt-2">
//               {uploadData?.word_count && (
//                 <p className="text-sm text-green-700">
//                   Extracted {uploadData.word_count} words
//                   {uploadData.pages && ` • ${uploadData.pages} page${uploadData.pages !== 1 ? 's' : ''}`}
//                 </p>
//               )}
//               {!uploadData?.word_count && extractedText && (
//                 <p className="text-sm text-green-700">
//                   Extracted {extractedText.split(/\s+/).filter(w => w.length > 0).length} words
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </CardBody>
//     </Card>
//   );
// }

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAIGenerator } from '../../hooks/useAIGenerator';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument, isUploading, uploadProgress, documentId, extractedText } =
    useAIGenerator();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<{ word_count?: number; pages?: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOCX, or TXT file');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setUploadData(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadDocument(selectedFile);
      if (result && result.document_id) {
        console.log('✅ [DocumentUpload] Upload successful, document_id:', result.document_id);
        setUploadData({
          word_count: result.word_count,
          pages: result.pages
        });
        if (onUploadComplete) {
          console.log('📤 [DocumentUpload] Calling onUploadComplete with documentId:', result.document_id);
          onUploadComplete(result.document_id);
        }
      } else {
        console.error('❌ [DocumentUpload] Upload result missing document_id:', result);
      }
    } catch (error) {
      console.error('❌ [DocumentUpload] Upload failed:', error);
      setUploadData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const event = {
        target: { files: [file] },
      } as any;
      handleFileSelect(event);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  return (
    <Card className="bg-white dark:bg-gray-800 border-none shadow-md rounded-xl overflow-hidden">
      <CardHeader className="border-b dark:border-gray-700 p-5">
        <CardTitle className="text-[#00356B] dark:text-white text-lg font-bold">Upload Document</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4 p-6">
        {!documentId ? (
          <>
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-[#00356B] dark:hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50 dark:bg-gray-900/30 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Upload className="w-12 h-12 mx-auto text-gray-400 group-hover:text-[#00356B] dark:group-hover:text-blue-400 transition-colors mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOCX, or TXT (Max 10MB)
              </p>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-8 h-8 text-[#00356B] dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-2 p-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Uploading to AI Engine...</span>
                      <span className="text-[#00356B] dark:text-blue-400">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 bg-gray-100 dark:bg-gray-700" />
                  </div>
                )}

                {/* Submit Action Button */}
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-[#00356B] hover:bg-[#00254B] text-white font-semibold h-11 rounded-lg shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Success Indicator Box */
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-600 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Document uploaded successfully!</p>
            </div>
            <div className="space-y-1 mt-3 border-t dark:border-emerald-900/50 pt-2">
              {uploadData?.word_count && (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Extracted {uploadData.word_count} words
                  {uploadData.pages && ` • ${uploadData.pages} page${uploadData.pages !== 1 ? 's' : ''}`}
                </p>
              )}
              {!uploadData?.word_count && extractedText && (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Extracted {extractedText.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

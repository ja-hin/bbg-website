import { useState, useRef } from "react";
import { CloudUpload, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  onFileChange: (file: File | null) => void;
  placeholder?: string;
  className?: string;
}

export default function FileUpload({ 
  accept = ".jpg,.jpeg,.png,.pdf", 
  onFileChange, 
  placeholder = "Click to upload or drag and drop",
  className 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = allowedTypes.some(type => 
      type === fileExtension || type === mimeType
    );

    if (!isValidType) {
      alert(`Please select a valid file type: ${accept}`);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    onFileChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        dragActive || uploadedFile 
          ? "border-red-400 bg-red-50" 
          : "border-gray-300 hover:border-red-400 hover:bg-red-50",
        className
      )}
      onClick={handleClick}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {uploadedFile ? (
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div className="flex-1 text-left">
            <p className="font-medium text-green-700">{uploadedFile.name}</p>
            <p className="text-sm text-green-600">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-1">{placeholder}</p>
          <p className="text-xs text-gray-500">
            Supported formats: {accept} (Max 5MB)
          </p>
        </>
      )}
    </div>
  );
}

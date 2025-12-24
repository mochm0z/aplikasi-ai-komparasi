
import React from 'react';
import { FileData } from '../types';

interface FileUploaderProps {
  id: string;
  label: string;
  onFileSelect: (data: FileData | null) => void;
  selectedFile: FileData | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ id, label, onFileSelect, selectedFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onFileSelect({
          file,
          preview: reader.result as string,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 h-64 flex flex-col items-center justify-center cursor-pointer
          ${selectedFile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}
      >
        <input
          type="file"
          id={id}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/png, image/jpeg, application/pdf"
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center h-full w-full">
            {selectedFile.mimeType.startsWith('image/') ? (
              <img 
                src={selectedFile.preview} 
                alt="Pratinjau" 
                className="max-h-40 object-contain rounded mb-2 shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 w-full bg-white rounded shadow-inner">
                 <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
                 <span className="text-xs text-gray-500 mt-2">Dokumen PDF</span>
              </div>
            )}
            <p className="text-sm font-medium text-indigo-700 truncate w-full text-center px-4">
              {selectedFile.file.name}
            </p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onFileSelect(null);
              }}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Hapus File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-400 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">Klik untuk unggah atau seret file ke sini</p>
            <p className="text-xs text-gray-400 mt-1">Mendukung JPG, PNG, PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;

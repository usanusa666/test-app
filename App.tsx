import React, { useState, useCallback, useRef } from 'react';
import { generateOrEditImage } from './services/geminiService';
import { UploadIcon, SparklesIcon, TrashIcon, ExclamationTriangleIcon, PhotoIcon, BookOpenIcon } from './components/Icons';
import Spinner from './components/Spinner';
import RecipeView from './components/RecipeView';

interface InputImage {
  file: File;
  base64: string;
}

export default function App() {
  const [view, setView] = useState<'studio' | 'recipes'>('studio');
  const [prompt, setPrompt] = useState<string>('');
  const [inputImage, setInputImage] = useState<InputImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, etc.).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage({ file, base64: reader.result as string });
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt && !inputImage) {
      setError('Please provide a prompt or an image to start.');
      return;
    }
    if (!prompt) {
      setError('A text prompt is required for generation or editing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let imagePayload;
      if (inputImage) {
        // Strip the data URL prefix e.g., "data:image/png;base64,"
        const base64Data = inputImage.base64.split(',')[1];
        if (!base64Data) {
          throw new Error('Could not extract base64 data from the uploaded image.');
        }
        imagePayload = {
          data: base64Data,
          mimeType: inputImage.file.type,
        };
      }
      
      const resultBase64 = await generateOrEditImage(prompt, imagePayload);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, inputImage]);

  const clearInputImage = () => {
    setInputImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClear = () => {
    setPrompt('');
    clearInputImage();
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
  };

  const commonButtonClass = "w-1/2 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 focus:ring-brand-primary";
  const activeButtonClass = "bg-base-100 text-text-primary rounded-md shadow";
  const inactiveButtonClass = "text-text-secondary hover:bg-base-200/50";

  return (
    <div className="min-h-screen bg-base-100 flex flex-col md:flex-row font-sans">
      {/* Control Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-base-200 p-6 flex flex-col space-y-6 shadow-2xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Nano Banana</h1>
          <p className="text-text-secondary mt-1">{view === 'studio' ? 'Image Studio' : 'Recipe Book'}</p>
        </header>

        {/* View Switcher */}
        <div className="flex rounded-md bg-base-300 p-1">
          <button 
            onClick={() => setView('studio')} 
            className={`${commonButtonClass} ${view === 'studio' ? activeButtonClass : inactiveButtonClass}`}
            aria-pressed={view === 'studio'}
          >
            <SparklesIcon className="w-4 h-4" /> Studio
          </button>
          <button 
            onClick={() => setView('recipes')} 
            className={`${commonButtonClass} ${view === 'recipes' ? activeButtonClass : inactiveButtonClass}`}
            aria-pressed={view === 'recipes'}
          >
            <BookOpenIcon className="w-4 h-4" /> Recipes
          </button>
        </div>

        <div className="flex-grow flex flex-col space-y-6">
            {view === 'studio' ? (
                <>
                    {/* Prompt Input */}
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary mb-2">Prompt</label>
                        <textarea
                        id="prompt"
                        rows={5}
                        className="w-full bg-base-300 border border-base-100 rounded-md p-3 text-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 placeholder:text-gray-500"
                        placeholder="A photorealistic robot holding a red skateboard..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Upload Image (Optional)</label>
                        {inputImage ? (
                        <div className="relative group">
                            <img src={inputImage.base64} alt="Input preview" className="w-full h-auto rounded-md object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                            <button onClick={clearInputImage} disabled={isLoading} className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-300 transform group-hover:scale-110">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                            </div>
                        </div>
                        ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex justify-center items-center w-full h-32 px-6 border-2 border-dashed border-base-300 rounded-md cursor-pointer hover:border-brand-primary hover:bg-base-100/50 transition duration-200">
                            <div className="text-center">
                            <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-400">Click to upload an image to edit</p>
                            </div>
                            <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            disabled={isLoading}
                            />
                        </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-text-secondary flex-grow flex flex-col items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-base-300 mb-4" />
                    <p className="font-semibold">Bon Appétit!</p>
                    <p className="text-sm">Browse our collection of banana recipes in the main panel.</p>
                </div>
            )}
        </div>
        
        {/* Action Buttons */}
        {view === 'studio' && (
            <div className="space-y-3">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
                >
                    {isLoading ? (
                    <>
                        <Spinner className="w-5 h-5 mr-2"/>
                        Generating...
                    </>
                    ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate
                    </>
                    )}
                </button>
                <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-base-300 text-text-secondary font-semibold py-3 px-4 rounded-md hover:bg-base-100 disabled:opacity-50 transition duration-200"
                >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Clear All
                </button>
            </div>
        )}
      </div>

      {/* Output Panel */}
      <main className="w-full md:w-2/3 lg:w-3/4 flex-grow p-6 md:p-10 flex items-center justify-center">
        {view === 'studio' ? (
             <div className="w-full max-w-2xl h-full flex items-center justify-center">
             {isLoading ? (
                <div className="text-center">
                  <Spinner className="w-12 h-12 text-brand-primary" />
                  <p className="mt-4 text-text-secondary animate-pulse">The model is thinking...</p>
                </div>
             ) : error ? (
               <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative text-center w-full">
                 <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-2 text-red-400" />
                 <strong className="font-bold">An error occurred</strong>
                 <span className="block sm:inline mt-2">{error}</span>
               </div>
             ) : generatedImage ? (
               <div className="w-full">
                   <img src={generatedImage} alt="Generated output" className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[80vh]" />
                   <p className="text-center text-xs text-text-secondary mt-2">Click 'Clear All' to start over.</p>
               </div>
             ) : (
               <div className="text-center text-text-secondary">
                 <PhotoIcon className="w-24 h-24 mx-auto text-base-300"/>
                 <h2 className="mt-6 text-xl font-semibold text-text-primary">Welcome to the Image Studio</h2>
                 <p className="mt-2 max-w-md mx-auto">
                   Type a prompt and optionally upload an image, then click 'Generate' to see the magic happen.
                   Your generated image will appear here.
                 </p>
               </div>
             )}
           </div>
        ) : (
            <RecipeView />
        )}
      </main>
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from './Icons';
import Spinner from './Spinner';

// Define the type for the webview element to help TypeScript
type WebViewElement = HTMLElement & {
  src: string;
  addEventListener: (event: string, callback: (e: any) => void) => void;
  removeEventListener: (event: string, callback: (e: any) => void) => void;
  loadURL: (url: string) => void;
  getURL: () => string;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  isLoading: () => boolean;
};

export default function BrowserView() {
  const webviewRef = useRef<WebViewElement>(null);
  const [url, setUrl] = useState('https://www.google.com');
  const [displayUrl, setDisplayUrl] = useState('https://www.google.com');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = useCallback(() => {
    if (webviewRef.current) {
        setCanGoBack(webviewRef.current.canGoBack());
        setCanGoForward(webviewRef.current.canGoForward());
        const currentUrl = webviewRef.current.getURL();
        if (currentUrl) {
            setUrl(currentUrl);
        }
        setIsLoading(webviewRef.current.isLoading());
    }
  }, []);

  useEffect(() => {
    const webview = webviewRef.current;
    if (webview) {
        const handleDidStartLoading = () => setIsLoading(true);
        const handleDidStopLoading = () => handleNavigationStateChange();
        const handleDomReady = () => handleNavigationStateChange();
        
        webview.addEventListener('did-start-loading', handleDidStartLoading);
        webview.addEventListener('did-stop-loading', handleDidStopLoading);
        webview.addEventListener('dom-ready', handleDomReady);

        // Set initial state
        handleNavigationStateChange();

        return () => {
            webview.removeEventListener('did-start-loading', handleDidStartLoading);
            webview.removeEventListener('did-stop-loading', handleDidStopLoading);
            webview.removeEventListener('dom-ready', handleDomReady);
        };
    }
  }, [handleNavigationStateChange]);


  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    if (webviewRef.current) {
      webviewRef.current.loadURL(finalUrl);
    }
  };
  
  const handleBack = () => webviewRef.current?.goBack();
  const handleForward = () => webviewRef.current?.goForward();
  const handleReload = () => webviewRef.current?.reload();

  const navButtonClass = "p-2 rounded-md text-text-secondary hover:bg-base-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="w-full h-full flex flex-col bg-base-300 rounded-lg overflow-hidden shadow-lg">
      {/* Browser Controls */}
      <div className="flex items-center gap-2 p-2 bg-base-200 border-b border-base-100">
        <button onClick={handleBack} disabled={!canGoBack} className={navButtonClass} aria-label="Back">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={handleForward} disabled={!canGoForward} className={navButtonClass} aria-label="Forward">
          <ArrowRightIcon className="w-5 h-5" />
        </button>
        <button onClick={handleReload} className={navButtonClass} aria-label="Reload">
          {isLoading ? <Spinner className="w-5 h-5" /> : <ArrowPathIcon className="w-5 h-5" />}
        </button>
        <form onSubmit={handleUrlSubmit} className="flex-grow">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Enter a URL"
            className="w-full bg-base-100 text-text-primary rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </form>
      </div>
      
      {/* Webview */}
      <div className="flex-grow relative">
        {/* The webview tag is specific to Electron. We cast the ref to 'any' to avoid TypeScript errors
            if the specific webview types are not globally declared. */}
        <webview
          ref={webviewRef as any}
          src={displayUrl}
          className="w-full h-full absolute inset-0 bg-white"
        />
      </div>
    </div>
  );
}